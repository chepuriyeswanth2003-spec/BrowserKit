/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADSENSE_CLIENT_ID?: string;
  readonly VITE_ADSENSE_SLOT_HEADER?: string;
  readonly VITE_ADSENSE_SLOT_SIDEBAR?: string;
  readonly VITE_ADSENSE_SLOT_BELOW_TOOL?: string;
  readonly VITE_ADSENSE_SLOT_MODAL?: string;
  readonly VITE_ADSENSE_SLOT_INFLOW?: string;
  readonly VITE_KEEP_ALIVE_INTERVAL_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
