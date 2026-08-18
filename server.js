import express from 'express';
import path from 'path';
import http from 'http';
import https from 'https';
import fs from 'fs';
import compression from 'compression';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security and HSTS headers middleware
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// Enable Gzip / Brotli response compression for ultra-fast network transfer
app.use(compression());

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
const knownSpaRoutes = new Set([
  '/', '/pdf-tools', '/image-tools', '/video-tools', '/zip-tools', '/guides', '/privacy', '/terms',
  '/compressor', '/converter', '/resizer', '/palette', '/meme', '/passport-photo-maker',
  '/add-name-and-dob', '/signature-resizer', '/circle-crop', '/merge-photo-signature',
  '/image-watermark', '/image-rotate-flip', '/image-effects', '/target-kb-compressor',
  '/image-dpi-converter', '/join-images', '/official-size-resizer', '/social-media-resizer',
  '/pdf-merger', '/pdf-splitter', '/pdf-compressor', '/pdf-password-remover', '/pdf-protector',
  '/images-to-pdf', '/pdf-to-jpg', '/pdf-to-word', '/pdf-to-ppt', '/pdf-to-excel',
  '/word-to-pdf', '/ppt-to-pdf', '/excel-to-pdf', '/html-to-pdf', '/pdf-editor',
  '/pdf-signer', '/pdf-metadata', '/pdf-watermark', '/pdf-rotator', '/pdf-organizer', '/pdf-to-pdfa',
  '/pdf-repair', '/pdf-page-numbers', '/pdf-ocr', '/pdf-compare', '/pdf-redact',
  '/pdf-cropper', '/pdf-forms', '/pdf-to-markdown',
  '/zip-archiver', '/zip-extractor', '/zip-password-remover', '/audio-tools',
  '/video-to-gif', '/video-trimmer', '/video-to-audio', '/audio-cutter',
  '/aspect-ratio-resizer', '/thumbnail-grabber', '/social-video-downloader', '/social-audio-extractor',
  '/video-format-swapper', '/video-codec-transcoder', '/gif-maker', '/svg-optimizer', '/file-encryptor',
  '/heic-to-jpg', '/convert-heic-to-jpg-mac', '/png-to-webp', '/svg-to-png',
  '/compress-png-online', '/compress-jpg-online', '/passport-photo-crop-2x2',
  '/merge-pdf-offline', '/split-pdf-pages', '/convert-images-to-pdf',
  '/compress-pdf-to-200kb', '/remove-pdf-password', '/unlock-pdf-online',
  '/unlock-zip-file', '/remove-zip-password', '/trim-video-without-watermark',
  '/extract-audio-mp4', '/resize-video-aspect-ratio-9-16', '/convert-video-to-mp3-320kbps',
  '/audio-cutter-ringtone-maker', '/passport-size-photo-maker', '/add-name-and-dob-on-photo',
  '/resize-signature-300-dpi', '/compress-image-to-20kb', '/compress-image-under-100kb',
  '/merge-photo-and-signature', '/png-to-ico-favicon', '/extract-video-frames', '/meme-generator-online',
  '/svg-cleaner-optimizer', '/create-zip-archive', '/extract-zip-online', '/encrypt-file-password', '/resize-image-social'
]);

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
  <url><loc>https://browserkit.co.in/</loc><lastmod>2026-08-18</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>https://browserkit.co.in/pdf-tools</loc><lastmod>2026-08-18</lastmod><changefreq>daily</changefreq><priority>0.95</priority></url>
  <url><loc>https://browserkit.co.in/image-tools</loc><lastmod>2026-08-18</lastmod><changefreq>daily</changefreq><priority>0.95</priority></url>
  <url><loc>https://browserkit.co.in/video-tools</loc><lastmod>2026-08-18</lastmod><changefreq>daily</changefreq><priority>0.95</priority></url>
  <url><loc>https://browserkit.co.in/zip-tools</loc><lastmod>2026-08-18</lastmod><changefreq>daily</changefreq><priority>0.95</priority></url>
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

// Dedicated route for llms.txt with explicit text/plain header
app.get('/llms.txt', (req, res) => {
  serveStaticFile(res, 'llms.txt', 'text/plain');
});

// Redirect trailing slash URLs to non-trailing slash URLs (301 Permanent Redirect)
app.use((req, res, next) => {
  if (req.path.length > 1 && req.path.endsWith('/')) {
    const query = req.url.slice(req.path.length);
    const safePath = req.path.slice(0, -1);
    return res.redirect(301, safePath + query);
  }
  next();
});

// Serve static assets with aggressive HTTP Cache-Control headers
app.use(
  express.static(distPath, {
    maxAge: '1y',
    etag: true,
    immutable: true,
    setHeaders: (res, filepath) => {
      if (filepath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  })
);

// Fallback all SPA routes to pre-rendered index.html or root index.html
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  const cleanPath = req.path.replace(/^\/+|\/+$/g, '');
  const prerenderedFile = path.join(distPath, cleanPath, 'index.html');
  if (fs.existsSync(prerenderedFile)) {
    return res.sendFile(prerenderedFile);
  }
  if (!knownSpaRoutes.has(req.path)) {
    return res.status(404).sendFile(path.join(distPath, 'index.html'));
  }
  return res.sendFile(path.join(distPath, 'index.html'));
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
