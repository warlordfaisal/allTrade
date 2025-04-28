import "dotenv/config";
import express from "express";
import pkg from "pg";
import { PrismaClient } from "@prisma/client";
import process from "process";
import crypto from "crypto";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const router = express.Router();
const { Pool } = pkg;

// ----------------------------- CONFIGURATION -----------------------------

// Default Superuser Database Connection
const defaultPool = new Pool({
  user: process.env.SUPERUSER_DB_USER,
  host: process.env.SUPERUSER_DB_HOST,
  database: process.env.DEFAULT_DB_NAME,
  password: process.env.SUPERUSER_DB_PASSWORD,
  port: process.env.SUPERUSER_DB_PORT || 5432,
});

let prisma; // Single Prisma client instance
let companyDbPool = null; // Single company database pool

// ----------------------------- UTILITY FUNCTIONS -----------------------------

/**
 * Generates a secure random password.
 * @param {number} length - Length of the password in bytes (default: 16).
 * @returns {string} Hex-encoded password.
 */
function generateSecurePassword(length = 16) {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Sanitizes a name to be safe for database/user names.
 * @param {string} name - Input name.
 * @returns {string} Sanitized name (lowercase, alphanumeric, underscores).
 */
function sanitizeDbName(name) {
  return name.toLowerCase().replace(/[^a-z0-9_]/g, "");
}

/**
 * Initializes Prisma client for a specific database.
 * @param {string} dbUser - Database user.
 * @param {string} dbPassword - Database password.
 * @param {string} dbName - Database name.
 */
async function initializePrisma(dbUser, dbPassword, dbName) {
  console.log(`Initializing Prisma for ${dbName} with user ${dbUser}`);
  const connectionUrl = `postgresql://${dbUser}:${dbPassword}@${
    process.env.SUPERUSER_DB_HOST
  }:${process.env.SUPERUSER_DB_PORT || 5432}/${dbName}`;

  try {
    if (prisma) {
      console.log("Disconnecting existing Prisma client...");
      await prisma.$disconnect();
    }

    prisma = new PrismaClient({
      datasources: {
        db: {
          url: connectionUrl,
        },
      },
    });
    await prisma.$connect();
    console.log("Prisma client connected successfully");
  } catch (error) {
    console.error("Error initializing Prisma:", error);
    throw error;
  }
}

// ----------------------------- DATABASE SETUP -----------------------------

/**
 * Ensures the default `companies` table exists in the default database.
 */
async function createDefaultTables() {
  try {
    await defaultPool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        database_name TEXT UNIQUE NOT NULL,
        db_user TEXT NOT NULL,
        db_password TEXT NOT NULL,
        gst TEXT,
        company_address TEXT,
        contact TEXT,
        contact_person TEXT,
        city TEXT,
        pin_code TEXT,
        state TEXT
      );
    `);
    console.log("✅ Default tables ensured.");
  } catch (error) {
    console.error("❌ Error creating default tables:", error);
    process.exit(1);
  }
}
createDefaultTables();

// ----------------------------- COMPANY MANAGEMENT -----------------------------

/**
 * Creates a new company database, user, and initial data.
 * @param {Object} companyData - Company details (companyName, gst, etc.).
 * @returns {Object} Connection details (dbName, dbUser, dbPassword).
 */
async function createCompanyDatabase(companyData) {
  const {
    companyName,
    gst,
    companyAddress,
    contact,
    contactPerson,
    city,
    pinCode,
    state,
  } = companyData;
  const dbName = sanitizeDbName(`company_${companyName}`);
  const dbUser = sanitizeDbName(`user_${companyName}`);
  const dbPassword = generateSecurePassword();

  let client;
  try {
    // Create database
    client = await defaultPool.connect();
    await client.query(`CREATE DATABASE ${dbName}`);
    console.log(`✅ Database ${dbName} created.`);

    // Run Prisma migrations
    const dynamicDatabaseUrl = `postgresql://${process.env.SUPERUSER_DB_USER}:${
      process.env.SUPERUSER_DB_PASSWORD
    }@${process.env.SUPERUSER_DB_HOST}:${
      process.env.SUPERUSER_DB_PORT || 5432
    }/${dbName}?schema=public`;

    const migrateCommand = "npx prisma migrate deploy --name initial";
    const env = { ...process.env, DATABASE_URL: dynamicDatabaseUrl };

    console.log("Running Prisma Migrate:", migrateCommand);
    const { stdout, stderr } = await execAsync(migrateCommand, {
      cwd: process.cwd(),
      env,
    });

    console.log("Prisma Migrate stdout:", stdout);
    if (stderr) {
      console.error("Prisma Migrate stderr:", stderr);
      throw new Error(`Prisma Migrate failed: ${stderr}`);
    }
    console.log("✅ Prisma Migrate completed successfully");

    // Insert initial company info
    const companyPrisma = new PrismaClient({
      datasources: {
        db: { url: dynamicDatabaseUrl },
      },
    });
    try {
      await companyPrisma.$connect();
      await companyPrisma.companyInfo.create({
        data: {
          name: companyName,
          gst,
          address: companyAddress,
          contact,
          contactPerson,
          city,
          pinCode,
          state,
        },
      });
      console.log(`✅ Initial data inserted into 'company_info' in ${dbName}.`);
    } finally {
      await companyPrisma.$disconnect();
    }

    // Create database user and grant privileges
    const checkUserExists = await defaultPool.query(
      `SELECT 1 FROM pg_roles WHERE rolname = $1`,
      [dbUser]
    );
    if (checkUserExists.rowCount === 0) {
      await defaultPool.query(
        `CREATE USER ${dbUser} WITH ENCRYPTED PASSWORD '${dbPassword}'`
      );
    }
    await defaultPool.query(
      `GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser}`
    );

    // Store company details in default database
    await defaultPool.query(
      `INSERT INTO companies (name, database_name, db_user, db_password, gst, company_address, contact, contact_person, city, pin_code, state)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        companyName,
        dbName,
        dbUser,
        dbPassword,
        gst,
        companyAddress,
        contact,
        contactPerson,
        city,
        pinCode,
        state,
      ]
    );

    return { dbName, dbUser, dbPassword };
  } catch (error) {
    console.error("❌ Error creating company database:", error);
    if (client) {
      await client.query(`DROP DATABASE IF EXISTS ${dbName}`);
    }
    throw error;
  } finally {
    if (client) client.release();
  }
}

