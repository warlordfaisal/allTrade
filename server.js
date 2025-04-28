import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/index.js";
import cors from "cors";
import process from "process";
import { execSync } from "child_process";
import fs from "fs";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;

const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
};

const postgresPath = path.join(__dirname, "postgresql", "bin", "pg_ctl");
const initdbPath = path.join(__dirname, "postgresql", "bin", "initdb");
const dataPath = path.join(__dirname, "postgresql", "data");
const logFilePath = path.join(
  __dirname,
  "postgresql",
  "logs",
  "postgresql.log"
);

function isDatabaseInitialized() {
  return fs.existsSync(path.join(dataPath, "PG_VERSION"));
}

function isPostgresRunning() {
  try {
    execSync(`"${postgresPath}" status -D "${dataPath}"`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function initializeDatabase() {
  if (!isDatabaseInitialized()) {
    console.log("Initializing PostgreSQL database...");
    try {
      execSync(`"${initdbPath}" -D "${dataPath}"`, { stdio: "inherit" });
      console.log("Database initialized successfully.");
    } catch (error) {
      console.error("Failed to initialize PostgreSQL database:", error);
      throw error;
    }
  } else {
    console.log("Database already initialized.");
  }

  if (!isPostgresRunning()) {
    console.log("Starting PostgreSQL...");
    try {
      execSync(`"${postgresPath}" start -D "${dataPath}" -l "${logFilePath}"`, {
        stdio: "inherit",
      });
      console.log("PostgreSQL started successfully.");
    } catch (error) {
      console.error("Failed to start PostgreSQL:", error);
      throw error;
    }
  } else {
    console.log("PostgreSQL is already running.");
  }
}

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api", router);

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
});

async function startServer() {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1); // Exit if database initialization fails
  }
}

startServer();

const gracefulShutdown = () => {
  console.log("Received kill signal, shutting down gracefully.");
  server.close(() => {
    console.log("Closed out remaining connections.");
    process.exit(0);
  });

  if (isPostgresRunning()) {
    console.log("Stopping PostgreSQL...");
    try {
      execSync(`"${postgresPath}" stop -D "${dataPath}"`, { stdio: "inherit" });
      console.log("PostgreSQL stopped.");
    } catch (error) {
      console.error("Failed to stop PostgreSQL:", error.message);
    }
  }

  // Optional: Force kill Node.js processes
  try {
    execSync("taskkill /F /IM node.exe /T", { stdio: "ignore" });
    console.log("Force killed all Node.js processes.");
  } catch (error) {
    console.error("Failed to force kill Node.js:", error.message);
  }

  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
