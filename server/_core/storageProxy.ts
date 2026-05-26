import type { Express } from "express";
import { ENV } from "./env";

export function registerStorageProxy(app: Express) {
  // Use named wildcard `:path(*)` for Express 4 compatibility in production.
  // The bare `/*` wildcard works in dev but can fail in production builds.
  app.get("/manus-storage/:path(*)", async (req, res) => {
    const key = req.params.path;
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);

      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });

      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }

      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }

      // Pipe the bytes through Express so the browser never sees the cross-origin
      // CloudFront URL (which would be blocked as a broken image in some browsers).
      const imageResp = await fetch(url);
      if (!imageResp.ok) {
        res.status(502).send("Storage fetch error");
        return;
      }
      const contentType = imageResp.headers.get("content-type") || "application/octet-stream";
      res.set("Content-Type", contentType);
      res.set("Cache-Control", "public, max-age=3600");
      const buf = await imageResp.arrayBuffer();
      res.send(Buffer.from(buf));
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
