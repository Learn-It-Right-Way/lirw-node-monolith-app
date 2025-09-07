const express = require('express');
const path = require('path');
const os = require("os");

const app = express();
const PORT = 3200;

// ECS metadata endpoint (works in both Fargate & EC2)
const ECS_METADATA_URL = process.env.ECS_CONTAINER_METADATA_URI_V4 || process.env.ECS_CONTAINER_METADATA_URI;

// EC2 metadata endpoint (only available for EC2 launch type)
const EC2_METADATA_URL = "http://169.254.169.254/latest/meta-data/instance-id";

const hostname = os.hostname() || "Unknown";

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Service is healthy", uptime: process.uptime() });
});

app.get("/metadata", async (req, res) => {
  let instanceId = "Unknown";
  let taskId = "Unknown";
  let launchType = "local";

  try {
    // Try ECS Task Metadata
    if (ECS_METADATA_URL) {
      launchType = "Fargate";

      const response = await fetch(`${ECS_METADATA_URL}/task`);
      const data = await response.json();

      // Extract ECS Task ID
      if (data?.TaskARN) {
        taskId = data.TaskARN.split("/").pop();
      }
    }

    // Try EC2 Instance Metadata
    try {
      const response = await fetch(EC2_METADATA_URL, { timeout: 1000 });
      if (response.ok) {
        launchType = "EC2";
        instanceId = await response.text();
      }
    } catch {
      // No EC2 metadata
      console.log("No EC2 metadata");
    }

    res.json({
      launchType,
      instanceId,
      taskId,
      hostname,
    });

  } catch (err) {
    console.error("Metadata fetch error:", err);
    res.status(500).json({ error: "Unable to fetch metadata" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});