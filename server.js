import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/index.js";
import cors from "cors"; // Import the cors middleware

const app = express();

// Define __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000; // Use environment variable for port

// CORS configuration (Crucial!)
const corsOptions = {
  origin: "http://localhost:5173", // Allow requests from your React app's origin
  methods: "GET,POST,PUT,DELETE", // Specify allowed HTTP methods (important!)
  credentials: true, // If you need to send cookies or authentication headers (often needed)
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api", router);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log("Received kill signal, shutting down gracefully.");
  server.close(() => {
    console.log("Closed out remaining connections.");
    process.exit(0);
  });

  // If after 10 seconds, forcefully shut down the process
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
