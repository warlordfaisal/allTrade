import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import process from "process";
import { spawn, execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serverProcess;
let mainWindow;

// Function to start the Node.js server
// async function startServer() {
//   try {
//     // Check if port 3000 is in use and free it if necessary
//     let killCommand;
//     if (process.platform === "win32") {
//       killCommand = `for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /f /pid %%a`;
//     } else {
//       killCommand = `kill -9 $(lsof -ti:3000)`; // For Linux/macOS
//     }

//     execSync(killCommand, { stdio: "ignore" });
//     console.log("✅ Port 3000 cleared.");
//   } catch (error) {
//     console.error("⚠️ Failed to free port 3000:", error.message);
//   }

//   console.log("🚀 Starting server...");
//   serverProcess = spawn("node", ["server.js"], { cwd: __dirname });

//   serverProcess.stdout.on("data", (data) => {
//     console.log(`📢 Server: ${data.toString().trim()}`);
//   });

//   serverProcess.stderr.on("data", (data) => {
//     console.error(`❌ Server error: ${data.toString().trim()}`);
//   });

//   serverProcess.on("close", (code) => {
//     if (code !== 0) console.error(`Server process exited with code ${code}`);
//   });
// }

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
  await //startServer(); // Start the server
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
  event.preventDefault();

  console.log("Shutting down processes...");

  if (serverProcess) {
    console.log("Stopping server.js...");
    serverProcess.kill("SIGTERM"); // Use SIGTERM for graceful shutdown

    setTimeout(() => {
      try {
        execSync("npx kill-port 3000", { stdio: "ignore" });
        console.log("Port 3000 freed.");
      } catch (error) {
        console.error("Failed to free port 3000:", error.message);
      }
    }, 500); // Reduce delay
  }

  setTimeout(() => {
    console.log("Exiting...");
    app.exit(); // Use app.exit() for process exit
  }, 1000);
});
