#!/usr/bin/env node
/**
 * Lokale server voor de slideshow. Upload.html (in iCloud-map) kan /sync aanroepen.
 * Start met: node server.mjs
 * Open op telefoon/iPad: http://[MAC-IP]:3333 (zelfde wifi als de Mac)
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PORT = 3333;
const SYNC_CODE = "sverre"; //zelfde als ACCESS_CODE in script.js
const MEDIA_FOLDER = "Foto's en Filmpjes";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mov": "video/quicktime",
  ".mp4": "video/mp4",
  ".m4v": "video/x-m4v",
  ".webm": "video/webm",
};

function getMime(pathname) {
  return MIME[extname(pathname)] || "application/octet-stream";
}

function runSync() {
  return new Promise((resolve, reject) => {
    const child = spawn("node", ["sync-from-icloud.mjs"], {
      cwd: __dirname,
      shell: false,
    });
    let out = "";
    let err = "";
    child.stdout?.on("data", (d) => { out += d; });
    child.stderr?.on("data", (d) => { err += d; });
    child.on("close", (code) => {
      if (code === 0) resolve({ ok: true, log: out.trim() });
      else reject(new Error(err.trim() || out.trim() || `Exit ${code}`));
    });
    child.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === "/sync" && req.method === "GET") {
    const cors = { "Access-Control-Allow-Origin": "*" };
    const code = url.searchParams.get("code");
    if (code !== SYNC_CODE) {
      res.writeHead(403, { "Content-Type": "application/json", ...cors });
      res.end(JSON.stringify({ ok: false, error: "Code ongeldig" }));
      return;
    }
    try {
      const result = await runSync();
      res.writeHead(200, { "Content-Type": "application/json", ...cors });
      res.end(JSON.stringify({ ok: true, log: result.log }));
    } catch (e) {
      res.writeHead(500, { "Content-Type": "application/json", ...cors });
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
    return;
  }
  if (req.method === "OPTIONS" && req.headers["access-control-request-method"]) {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Max-Age": "86400",
    });
    res.end();
    return;
  }

  const rel = pathname === "/" ? "index.html" : pathname.slice(1).replace(/^\/+/, "");
  const filePath = resolve(__dirname, rel);
  const root = resolve(__dirname);
  if (!filePath.startsWith(root + "/") && filePath !== root) {
    res.writeHead(403).end();
    return;
  }

  try {
    const data = await readFile(filePath);
    res.writeHead(200, { "Content-Type": getMime(pathname) });
    res.end(data);
  } catch (e) {
    if (e.code === "ENOENT") {
      res.writeHead(404).end("Not found");
    } else {
      res.writeHead(500).end("Error");
    }
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Slideshow + Sync server: http://localhost:${PORT}`);
  console.log(`Op telefoon/iPad (zelfde wifi): http://[jouw-Mac-IP]:${PORT}`);
});
