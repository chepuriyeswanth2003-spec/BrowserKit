# BrowserKit / ImageToolkit — 100% Client-Side Web Utility Suite

BrowserKit is a complete, production-ready web application providing free, private media utility tools monetized through Google AdSense display advertisements.

All image and media processing runs 100% client-side in the browser using HTML5 Canvas API, WebAssembly (WASM), and client-side libraries. **No backend processing required for media tools, zero server file uploads, complete privacy.**

---

## Google AdSense & Monetization Setup

1. **Environment Variables**: Set your publisher ID in `.env`:
   ```bash
   VITE_ADSENSE_CLIENT_ID="ca-pub-XXXXXXXXXXXXXXXX"
   VITE_ADSENSE_SLOT_HEADER="1234567890"
   VITE_ADSENSE_SLOT_SIDEBAR="2345678901"
   VITE_ADSENSE_SLOT_BELOW_TOOL="3456789012"
   VITE_ADSENSE_SLOT_MODAL="4567890123"
   ```
2. **Authorized Sellers (`ads.txt`)**: Update `public/ads.txt` with your AdSense Publisher ID:
   ```text
   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
   ```
3. **Ad Placements**:
   - **Header Banner**: Top container (`AdSlot type="header-banner"`)
   - **Desktop Sidebar**: Sticky right column (`AdSlot type="sidebar"`)
   - **Below-Tool Placement**: Workspace bottom (`AdSlot type="below-tool"`)
   - **Post-Download Modal**: Interactive download completion dialog (`AdSlot type="modal"`)

---

## Render Free Tier Keep-Alive (40-Second Auto-Ping)

Render's free tier web services automatically spin down (sleep) after 50 seconds of inactivity. BrowserKit includes a built-in keep-alive engine to prevent container spin-down:

- **Client Keep-Alive Service (`src/lib/keepAlive.ts`)**: Pings `/ping` every **40 seconds** (`40,000ms`), staying safely below Render's 50-second sleep threshold while users navigate or process files.
- **Express Host Server (`server.js`)**: Exposes lightweight `/ping` and `/health` endpoints returning HTTP 200 OK status.

---

## Local Setup & Development

```bash
# Install dependencies
npm install

# Start local dev server (port 3000)
npm run dev

# Run TypeScript type check / linter
npm run lint

# Build production bundle
npm run build

# Start production Express server (Render target)
npm start
```

---

## Deployment on Render

1. Connect your GitHub repository to **Render**.
2. Select **Web Service**.
3. Build Command: `npm run build`
4. Start Command: `npm start`
5. Set Environment Variable: `VITE_ADSENSE_CLIENT_ID` = `ca-pub-XXXXXXXXXXXXXXXX`
