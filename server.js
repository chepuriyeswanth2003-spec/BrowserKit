import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(express.json());

// Keep-Alive Ping Endpoint (used by client every 40s to prevent Render 50s spin down)
app.get('/ping', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'browserkit-toolkit',
    timestamp: new Date().toISOString(),
    keepAlive: true,
    message: 'Render free tier keep-alive ping received',
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});

// Serve static assets from Vite build dist directory
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback all SPA routes to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[BrowserKit Server] Running on http://0.0.0.0:${PORT}`);
  console.log(`[Keep-Alive] /ping route ready (40s interval handler active)`);
});
