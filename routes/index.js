import "dotenv/config";
import express from "express";
import pkg from "pg";

const { Pool } = pkg;

const router = express.Router();

// Default database connection using superuser credentials
const defaultPool = new Pool({
  user: process.env.SUPERUSER_DB_USER,
  host: process.env.SUPERUSER_DB_HOST,
  database: process.env.DEFAULT_DB_NAME, // Default database name
  password: process.env.SUPERUSER_DB_PASSWORD,
  port: process.env.SUPERUSER_DB_PORT || 5432,
});

// Function to create the default tables
async function createDefaultTables() {
  try {
    await defaultPool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
      );
    `);
    console.log("Default tables created or already exist.");

    // Verify if the 'companies' table was created
    const res = await defaultPool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'companies';
    `);

    if (res.rows.length > 0) {
      console.log("The 'companies' table exists in the default database.");
    } else {
      console.log(
        "The 'companies' table does not exist in the default database."
      );
    }
  } catch (error) {
    console.error("Error creating default tables:", error);
    process.exit(1);
  }
}
createDefaultTables(); // Call the function to create default tables

// Function to create a new company database
async function createCompanyDatabase(companyName) {
  const newDatabaseName = `company_${companyName
    .toLowerCase()
    .replace(/\s+/g, "_")}`;
  const newDatabaseUser = `user_${companyName
    .toLowerCase()
    .replace(/\s+/g, "_")}`;
  const newDatabasePassword = `password_${companyName}`;

  try {
    // Connect to the PostgreSQL superuser
    await defaultPool.query(`CREATE DATABASE ${newDatabaseName}`);
    console.log(`Database ${newDatabaseName} created successfully.`);

    // Create a new user for the company's database
    await defaultPool.query(
      `CREATE USER ${newDatabaseUser} WITH ENCRYPTED PASSWORD '${newDatabasePassword}'`
    );
    console.log(`User ${newDatabaseUser} created successfully.`);

    // Grant all privileges on the new database to the new user
    await defaultPool.query(
      `GRANT ALL PRIVILEGES ON DATABASE ${newDatabaseName} TO ${newDatabaseUser}`
    );
    console.log(
      `Granted all privileges on ${newDatabaseName} to ${newDatabaseUser}.`
    );

    // Return the new database connection details
    return {
      user: newDatabaseUser,
      host: process.env.SUPERUSER_DB_HOST,
      database: newDatabaseName,
      password: newDatabasePassword,
      port: process.env.SUPERUSER_DB_PORT,
    };
  } catch (error) {
    console.error("Error creating company database:", error);
    throw error;
  }
}

// Example route to create a new company
router.post("/create-company", async (req, res) => {
  const { companyName } = req.body;

  if (!companyName) {
    return res.status(400).json({ message: "Company name is required" });
  }

  try {
    const connectionDetails = await createCompanyDatabase(companyName);
    // Optionally, store the new company's database details in the default database's companies table
    await defaultPool.query(`INSERT INTO companies (name) VALUES ($1)`, [
      companyName,
    ]);
    res
      .status(201)
      .json({ message: "Company database created", connectionDetails });
  } catch (error) {
    res.status(500).json({
      message: "Error creating company database",
      error: error.message,
    });
  }
});

// Route to fetch the list of companies
router.get("/companies", async (req, res) => {
  try {
    const result = await defaultPool.query("SELECT * FROM companies"); // Query the default database
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching companies:", error); // Log the full error object
    res
      .status(500)
      .json({ message: "Error fetching companies", error: error.message });
  }
});

export default router;