/**
 * Switches to a company's database and initializes Prisma.
 * @param {number} companyId - ID of the company.
 * @returns {Object} Response with status and connection details.
 */
async function switchDatabase(companyId) {
  try {
    const result = await defaultPool.query(
      "SELECT * FROM companies WHERE id = $1",
      [companyId]
    );
    if (result.rows.length === 0) {
      return { status: 404, message: "❌ Company not found" };
    }

    const company = result.rows[0];

    // Close existing company pool if it exists
    if (companyDbPool) {
      console.log("Closing existing companyDbPool...");
      await companyDbPool.end();
      companyDbPool = null;
    }

    // Create new connection pool
    companyDbPool = new Pool({
      user: process.env.SUPERUSER_DB_USER,
      host: process.env.SUPERUSER_DB_HOST,
      database: company.database_name,
      password: company.db_password,
      port: process.env.SUPERUSER_DB_PORT || 5432,
    });

    // Test connection
    const testClient = await companyDbPool.connect();
    try {
      console.log(`✅ Successfully connected to ${company.database_name}`);
    } finally {
      testClient.release();
    }

    return {
      status: 200,
      message: `✅ Switched to ${company.name}`,
      connectionDetails: {
        database: company.database_name,
        user: process.env.SUPERUSER_DB_USER,
      },
      companyId: company.id,
    };
  } catch (error) {
    console.error("❌ Error switching database:", error);
    return {
      status: 500,
      message: "❌ Error switching database",
      error: error.message,
    };
  }
}

