import "dotenv/config";
import express from "express";
import pkg from "pg";
import { PrismaClient } from "@prisma/client";
import process from "process"; // Import the process object

const router = express.Router();
const { Pool } = pkg;

// Default Superuser Database Connection
const defaultPool = new Pool({
  user: process.env.SUPERUSER_DB_USER,
  host: process.env.SUPERUSER_DB_HOST,
  database: process.env.DEFAULT_DB_NAME,
  password: process.env.SUPERUSER_DB_PASSWORD,
  port: process.env.SUPERUSER_DB_PORT || 5432,
});

let prisma; // Declare prisma at the top level

async function initializePrisma(dbUser, dbPassword, dbName) {
  console.log(`Initializing Prisma for ${dbName} with user ${dbUser}`);
  const connectionUrl = `postgresql://${dbUser}:${dbPassword}@${
    process.env.SUPERUSER_DB_HOST
  }:${process.env.SUPERUSER_DB_PORT || 5432}/${dbName}`;
  console.log(`Connection URL: ${connectionUrl}`);

  try {
    if (prisma) {
      console.log("Disconnecting existing Prisma client...");
      await prisma.$disconnect();
      console.log("Existing Prisma client disconnected.");
    }

    prisma = new PrismaClient({
      datasources: {
        db: {
          url: connectionUrl,
        },
      },
    });
    console.log("Creating new Prisma client...");
    await prisma.$connect();
    console.log("Prisma client connected successfully");
  } catch (error) {
    console.error("Error initializing Prisma:", error);
    throw error; // Re-throw the error
  }
}

// Ensure Default Tables Exist
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

// Function to Create a New Company Database
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
  const dbName = `company_${companyName.toLowerCase().replace(/\s+/g, "_")}`;
  const dbUser = `user_${companyName.toLowerCase().replace(/\s+/g, "_")}`;
  const dbPassword = `password_${companyName}`;

  try {
    const client = await defaultPool.connect();
    try {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database ${dbName} created.`);
    } finally {
      client.release();
    }

    const companyPool = new Pool({
      user: process.env.SUPERUSER_DB_USER,
      host: process.env.SUPERUSER_DB_HOST,
      database: dbName,
      password: process.env.SUPERUSER_DB_PASSWORD,
      port: process.env.SUPERUSER_DB_PORT || 5432,
    });

    await companyPool.query(`
      CREATE TABLE IF NOT EXISTS company_info (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        gst TEXT NOT NULL,
        address TEXT NOT NULL,
        contact TEXT NOT NULL,
        contact_person TEXT NOT NULL,
        city TEXT NOT NULL,
        pin_code TEXT NOT NULL,
        state TEXT NOT NULL
      );
    `);
    console.log(`✅ Table 'company_info' created in ${dbName}.`);

    await companyPool.query(
      `INSERT INTO company_info (name, gst, address, contact, contact_person, city, pin_code, state)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        companyName,
        gst,
        companyAddress,
        contact,
        contactPerson,
        city,
        pinCode,
        state,
      ]
    );

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
    throw error;
  }
}

// API Route to Create a New Company
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

// API Route to Fetch Companies
router.get("/companies", async (req, res) => {
  try {
    const result = await defaultPool.query("SELECT id, name FROM companies");
    res.status(200).json(result.rows);
  } catch (error) {
    res
      .status(500)
      .json({ message: "❌ Error fetching companies", error: error.message });
  }
});

// API Route to Switch Database
let companyDbPool = null;

