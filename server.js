import express from 'express';
import path from 'path';
import http from 'http';
import https from 'https';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(express.json());

// Keep-Alive Ping Endpoint
app.get('/ping', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'browserkit-toolkit',
    timestamp: new Date().toISOString(),
    keepAlive: true,
    message: 'Render keep-alive ping received',
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});

const distPath = path.join(__dirname, 'dist');
const publicPath = path.join(__dirname, 'public');

// Fail-safe helper for serving text/xml files
function serveStaticFile(res, fileName, mimeType) {
  res.header('Access-Control-Allow-Origin', '*');
  res.type(mimeType);

  const distFile = path.join(distPath, fileName);
  const publicFile = path.join(publicPath, fileName);

  if (fs.existsSync(distFile)) {
    return res.sendFile(distFile);
  } else if (fs.existsSync(publicFile)) {
    return res.sendFile(publicFile);
  } else {
    // Fail-safe inline content if static files not found
    if (fileName === 'sitemap.xml') {
      return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://browserkit.co.in/</loc><lastmod>2026-08-08</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>https://browserkit.co.in/heic-to-jpg</loc><lastmod>2026-08-08</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://browserkit.co.in/convert-heic-to-jpg-mac</loc><lastmod>2026-08-08</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://browserkit.co.in/png-to-webp</loc><lastmod>2026-08-08</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://browserkit.co.in/png-to-ico-favicon</loc><lastmod>2026-08-08</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://browserkit.co.in/compress-pdf-to-200kb</loc><lastmod>2026-08-08</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://browserkit.co.in/remove-pdf-password</loc><lastmod>2026-08-08</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://browserkit.co.in/unlock-pdf-online</loc><lastmod>2026-08-08</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://browserkit.co.in/unlock-zip-file</loc><lastmod>2026-08-08</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://browserkit.co.in/remove-zip-password</loc><lastmod>2026-08-08</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://browserkit.co.in/compress-image-under-100kb</loc><lastmod>2026-08-08</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://browserkit.co.in/passport-photo-crop-2x2</loc><lastmod>2026-08-08</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://browserkit.co.in/passport-photo-maker</loc><lastmod>2026-08-08</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://browserkit.co.in/trim-video-without-watermark</loc><lastmod>2026-08-08</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://browserkit.co.in/guides</loc><lastmod>2026-08-08</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
  <url><loc>https://browserkit.co.in/privacy</loc><lastmod>2026-08-08</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>https://browserkit.co.in/terms</loc><lastmod>2026-08-08</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>
</urlset>`);
    } else if (fileName === 'robots.txt') {
      return res.send(`User-agent: *\nAllow: /\n\nSitemap: https://browserkit.co.in/sitemap.xml`);
    } else if (fileName === 'ads.txt') {
      return res.send(`google.com, ca-pub-8087434803774295, DIRECT, f08c47fec0942fa0`);
    }
    return res.status(404).send('Not Found');
  }
}

// Dedicated route for sitemap.xml with explicit application/xml header
app.get('/sitemap.xml', (req, res) => {
  serveStaticFile(res, 'sitemap.xml', 'application/xml');
});

// Dedicated route for robots.txt with explicit text/plain header
app.get('/robots.txt', (req, res) => {
  serveStaticFile(res, 'robots.txt', 'text/plain');
});

// Dedicated route for ads.txt with explicit text/plain header
app.get('/ads.txt', (req, res) => {
  serveStaticFile(res, 'ads.txt', 'text/plain');
});

// Serve static assets from Vite build dist directory
app.use(express.static(distPath));

// Fallback all SPA routes to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[BrowserKit Server] Running on http://0.0.0.0:${PORT}`);
  console.log(`[Keep-Alive] /ping route ready (40s interval handler active)`);

  // Start 24/7 Server-side Self-Ping to keep Render instance awake
  const PING_INTERVAL_MS = 40000; // 40 seconds
  setInterval(() => {
    const externalUrl = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL;
    const targetUrl = externalUrl ? `${externalUrl}/ping` : `http://127.0.0.1:${PORT}/ping`;
    const protocol = targetUrl.startsWith('https') ? https : http;

    const req = protocol.get(targetUrl, (res) => {
      res.on('data', () => {});
    });
    req.on('error', () => {
      // Quiet error handle
    });
    req.end();
  }, PING_INTERVAL_MS);
});
