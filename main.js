import { app, BrowserWindow } from "electron";
import path from "path";
import { exec } from "child_process";
import { fileURLToPath } from "url";

// Define __dirname and __filename for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  mainWindow.loadURL("http://localhost:5173"); // Load Vite app
}

app.whenReady().then(() => {
  // Start the Node.js server
  const server = exec("node server.js", { cwd: __dirname });

  server.stdout.on("data", (data) => {
    console.log(`Server: ${data}`);
  });

  server.stderr.on("data", (data) => {
    console.error(`Server Error: ${data}`);
  });

  server.on("close", (code) => {
    console.log(`Server process exited with code ${code}`);
  });

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
