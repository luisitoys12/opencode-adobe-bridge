import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { runAEScript } from './executor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/paths.json'), 'utf8'));
const TEMP = CONFIG.tempDir.replace('%USERNAME%', os.userInfo().username);

const TEMPLATE = fs.readFileSync(
  path.join(__dirname, '../scripts/ae/logo-anim.jsx'), 'utf8'
);

export async function handleLogoAnim(args) {
  const preset    = args.preset     || 'bounce-spin';
  const logoPath  = (args.logoPath  || '').replace(/\\/g, '\\\\');
  const compName  = args.compName   || ('Logo_' + preset + '_' + Date.now());
  const duration  = args.duration   || 5;
  const resultFile = path.join(TEMP, 'ae_result.json').replace(/\\/g, '\\\\');

  if (!fs.existsSync(args.logoPath || '')) {
    return { error: `Logo no encontrado: ${args.logoPath}` };
  }

  const script = TEMPLATE
    .replace("'{{PRESET}}'",       `'${preset}'`)
    .replace("'{{LOGO_PATH}}'",    `'${logoPath}'`)
    .replace("'{{COMP_NAME}}'",    `'${compName}'`)
    .replace('{{DURATION}}',       String(duration))
    .replace("'{{RESULT_FILE}}'",  `'${resultFile}'`);

  return runAEScript(script);
}
