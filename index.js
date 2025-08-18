const express = require('express');
const fs = require("fs");
const path = require('path');
const { Worker } = require("worker_threads");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3200;

// Keep track of active CPU load tasks
let activeCpuLoad = 0;

// Load books.json
const books = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "books.json"), "utf-8")
);


// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Service is healthy", uptime: process.uptime() });
});


// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});


// Simulate high CPU usage
app.get("/cpu-load", async (req, res) => {
  const start = Date.now();
  const durationSec = 300;
  const durationMs = durationSec * 1000;

  // Increment active load when a new CPU burn starts
  activeCpuLoad += 1;
  console.log(`[CPU LOAD START] Active load: ${activeCpuLoad}, Duration: ${durationSec}s`);

  // Run CPU-intensive work in small chunks
  function loop() {
    if (Date.now() - start >= durationMs) {
      activeCpuLoad -= 1; // decrement when done
      console.log(`[CPU LOAD END] Active load: ${activeCpuLoad}`);
      return;
    }

    // CPU work chunk
    let x = 0;
    for (let i = 0; i < 1e6; i++) {
      x += Math.sqrt(i);
    }

    setImmediate(loop); // yield to event loop
  }

  loop();

  res.json({ message: `CPU load started for ${durationSec}s` });
});


// Search endpoint with artificial delay (800-1500ms)
app.get("/books/search", async (req, res) => {
  const search = (req.query.search || "").toLowerCase();

  if (!search) {
    return res.status(400).json({ error: "Query 'search' is required" });
  }

  // Simulate processing delay
  const delay = Math.floor(Math.random() * 700) + 800;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Simulate additional delay proportional to active CPU tasks
  const delayMs = activeCpuLoad * 200;
  console.log(`[SEARCH] Active CPU load: ${activeCpuLoad}, Adding delay: ${delayMs}ms`);

  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  const results = books.filter(
    (book) =>
      book.title.toLowerCase().includes(search) ||
      book.description.toLowerCase().includes(search)
  );

  console.log(`[SEARCH RESULT] Found ${results.length} books for "${search}"`);
  res.json({ query: search, results, count: results.length });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});