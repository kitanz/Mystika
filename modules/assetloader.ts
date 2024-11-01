import path from "path";
import fs from "fs";
import crypto from "crypto";
import log from "./logger";
import assetCache from "../services/assetCache";

// Load maps
export function loadMaps() {
  const maps = [] as MapData[];
  const failedMaps = [] as string[];
  const mapDir = path.join(import.meta.dir, "..", "assets", "maps");
  if (!fs.existsSync(mapDir)) return maps;

  const mapFiles = fs.readdirSync(mapDir);
  mapFiles.forEach((file) => {
    if (!file.endsWith(".json")) return;
    const f = path.join(mapDir, file);
    const result = tryParse(fs.readFileSync(f, "utf-8")) || failedMaps.push(f);
    
    if (result) {
      const mapHash = crypto
        .createHash("sha256")
        .update(JSON.stringify(result))
        .digest("hex");
      maps.push({ name: file, data: result, hash: mapHash });
    }
    log.debug(`Loaded map: ${file}`);
  })

  if (failedMaps.length > 0) {
    for (const map of failedMaps) {
      log.error(`Failed to parse ${map} as a map`);
    }
  }

  assetCache.add("maps", maps);
};
loadMaps();

// Load tilesets
export function loadTilesets() {
  const tilesets = [] as TilesetData[];
  const tilesetDir = path.join(import.meta.dir, "..", "assets", "tilesets");
  if (!fs.existsSync(tilesetDir)) return tilesets;

  const tilesetFiles = fs.readdirSync(tilesetDir);
  tilesetFiles.forEach((file) => {
    const tilesetData = fs.readFileSync(path.join(tilesetDir, file), "base64");
    log.debug(`Loaded tileset: ${file}`);
    const tilesetHash = crypto
      .createHash("sha256")
      .update(tilesetData)
      .digest("hex");
    tilesets.push({ name: file, data: tilesetData, hash: tilesetHash });
  });

  assetCache.add("tilesets", tilesets);
}
loadTilesets();

// Load scripts
export function loadScripts() {
  const scripts = [] as ScriptData[];
  const scriptDir = path.join(import.meta.dir, "..", "assets", "scripts");
  if (!fs.existsSync(scriptDir)) return scripts;

  const scriptFiles = fs.readdirSync(scriptDir);
  scriptFiles.forEach((file) => {
    const scriptData = fs.readFileSync(path.join(scriptDir, file), "utf-8");
    log.debug(`Loaded script: ${file}`);
    const scriptHash = crypto
      .createHash("sha256")
      .update(scriptData)
      .digest("hex");
    scripts.push({ name: file, data: scriptData, hash: scriptHash });
  });
  assetCache.add("scripts", scripts);
}
loadScripts();

function tryParse(data: string): any {
  try {
    return JSON.parse(data);
  } catch (e: any) {
    log.error(e);
    return null;
  }
}