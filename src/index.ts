import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("src/public"));

// Import DB

// Import routes
import healthRouter from "./routes/health.route.js";
import pastesRouter from "./routes/paste.route.js";

// Import model and utils at TOP - no circular dependency issue
import Paste from "./models/paste.model.js";
import { getCurrentTime, isExpired } from "./utils/time.js";

import dbConnection from "./db/config.js";
dbConnection().catch(console.error);
// API Routes
app.use("/api", healthRouter);
app.use("/api", pastesRouter);

// Serve HTML for creating paste
app.get("/", (_req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), "src/public/index.html"));
});

// View paste (HTML route)
app.get("/p/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const paste = await Paste.findById(id);

    if (!paste) {
      res.status(404).send(`
        <!DOCTYPE html>
        <html><head><title>404 - Not Found</title></head>
        <body style="font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px;">
          <h1>Paste Not Found</h1>
          <p>This paste does not exist or has been deleted.</p>
          <a href="/">← Create new paste</a>
        </body></html>
      `);
      return;
    }

    const currentTime = getCurrentTime(req);

    // Check if expired
    if (isExpired(paste.createdAt, paste.ttlSeconds, currentTime)) {
      res.status(404).send(`
        <!DOCTYPE html>
        <html><head><title>404 - Not Found</title></head>
        <body style="font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px;">
          <h1>Paste Expired</h1>
          <p>This paste has expired and is no longer available.</p>
          <a href="/">← Create new paste</a>
        </body></html>
      `);
      return;
    }

    // Check if view limit exceeded
    if (paste.maxViews !== undefined && paste.viewCount >= paste.maxViews) {
      res.status(404).send(`
        <!DOCTYPE html>
        <html><head><title>404 - Not Found</title></head>
        <body style="font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px;">
          <h1>View Limit Reached</h1>
          <p>This paste has reached its view limit and is no longer available.</p>
          <a href="/">← Create new paste</a>
        </body></html>
      `);
      return;
    }

    // Increment view count
    await Paste.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    // Escape content to prevent XSS
    const escapedContent = paste.content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>View Paste</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
          pre { background: #f5f5f5; padding: 20px; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word; }
          .info { margin: 20px 0; color: #666; }
        </style>
      </head>
      <body>
        <h1>Paste Content</h1>
        <pre>${escapedContent}</pre>
        <div class="info">
          ${
            paste.maxViews
              ? `<p>Remaining views: ${paste.maxViews - paste.viewCount}</p>`
              : ""
          }
          ${
            paste.ttlSeconds
              ? `<p>Expires at: ${new Date(
                  paste.createdAt + paste.ttlSeconds * 1000
                ).toISOString()}</p>`
              : ""
          }
        </div>
        <a href="/">← Create new paste</a>
      </body>
      </html>
    `);
    return;
  } catch (error) {
    console.error("Error viewing paste:", error);
    res.status(404).send(`
      <!DOCTYPE html>
      <html><head><title>404 - Not Found</title></head>
      <body style="font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px;">
        <h1>Error</h1>
        <p>An error occurred while retrieving this paste.</p>
        <a href="/">← Create new paste</a>
      </body></html>
    `);
  }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
