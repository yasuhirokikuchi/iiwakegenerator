import { defineConfig } from "vite";

export default defineConfig(() => {
  const vercelPort = Number(process.env.PORT);

  return {
    root: ".",
    publicDir: "public",
    server: {
      port: Number.isFinite(vercelPort) && vercelPort > 0 ? vercelPort : 5173,
      strictPort: Number.isFinite(vercelPort) && vercelPort > 0,
    },
  };
});