async function switchDatabase(companyId) {
  try {
    console.log(`🔍 Checking company with ID: ${companyId}`);

    const result = await defaultPool.query(
      "SELECT * FROM companies WHERE id = $1",
      [companyId]
    );

    if (result.rows.length === 0) {
      console.log(`❌ Company ID ${companyId} not found in database.`);
      return { status: 404, message: "❌ Company not found" };
    }

    const company = result.rows[0];
    console.log(`✅ Found Company:`, company);

    // Close existing connection if exists (Important!)
    if (companyDbPool) {
      console.log("Closing existing companyDbPool...");
      await companyDbPool.end(); // Wait for the pool to close
      console.log("Existing companyDbPool closed.");
    }

    console.log(
      `Attempting to create new pool for ${company.database_name} with user ${company.db_user}`
    );

    companyDbPool = new Pool({
      user: process.env.SUPERUSER_DB_USER,
      host: process.env.SUPERUSER_DB_HOST,
      database: company.database_name,
      password: company.db_password,
      port: process.env.SUPERUSER_DB_PORT || 5432,
    });

    // Test the connection immediately after creating the pool (CRITICAL)
    try {
      const testClient = await companyDbPool.connect();
      console.log(`✅ Successfully connected to ${company.database_name}!`);
      testClient.release(); // Release the test client back to the pool
    } catch (testError) {
      console.error(
        `❌ Error testing connection to ${company.database_name}:`,
        testError
      );
      return {
        status: 500,
        message: `❌ Error connecting to database ${company.database_name}`,
        error: testError.message, // Include the specific error
      };
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
    console.error("❌ Error in switchDatabase function:", error);
    return {
      status: 500,
      message: "❌ Error switching database",
      error: error.message,
    };
  }
}

router.post("/switch-database", async (req, res) => {
  console.log("📩 Received request on /switch-database");
  console.log("📩 Request Body:", req.body);

  const { companyId } = req.body;

  if (!companyId) {
    console.log("❌ Missing companyId in request.");
    return res.status(400).json({ message: "Company ID is required" });
  }

  try {
    const response = await switchDatabase(companyId);

    if (response.status === 200) {
      try {
        const companyDetails = await defaultPool.query(
          "SELECT * FROM companies WHERE id = $1",
          [companyId]
        );
        const company = companyDetails.rows[0];

        console.log("About to initialize Prisma...");
        await initializePrisma(
          response.connectionDetails.user,
          company.db_password,
          response.connectionDetails.database
        );
        console.log("Prisma initialized.");

        return res.status(200).json(response); // Send the successful response
      } catch (prismaError) {
        console.error(
          "❌ Error initializing Prisma in /switch-database:",
          prismaError
        );
        return res.status(500).json({
          message: "❌ Error initializing Prisma",
          error: prismaError.message,
        });
      }
    } else {
      return res
        .status(response.status)
        .json({ message: response.message, error: response.error });
    }
  } catch (error) {
    console.error("❌ Error in /switch-database:", error);
    return res.status(500).json({
      message: "❌ Error switching database",
      error: error.message,
    });
  }
});

router.get("/get-company-info", async (req, res) => {
  try {
    if (!prisma) {
      return res.status(500).json({
        message:
          "❌ Database connection not initialized. Please switch company first",
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
        message:
          "❌ No company info found (even after successful Prisma initialization)",
      });
    }

    res.status(200).json({ status: "✅ Success", data: companyInfo });
  } catch (error) {
    console.error("❌ Error in /get-company-info:", error);
    res.status(500).json({
      message: "❌ Error fetching company info",
      error: error.message,
    });
  }
});

// router.get("/get-company-info", async (req, res) => {
//   console.log("Prisma in /get-company-info:", prisma);

//   try {
//     if (!prisma) {
//       return res
//         .status(500)
//         .json({ message: "Prisma not initialized. Switch company first." });
//     }

//     const companyInfo = await prisma.company_info.findMany();

//     console.log("Company Info from database:", companyInfo); // This is the crucial log!

//     if (companyInfo.length === 0) {
//       return res.status(404).json({ message: "No company info found" });
//     }

//     res.json({
//       message: "Company info fetched successfully",
//       data: companyInfo,
//     });
//   } catch (error) {
//     console.error("Error in /get-company-info:", error);
//     res
//       .status(500)
//       .json({ message: "Error fetching company info", error: error.message });
//   }
// });

export default router;
