import { app, BrowserWindow } from "electron";
import path from "path";
import { exec, execSync } from "child_process";
import { fileURLToPath } from "url";
import fs from "fs";

// Define __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serverProcess;
let postgresProcess;
let mainWindow;

// PostgreSQL Paths
const postgresPath = path.join(__dirname, "postgresql", "bin", "pg_ctl");
const initdbPath = path.join(__dirname, "postgresql", "bin", "initdb");
const dataPath = path.join(__dirname, "postgresql", "data");
const logFilePath = path.join(
  __dirname,
  "postgresql",
  "logs",
  "postgresql.log"
);

// Function to check if PostgreSQL is initialized
function isDatabaseInitialized() {
  return fs.existsSync(path.join(dataPath, "PG_VERSION"));
}

// Function to check if PostgreSQL is running
function isPostgresRunning() {
  try {
    execSync(`"${postgresPath}" status -D "${dataPath}"`, { stdio: "ignore" });
    return true; // PostgreSQL is running
  } catch {
    return false; // PostgreSQL is not running
  }
}

// Initialize PostgreSQL if needed
async function initializeDatabase() {
  if (!isDatabaseInitialized()) {
    console.log("Initializing PostgreSQL database...");
    try {
      execSync(`"${initdbPath}" -D "${dataPath}"`, { stdio: "inherit" });
      console.log("Database initialized successfully.");
    } catch (error) {
      console.error("Failed to initialize PostgreSQL database:", error);
      return;
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
      console.error(
        "Check the PostgreSQL log file for more details:",
        logFilePath
      );
      return;
    }
  } else {
    console.log("PostgreSQL is already running.");
  }
}

// Function to start the Node.js server
async function startServer() {
  console.log("Checking if port 3000 is in use...");

  try {
    // Kill any process already using port 3000
    execSync("npx kill-port 3000", { stdio: "ignore" });
    console.log("✅ Port 3000 cleared.");
  } catch (error) {
    console.error("⚠️ Failed to free port 3000:", error.message);
  }

  console.log("🚀 Starting server...");
  serverProcess = exec("node server.js", { cwd: __dirname });

  // Clean up and format console logs
  serverProcess.stdout.on("data", (data) => {
    console.log(`📢 Server: ${data.toString().trim()}`);
  });

  serverProcess.stderr.on("data", (data) => {
    console.error(`❌ Server error: ${data.toString().trim()}`);
  });

  serverProcess.on("close", (code) => {
    if (code !== 0) console.error(`Server process exited with code ${code}`);
  });
}

// Create Electron window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL("http://localhost:5173");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Handle app startup
app.whenReady().then(async () => {
  try {
    await initializeDatabase();
    await startServer();
  } catch (error) {
    console.error("Failed to initialize database or start server:", error);
  }
  createWindow();
});

// Handle app close
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Handle reactivation (macOS)
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Stop processes before quitting
app.on("will-quit", (event) => {
  event.preventDefault(); // Prevent default quit behavior

  console.log("Shutting down processes...");

  // 🔴 Ensure server.js is properly terminated
  if (serverProcess) {
    console.log("Stopping server.js...");
    serverProcess.kill("SIGKILL"); // Use SIGKILL instead of SIGTERM
    setTimeout(() => {
      try {
        execSync("npx kill-port 3000", { stdio: "ignore" });
        console.log("Port 3000 freed.");
      } catch (error) {
        console.error("Failed to free port 3000:", error.message);
      }
    }, 500); // Reduce delay to avoid lingering processes
  }

  // 🔴 Stop PostgreSQL safely
  if (isPostgresRunning()) {
    console.log("Stopping PostgreSQL...");
    try {
      execSync(`"${postgresPath}" stop -D "${dataPath}"`, { stdio: "inherit" });
      console.log("PostgreSQL stopped.");
    } catch (error) {
      console.error("Failed to stop PostgreSQL:", error.message);
    }
  }

  // 🔴 Ensure all Node.js processes are killed **before** quitting Electron
  try {
    execSync("taskkill /F /IM node.exe /T", { stdio: "ignore" });
    console.log("Force killed all Node.js processes.");
  } catch (error) {
    console.error("Failed to force kill Node.js:", error.message);
  }

  // 🔴 Exit Electron after cleanup
  setTimeout(() => {
    console.log("Exiting...");
    app.exit(); // Use app.exit() instead of app.quit() to ensure process exit
  }, 1000);
});
