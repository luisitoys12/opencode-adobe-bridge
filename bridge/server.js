import express from 'express';
import { runAEScript, runPProScript } from './executor.js';
import { buildAEScript, buildPProScript } from './scriptBuilder.js';
import { handleLogoAnim } from './logoAnim.js';

const app = express();
app.use(express.json());

const PORT = process.env.BRIDGE_PORT || 3333;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', bridge: 'opencode-adobe-bridge', version: '1.1.0' });
});

app.post('/run', async (req, res) => {
  const { tool, args } = req.body;
  console.log(`[bridge] Tool: ${tool}`, args);

  try {
    let result;

    // Logo anim especial
    if (tool === 'ae_logo_anim') {
      result = await handleLogoAnim(args);
      return res.json({ ok: true, result });
    }

    if (tool.startsWith('ae_')) {
      const script = buildAEScript(tool, args);
      result = await runAEScript(script);
    } else if (tool.startsWith('ppro_')) {
      const script = buildPProScript(tool, args);
      result = await runPProScript(script);
    } else {
      return res.status(400).json({ error: `Tool desconocida: ${tool}` });
    }

    res.json({ ok: true, result });
  } catch (err) {
    console.error(`[bridge] Error en ${tool}:`, err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[bridge] HTTP Bridge corriendo en http://localhost:${PORT}`);
  console.log(`[bridge] v1.1.0 - Logo Anim habilitado`);
});
