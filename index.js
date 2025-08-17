const express = require('express');
const fs = require("fs");
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3200;

// Load books.json
const books = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "books.json"), "utf-8")
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Service is healthy", uptime: process.uptime() });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
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

  const results = books.filter(
    (book) =>
      book.title.toLowerCase().includes(search) ||
      book.description.toLowerCase().includes(search)
  );

  res.json({ query: search, results, count: results.length });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});