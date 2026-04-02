import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    /** 브라우저가 localhost / 127.0.0.1 모두에서 접속 가능하도록 */
    host: true,
    port: 5173,
    open: true,
  },
});
