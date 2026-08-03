# ImageToolkit — 100% Client-Side Web Utility Suite

ImageToolkit is a complete, production-ready static web application providing free, private image utility tools monetized entirely through display advertisements.

All image processing runs 100% client-side in the browser using HTML5 Canvas API, WebAssembly (WASM), and client-side libraries. **No backend, no database, no user accounts, and zero server uploads.**

## Included Web Utilities

1. **Image Compressor**: Drag-and-drop batch compression, quality level slider, target file size input (e.g., under 100 KB), live before/after diffs, and batch ZIP export.
2. **AI Background Remover**: Downscale-process-upscale canvas keying pipeline, threshold & edge feathering, checkered preview, solid color background replacement, and transparent PNG download.
3. **Format Converter**: Batch convert between JPG, PNG, WebP, GIF, SVG, PDF, and iPhone HEIC photos.
4. **Resizer & Passport Cropper**: Social media presets (Instagram, YouTube, Twitter), Passport/Visa 2x2" standards, Favicon sizes, locked aspect ratios, and percentage scale.
5. **Color Picker & Palette Extractor**: Eyedropper magnifier, k-means dominant color swatches, 1-click HEX/RGB/HSL/CMYK copy, and downloadable website Favicon Pack ZIP.
6. **Meme / Text-on-Image Generator**: Popular template gallery (Drake, Distracted BF, Two Buttons, Doge), custom photo uploads, draggable text layers, font styling, outlines, shadows, and high-res PNG export.

## Tech Stack & Architecture

- **Frontend**: React 19 + Vite + TypeScript
- **Styling**: Tailwind CSS
- **Processing**: 100% Client-Side Canvas & WASM (`jszip`, `heic2any`)
- **Monetization**: Google AdSense / Display Ad slot integration
- **SEO & Growth**: Structured JSON-LD FAQ schema, sitemap.xml & robots.txt generator
- **CI/CD**: GitHub Actions workflow (`.github/workflows/deploy.yml`)

## Local Setup & Development

```bash
# Install dependencies
npm install

# Start local dev server (port 3000)
npm run dev

# Run unit tests
npm test

# Build static dist directory
npm run build
```

## Static Host Deployment

Deploy the compiled static `dist/` directory directly to any static host:
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod --dir=dist`
- **Cloudflare Pages**: Link repo and set build output directory to `dist`
- **GitHub Pages**: Handled automatically via `.github/workflows/deploy.yml`
