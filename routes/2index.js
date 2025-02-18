import "dotenv/config";
import express from "express";
import pkg from "pg";
import process from "process";


const { Pool } = pkg;
const router = express.Router();

// Default Superuser Database Connection
const defaultPool = new Pool({
  user: process.env.SUPERUSER_DB_USER,
  host: process.env.SUPERUSER_DB_HOST,
  database: process.env.DEFAULT_DB_NAME,
  password: process.env.SUPERUSER_DB_PASSWORD,
  port: process.env.SUPERUSER_DB_PORT || 5432,
});

// Function to Create Default Tables (Runs at Startup)
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
    // Step 1: Connect to the default DB and create the new database
    const client = await defaultPool.connect();
    try {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database ${dbName} created.`);
    } finally {
      client.release();
    }

    // Step 2: Connect to the new company's database
    const companyPool = new Pool({
      user: process.env.SUPERUSER_DB_USER,
      host: process.env.SUPERUSER_DB_HOST,
      database: dbName,
      password: process.env.SUPERUSER_DB_PASSWORD,
      port: process.env.SUPERUSER_DB_PORT || 5432,
    });

    // Step 3: Create a `company_info` table inside the new company DB
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

    // Step 4: Insert the company details into the `company_info` table
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
    console.log(`✅ Company details inserted into ${dbName}.`);

    // Step 5: Create a database user (if not exists) and grant privileges
    const checkUserExists = await defaultPool.query(
      `SELECT 1 FROM pg_roles WHERE rolname = $1`,
      [dbUser]
    );

    if (checkUserExists.rowCount === 0) {
      await defaultPool.query(
        `CREATE USER ${dbUser} WITH ENCRYPTED PASSWORD '${dbPassword}'`
      );
      console.log(`✅ User ${dbUser} created.`);
    } else {
      console.log(`🔹 User ${dbUser} already exists, skipping creation.`);
    }

    await defaultPool.query(
      `GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser}`
    );

    // Step 6: Store company details in the default DB's `companies` table
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

// Route to Create a New Company
router.post("/create-company", async (req, res) => {
  const {
    companyName,
    gst,
    companyAddress,
    contact,
    contactPerson,
    city,
    pinCode,
    state,
  } = req.body;

  if (!companyName) {
    return res.status(400).json({ message: "Company name is required" });
  }

  try {
    const connectionDetails = await createCompanyDatabase({
      companyName,
      gst,
      companyAddress,
      contact,
      contactPerson,
      city,
      pinCode,
      state,
    });

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

// Route to Fetch Companies
router.get("/companies", async (req, res) => {
  try {
    const result = await defaultPool.query("SELECT id, name FROM companies");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching companies:", error);
    res
      .status(500)
      .json({ message: "Error fetching companies", error: error.message });
  }
});

// Function to Switch Database Connection
let companyDbPool = null;
async function switchDatabase(companyId) {
  try {
    const result = await defaultPool.query(
      "SELECT * FROM companies WHERE id = $1",
      [companyId]
    );

    if (result.rows.length === 0) {
      throw new Error("Company not found");
    }

    const company = result.rows[0];

    // Close previous connection
    if (companyDbPool) {
      await companyDbPool.end();
    }

    // Create a new connection pool
    companyDbPool = new Pool({
      user: company.db_user,
      host: process.env.SUPERUSER_DB_HOST,
      database: company.database_name,
      password: company.db_password,
      port: process.env.SUPERUSER_DB_PORT || 5432,
    });

    return {
      message: `✅ Switched to ${company.name}`,
      connectionDetails: {
        database: company.database_name,
        user: company.db_user,
        host: process.env.SUPERUSER_DB_HOST,
      },
    };
  } catch (error) {
    console.error("❌ Error switching database:", error);
    throw error;
  }
}

// Route to Switch Database
router.post("/switch-database", async (req, res) => {
  const { companyId } = req.body;

  if (!companyId) {
    return res.status(400).json({ message: "Company ID is required" });
  }

  try {
    const response = await switchDatabase(companyId);
    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error switching database", error: error.message });
  }
});

// Export Router and Database Connection Getter
export default router;
export const getCompanyDbPool = () => companyDbPool;
