#!/usr/bin/env node
/**
 * Kopieert foto's en video's uit een iCloud Drive-map naar
 * "Foto's en Filmpjes" en vernieuwt daarna media.json.
 *
 * Gebruik: node sync-from-icloud.mjs
 *
 * Zet de mapnaam hieronder op dezelfde naam als in Bestanden (iCloud Drive).
 */
import { readdir, copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapnaam zoals je die in Bestanden → iCloud Drive hebt aangemaakt
const ICLOUD_FOLDER_NAME = "Sverre_Vakantie";

const MEDIA_FOLDER = "Foto's en Filmpjes";
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".m4v"]);

function isMediaFile(name) {
  const ext = path.extname(name).toLowerCase();
  return IMAGE_EXT.has(ext) || VIDEO_EXT.has(ext);
}

async function main() {
  const home = process.env.HOME;
  if (!home) {
    throw new Error("HOME niet gevonden.");
  }

  const iCloudDir = path.join(
    home,
    "Library",
    "Mobile Documents",
    "com~apple~CloudDocs",
    ICLOUD_FOLDER_NAME
  );
  const destDir = path.join(__dirname, MEDIA_FOLDER);

  let entries;
  try {
    entries = await readdir(iCloudDir, { withFileTypes: true });
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error(
        `Map niet gevonden: ${iCloudDir}\nControleer of de map "${ICLOUD_FOLDER_NAME}" in iCloud Drive staat en of iCloud op deze Mac is gesynchroniseerd.`
      );
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  const files = entries
    .filter((e) => e.isFile() && isMediaFile(e.name))
    .map((e) => e.name);

  if (files.length === 0) {
    console.log(`Geen foto's of video's gevonden in "${ICLOUD_FOLDER_NAME}". Niets te kopiëren.`);
    return;
  }

  await mkdir(destDir, { recursive: true });

  for (const name of files) {
    const src = path.join(iCloudDir, name);
    const dest = path.join(destDir, name);
    await copyFile(src, dest);
    console.log(`  → ${name}`);
  }

  console.log(`${files.length} bestand(en) gekopieerd naar ${MEDIA_FOLDER}.`);

  return new Promise((resolve, reject) => {
    const child = spawn("node", ["generate-media-json.mjs"], {
      cwd: __dirname,
      stdio: "inherit",
    });
    child.on("close", (code) => {
      if (code !== 0) reject(new Error(`generate-media-json.mjs eindigde met code ${code}`));
      else resolve();
    });
    child.on("error", reject);
  });
}

main().catch((err) => {
  console.error("Fout:", err.message);
  process.exitCode = 1;
});
