import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, "../config/paths.json"), "utf8"));

const TEMP = CONFIG.tempDir.replace("%USERNAME%", os.userInfo().username);
fs.mkdirSync(TEMP, { recursive: true });

function getAEPath() {
  const version = CONFIG.preferredAEVersion || "2025";
  const key = version === "2025" ? "afterEffects" : "afterEffects2024";
  const p = CONFIG[key];
  if (!fs.existsSync(p)) {
    const fallbackKey = version === "2025" ? "afterEffects2024" : "afterEffects";
    const fallback = CONFIG[fallbackKey];
    if (!fs.existsSync(fallback)) throw new Error(`After Effects no encontrado en: ${p}`);
    return fallback;
  }
  return p;
}

function getPProPath() {
  const version = CONFIG.preferredPProVersion || "2025";
  const key = version === "2025" ? "premierePro" : "premierePro2024";
  const p = CONFIG[key];
  if (!fs.existsSync(p)) {
    const fallbackKey = version === "2025" ? "premierePro2024" : "premierePro";
    const fallback = CONFIG[fallbackKey];
    if (!fs.existsSync(fallback)) throw new Error(`Premiere Pro no encontrado en: ${p}`);
    return fallback;
  }
  return p;
}

export function runAEScript(scriptContent) {
  const aePath = getAEPath();
  const scriptFile = path.join(TEMP, `ae_${Date.now()}.jsx`);
  const resultFile = path.join(TEMP, "ae_result.json");

  if (fs.existsSync(resultFile)) fs.unlinkSync(resultFile);
  fs.writeFileSync(scriptFile, scriptContent, "utf8");

  try {
    execSync(`"${aePath}" -r "${scriptFile}"`, { timeout: 60000, windowsHide: false });
    if (fs.existsSync(resultFile)) {
      return JSON.parse(fs.readFileSync(resultFile, "utf8"));
    }
    return { ok: true, message: "Script ejecutado sin resultado explícito" };
  } finally {
    if (fs.existsSync(scriptFile)) fs.unlinkSync(scriptFile);
  }
}

export function runPProScript(scriptContent) {
  const pproPath = getPProPath();
  const scriptFile = path.join(TEMP, `ppro_${Date.now()}.jsx`);
  const resultFile = path.join(TEMP, "ppro_result.json");

  if (fs.existsSync(resultFile)) fs.unlinkSync(resultFile);
  fs.writeFileSync(scriptFile, scriptContent, "utf8");

  try {
    execSync(`"${pproPath}" -r "${scriptFile}"`, { timeout: 60000, windowsHide: false });
    if (fs.existsSync(resultFile)) {
      return JSON.parse(fs.readFileSync(resultFile, "utf8"));
    }
    return { ok: true, message: "Script ejecutado sin resultado explícito" };
  } finally {
    if (fs.existsSync(scriptFile)) fs.unlinkSync(scriptFile);
  }
}