// Company APIs
router.post("/create-company", async (req, res) => {
  const { companyName } = req.body;
  if (!companyName) {
    return res.status(400).json({ message: "Company name is required" });
  }

  try {
    const connectionDetails = await createCompanyDatabase(req.body);
    res.status(201).json({
      message: "✅ Company database created successfully",
      connectionDetails,
    });
  } catch (error) {
    res.status(500).json({
      message: "❌ Error creating company database",
      error: error.message,
    });
  }
});

router.get("/companies", async (req, res) => {
  try {
    const result = await defaultPool.query("SELECT id, name FROM companies");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: "❌ Error fetching companies",
      error: error.message,
    });
  }
});

router.post("/switch-database", async (req, res) => {
  const { companyId } = req.body;
  if (!companyId) {
    return res.status(400).json({ message: "Company ID is required" });
  }

  try {
    const response = await switchDatabase(companyId);
    if (response.status === 200) {
      const companyDetails = await defaultPool.query(
        "SELECT * FROM companies WHERE id = $1",
        [companyId]
      );
      const company = companyDetails.rows[0];
      await initializePrisma(
        response.connectionDetails.user,
        company.db_password,
        response.connectionDetails.database
      );
      res.status(200).json(response);
    } else {
      res.status(response.status).json({
        message: response.message,
        error: response.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "❌ Error switching database",
      error: error.message,
    });
  }
});

router.get("/get-company-info", async (req, res) => {
  try {
    if (!prisma) {
      return res.status(500).json({
        message: "❌ Database connection not initialized. Please switch company first",
      });
    }

    const companyInfo = await prisma.company_info.findMany({
      select: {
        name: true,
        contact_person: true,
        contact: true,
      },
    });

    if (companyInfo.length === 0) {
      return res.status(404).json({
        message: "❌ No company info found",
      });
    }

    res.status(200).json({ status: "✅ Success", data: companyInfo });
  } catch (error) {
    res.status(500).json({
      message: "❌ Error fetching company info",
      error: error.message,
    });
  }
});

// ----------------------------- BROKER MANAGEMENT -----------------------------

router.post("/broker", async (req, res) => {
  try {
    if (!prisma) {
      return res.status(500).json({
        message: "❌ Database connection not initialized. Please switch company first",
      });
    }

    const { brokerName, phone, bank, bankAccount, ifsc } = req.body;
    if (!brokerName || !phone) {
      return res.status(400).json({
        message: "❌ Broker name and phone are required",
      });
    }

    const newBroker = await prisma.broker.create({
      data: {
        brokerName,
        phone,
        bank: bank || null,
        bankAccount: bankAccount || null,
        ifsc: ifsc || null,
      },
    });

    res.status(201).json({
      message: "✅ Broker created successfully",
      data: newBroker,
    });
  } catch (error) {
    res.status(500).json({
      message: "❌ Error creating broker",
      error: error.message,
    });
  }
});

router.get("/brokers", async (req, res) => {
  try {
    if (!prisma) {
      return res.status(500).json({
        message: "❌ Database connection not initialized. Please switch company first",
      });
    }

    const brokers = await prisma.broker.findMany();
    res.status(200).json({
      message: "✅ Brokers fetched successfully",
      data: brokers,
    });
  } catch (error) {
    res.status(500).json({
      message: "❌ Error fetching brokers",
      error: error.message,
    });
  }
});

router.put("/broker/:id", async (req, res) => {
  try {
    if (!prisma) {
      return res.status(500).json({
        message: "❌ Database connection not initialized. Please switch company first",
      });
    }

    const brokerId = Number(req.params.id);
    if (isNaN(brokerId)) {
      return res.status(400).json({ message: "❌ Invalid broker ID" });
    }

    const { brokerName, phone, bank, bankAccount, ifsc } = req.body;
    if (!brokerName || !phone) {
      return res.status(400).json({
        message: "❌ Broker name and phone are required",
      });
    }

    const existingBroker = await prisma.broker.findUnique({
      where: { id: brokerId },
    });
    if (!existingBroker) {
      return res.status(404).json({ message: "❌ Broker not found" });
    }

    const updatedBroker = await prisma.broker.update({
      where: { id: brokerId },
      data: {
        brokerName,
        phone,
        bank: bank || null,
        bankAccount: bankAccount || null,
        ifsc: ifsc || null,
      },
    });

    res.status(200).json({
      message: "✅ Broker updated successfully",
      data: updatedBroker,
    });
  } catch (error) {
    res.status(500).json({
      message: "❌ Error updating broker",
      error: error.message,
    });
  }
});

router.delete("/broker/:id", async (req, res) => {
  try {
    if (!prisma) {
      return res.status(500).json({
        message: "❌ Database connection not initialized. Please switch company first",
      });
    }

    const brokerId = Number(req.params.id);
    if (isNaN(brokerId)) {
      return res.status(400).json({ message: "❌ Invalid broker ID" });
    }

    const existingBroker = await prisma.broker.findUnique({
      where: { id: brokerId },
    });
    if (!existingBroker) {
      return res.status(404).json({ message: "❌ Broker not found" });
    }

    await prisma.broker.delete({
      where: { id: brokerId },
    });

    res.status(200).json({
      message: "✅ Broker deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "❌ Error deleting broker",
      error: error.message,
    });
  }
});

// ----------------------------- WAREHOUSE MANAGEMENT -----------------------------

router.get("/warehouses", async (req, res) => {
  try {
    if (!prisma) {
      return res.status(500).json({
        message: "❌ Database connection not initialized. Please switch company first",
      });
    }

    const warehouses = await prisma.warehouse.findMany();
    res.json({ success: true, data: warehouses });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "❌ Failed to fetch warehouses",
      error: error.message,
    });
  }
});

