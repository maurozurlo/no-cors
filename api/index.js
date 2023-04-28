const express = require("express");
const request = require("request");

const app = express();
const MB = 1024 * 1024;
const logInterval = 1000; // Log memory usage every 1 second
let lastLogTime = 0;

app.all("*", (req, res) => {
  // Set CORS headers: allow all origins, methods, and headers
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    req.header("access-control-request-headers")
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.send();
    return;
  }

  // Get target URL from query parameter
  const targetUrl = req.query.url;
  if (!targetUrl) {
    res.status(500).send({ error: "Target URL is missing" });
    return;
  }

  // Proxy the request to the target URL
  request({
    url: targetUrl + req.url,
    method: req.method,
    headers: { Authorization: req.header("Authorization") },
  }).pipe(res);

  // Log memory usage every logInterval milliseconds
  const now = Date.now();
  if (now - lastLogTime > logInterval) {
    const memoryUsage = process.memoryUsage();
    console.log(
      `Memory usage: rss=${(memoryUsage.rss / MB).toFixed(2)}MB, heapTotal=${(
        memoryUsage.heapTotal / MB
      ).toFixed(2)}MB, heapUsed=${(
        memoryUsage.heapUsed / MB
      ).toFixed(2)}MB`
    );
    lastLogTime = now;
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});
