import pkg from "pg";
const { Pool } = pkg;

// Default superuser connection
const defaultPool = new Pool({
  user: process.env.SUPERUSER_DB_USER,
  host: process.env.SUPERUSER_DB_HOST,
  database: process.env.DEFAULT_DB_NAME,
  password: process.env.SUPERUSER_DB_PASSWORD,
  port: process.env.SUPERUSER_DB_PORT || 5432,
});

// Function to create a new company database
export async function createCompanyDatabase(companyInfo) {
  const { companyName, address, email, phone } = companyInfo;
  const dbName = `company_${companyName.replace(/\s+/g, "_").toLowerCase()}`;
  const dbUser = `user_${companyName.replace(/\s+/g, "_").toLowerCase()}`;
  const dbPassword = `password_${companyName}`;

  try {
    await defaultPool.query(`CREATE DATABASE ${dbName}`);
    await defaultPool.query(
      `CREATE USER ${dbUser} WITH ENCRYPTED PASSWORD '${dbPassword}'`
    );
    await defaultPool.query(
      `GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser}`
    );

    // Store company details in the default DB
    await defaultPool.query(
      `INSERT INTO companies (name, db_name, db_user, db_password, address, email, phone) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [companyName, dbName, dbUser, dbPassword, address, email, phone]
    );

    return { dbName, dbUser, dbPassword };
  } catch (error) {
    console.error("Error creating company database:", error);
    throw error;
  }
}

// Function to get database connection based on company ID
export async function getCompanyDatabase(companyId) {
  try {
    const res = await defaultPool.query(
      "SELECT db_name, db_user, db_password FROM companies WHERE id = $1",
      [companyId]
    );

    if (res.rows.length === 0) {
      throw new Error("Company not found");
    }

    const { db_name, db_user, db_password } = res.rows[0];

    return new Pool({
      user: db_user,
      host: process.env.SUPERUSER_DB_HOST,
      database: db_name,
      password: db_password,
      port: process.env.SUPERUSER_DB_PORT || 5432,
    });
  } catch (error) {
    console.error("Error fetching company database:", error);
    throw error;
  }
}