router.post("/warehouse", async (req, res) => {
  try {
    if (!prisma) {
      return res.status(500).json({
        message: "❌ Database connection not initialized. Please switch company first",
      });
    }

    const { warehouseName, address, contactPerson, contactNum } = req.body;
    if (!warehouseName) {
      return res.status(400).json({
        message: "❌ Warehouse name is required",
      });
    }

    const newWarehouse = await prisma.warehouse.create({
      data: {
        warehouseName,
        address,
        contactPerson,
        contactNum,
      },
    });
    res.status(201).json({ success: true, data: newWarehouse });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "❌ Failed to create warehouse",
      error: error.message,
    });
  }
});

router.put("/warehouse/:id", async (req, res) => {
  try {
    if (!prisma) {
      return res.status(500).json({
        message: "❌ Database connection not initialized. Please switch company first",
      });
    }

    const { id } = req.params;
   

    const { warehouseName, address, contactPerson, contactNum } = req.body;
    if (!warehouseName) {
      return res.status(400).json({
        message: "❌ Warehouse name is required",
      });
    }

    const updated = await prisma.warehouse.update({
      where: { id: parseInt(id) },
      data: {
        warehouseName,
        address,
        contactPerson,
        contactNum,
      },
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "❌ Failed to update warehouse",
      error: error.message,
    });
  }
});

router.delete("/warehouse/:id", async (req, res) => {
  try {
    if (!prisma) {
      return res.status(500).json({
        message: "❌ Database connection not initialized. Please switch company first",
      });
    }

    const { id } = req.params;
    await prisma.warehouse.delete({
      where: { id: parseInt(id) },
    });
    res.json({ success: true, message: "✅ Warehouse deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "❌ Failed to delete warehouse",
      error: error.message,
    });
  }
});

export default router;