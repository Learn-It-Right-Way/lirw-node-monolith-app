const express = require('express');
const fs = require("fs");
const path = require('path');
const data = require('./books');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configs
const PORT = process.env.PORT || 3200;
const NORMAL_CPU_MS = 5;          // normal day
const BLACK_FRIDAY_CPU_MS = 90 * 1000;  // heavy logic
const MAX_CONCURRENT_WORK = 10;   // safety guard
const { books } = data;

// State
let activeWork = 0;

const burnCpuChunked = (durationMs) => {
  const end = Date.now() + durationMs;
  activeWork++;

  const work = () => {
    if (Date.now() >= end) {
      activeWork--;
      return;
    }

    // CPU-heavy computation chunk
    let x = 0;
    for (let i = 0; i < 5e5; i++) {
      x += Math.sqrt(i);
    }

    // Yield back to event loop
    setImmediate(work);
  }

  work();
}

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Service is healthy", uptime: process.uptime() });
});

// Simulate high CPU usage
app.get("/books", async (req, res) => {
  const search = (req.query.search || "").toLowerCase();
  const isBlackFriday = req.query.isBlackFriday === "true";
  const cpuDuration = isBlackFriday ? BLACK_FRIDAY_CPU_MS : NORMAL_CPU_MS;

  console.log(`Received /books request. isBlackFriday=${isBlackFriday}, cpuDuration=${cpuDuration}ms`);

  if (activeWork >= MAX_CONCURRENT_WORK) {
    console.warn("Max concurrent work limit reached. Rejecting request.");
    return res.status(503).json({ error: "Service under heavy load. Please try again later." });
  }

  console.log(`/books request starting. Active work count: ${activeWork}`);

  try {
    burnCpuChunked(cpuDuration);

    const results = books.filter(book =>
      book.title.toLowerCase().includes(search) ||
      book.description.toLowerCase().includes(search)
    );

    console.log(`/books request processed. Found ${results.length} results for search="${search}"`);
    res.status(200).json({ query: search, results, count: results.length });
  } catch (error) {
    console.error("Error processing /books request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});