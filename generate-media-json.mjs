import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MEDIA_FOLDER = "Foto's en Filmpjes";
const MEDIA_DIR = path.join(__dirname, MEDIA_FOLDER);

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".m4v"]);
const IGNORE_FILES = new Set(["Achtergrond.jpg", "Achtergrond.jpeg", "Achtergrond.png", "Achtergrond.webp"]);

function encodePathSegment(value) {
  return encodeURIComponent(value).replace(/'/g, "%27");
}

function toCaption(fileName) {
  const base = path.basename(fileName, path.extname(fileName));
  const cleaned = base.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return cleaned || "Wintersport moment";
}

function detectType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if (IMAGE_EXT.has(ext)) return "image";
  if (VIDEO_EXT.has(ext)) return "video";
  return null;
}

async function main() {
  const entries = await readdir(MEDIA_DIR, { withFileTypes: true });
  const mediaEntries = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => !IGNORE_FILES.has(name))
    .map((name) => ({ name, type: detectType(name) }))
    .filter((item) => item.type !== null)
    .sort((a, b) => a.name.localeCompare(b.name, "nl"));

  const payload = mediaEntries.map((item) => ({
    type: item.type,
    src: `./${encodePathSegment(MEDIA_FOLDER)}/${encodePathSegment(item.name)}`,
    caption: toCaption(item.name),
  }));

  await writeFile(path.join(__dirname, "media.json"), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`media.json bijgewerkt met ${payload.length} items.`);
}

main().catch((error) => {
  console.error("Kon media.json niet genereren:", error);
  process.exitCode = 1;
});
