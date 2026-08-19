/* OpenCode AI - CEP Panel JS v1.1
   Agrega soporte para /logo-anim y todos los nuevos comandos
*/

const BRIDGE_URL = 'http://localhost:3333';
let cs;
let bridgeOk = false;
let currentApp = 'Unknown';

document.addEventListener('DOMContentLoaded', () => {
  try {
    cs = new CSInterface();
    currentApp = cs.getHostEnvironment().appName;
    detectApp();
  } catch(e) {
    setStatus('CEP no disponible (modo browser)', 'disconnected');
  }

  checkBridge();
  setInterval(checkBridge, 10000);

  document.getElementById('btn-send').addEventListener('click', sendMessage);
  document.getElementById('btn-clear').addEventListener('click', clearChat);
  document.getElementById('btn-context').addEventListener('click', insertContext);
  document.getElementById('user-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  const ta = document.getElementById('user-input');
  ta.addEventListener('input', () => {
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 100) + 'px';
  });
});

function detectApp() {
  const chip = document.getElementById('chip-app');
  const appMap = { 'AEFT': '🎬 After Effects', 'PPRO': '🎞 Premiere Pro', 'ILST': '🖊 Illustrator', 'PHXS': '🖼 Photoshop', 'ANIM': '💚 Animate' };
  chip.textContent = appMap[currentApp] || currentApp;
  if (cs) {
    const jsxCall = currentApp === 'PPRO' ? 'app.project.name' : 'app.project.file ? app.project.file.name : "Sin guardar"';
    cs.evalScript(jsxCall, (name) => {
      if (name && name !== 'undefined') document.getElementById('chip-project').textContent = '📁 ' + name;
    });
  }
}

async function checkBridge() {
  try {
    const res = await fetchWithTimeout(`${BRIDGE_URL}/health`, {}, 3000);
    const data = await res.json();
    bridgeOk = true;
    setStatus('Bridge conectado — ' + (data.version || 'ok'), 'connected');
  } catch(e) {
    bridgeOk = false;
    setStatus('Bridge offline — ejecuta start-bridge.bat', 'disconnected');
  }
}

function setStatus(text, type) {
  const bar = document.getElementById('status-bar');
  bar.className = `status-bar status-${type}`;
  document.getElementById('status-text').textContent = text;
}

async function sendMessage() {
  const input = document.getElementById('user-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  input.style.height = 'auto';
  addMessage('user', text);
  const typingId = addTyping();
  try {
    const result = await handleCommand(text);
    removeTyping(typingId);
    addMessage('assistant', result);
  } catch(e) {
    removeTyping(typingId);
    addMessage('assistant', `❌ Error: ${e.message}`);
  }
}

// ── Command router ──────────────────────────────────────────
async function handleCommand(text) {
  const t = text.trim().toLowerCase();
  const raw = text.trim();

  // ─ After Effects ──────────────────────────────
  if (t === '/comps') return callBridge('ae_list_comps', {});
  if (t.startsWith('/nueva ')) {
    const p = raw.slice(7).split(' ');
    return callBridge('ae_create_comp', { name: p[0], width: +p[1]||1920, height: +p[2]||1080, duration: +p[3]||10 });
  }
  if (t.startsWith('/render ')) {
    const p = raw.slice(8).split(' ');
    return callBridge('ae_render', { compName: p[0], outputPath: p.slice(1).join(' ') });
  }

  // ─ Logo Anim ─────────────────────────────────
  if (t.startsWith('/logo-anim ')) {
    const p = raw.slice(11).split(' ');
    const logoPath = p[0];
    const preset   = p[1] || 'bounce-spin';
    const compName = p[2] || undefined;
    const duration = p[3] ? +p[3] : 5;
    return callBridge('ae_logo_anim', { logoPath, preset, compName, duration });
  }
  if (t === '/logo-anim') {
    return `🎬 **Uso de /logo-anim:**\n\n\`/logo-anim [ruta-logo] [preset] [nombre-comp] [duracion]\`\n\n**Presets disponibles:**\n- \`bounce-spin\` — Rebota + gira + fade in\n- \`build-in\` — Piezas se arman desde abajo\n- \`bounce-only\` — Rebote vertical con squash\n- \`spin-fade\` — Giro completo 360 con zoom\n- \`typewriter\` — Se revela de izquierda a derecha\n\n**Ejemplo:**\n\`/logo-anim C:\\logos\\mi-logo.ai bounce-spin LogoIntro 5\``;
  }

  // ─ Premiere Pro ──────────────────────────────
  if (t === '/seqs') return callBridge('ppro_list_sequences', {});
  if (t.startsWith('/export ')) {
    const p = raw.slice(8).split(' ');
    return callBridge('ppro_export_sequence', { sequenceName: p[0], outputPath: p.slice(1).join(' ') });
  }

  // ─ JSX directo ──────────────────────────────
  if (t.startsWith('/jsx ')) {
    const script = raw.slice(5);
    const tool = currentApp === 'PPRO' ? 'ppro_run_script' : 'ae_run_script';
    return callBridge(tool, { script });
  }

  // ─ Ayuda ────────────────────────────────────
  if (t === '/help' || t === '/ayuda' || t === '/comandos') return formatHelp();

  // Auto-detect keywords
  if (t.includes('composici') || t.includes('comp')) return callBridge('ae_list_comps', {});
  if (t.includes('secuencia') || t.includes('sequence')) return callBridge('ppro_list_sequences', {});
  if (t.includes('logo') && t.includes('anim')) {
    return `💡 Usa: \`/logo-anim [ruta] [preset]\`\n\nPresets: bounce-spin, build-in, bounce-only, spin-fade, typewriter`;
  }

  return formatHelp();
}

async function callBridge(tool, args) {
  if (!bridgeOk) return '⚠️ Bridge offline. Ejecuta **start-bridge.bat**';
  setStatus('Procesando...', 'loading');
  try {
    const res = await fetchWithTimeout(`${BRIDGE_URL}/run`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, args })
    }, 60000);
    const data = await res.json();
    setStatus('Bridge conectado', 'connected');
    return formatResult(tool, data);
  } catch(e) {
    setStatus('Error de conexión', 'disconnected');
    throw e;
  }
}

function formatResult(tool, data) {
  if (!data.ok) return `❌ ${data.error || 'Error desconocido'}`;
  const r = data.result;
  if (tool === 'ae_list_comps') {
    if (!r.comps || !r.comps.length) return '📭 No hay composiciones.';
    return `🎬 **${r.comps.length} comp(s):**\n` + r.comps.map((c,i) => `${i+1}. **${c.name}** — ${c.width}×${c.height} • ${c.duration}s`).join('\n');
  }
  if (tool === 'ae_create_comp')  return `✅ Comp creada: **${r.name}** (${r.width}×${r.height})`;
  if (tool === 'ae_render')       return `🚀 Renderizando **${r.comp}** → ${r.output}`;
  if (tool === 'ae_logo_anim') {
    if (r.error) return `❌ ${r.error}`;
    return `🎬✨ **Logo animado!**\n\nComp: **${r.comp}**\nPreset: \`${r.preset}\`\nDuración: ${r.duration}s • ${r.layers} capa(s)`;
  }
  if (tool === 'ppro_list_sequences') {
    if (!r.sequences || !r.sequences.length) return '📭 No hay secuencias.';
    return `🎞 **${r.sequences.length} secuencia(s):**\n` + r.sequences.map((s,i) => `${i+1}. **${s.name}**`).join('\n');
  }
  if (tool === 'ppro_export_sequence') return `✅ Exportando **${r.sequence}** → ${r.output}`;
  if (r.error) return `❌ ${r.error}`;
  return `✅ Listo\n\`\`\`\n${JSON.stringify(r, null, 2)}\n\`\`\``;
}

function formatHelp() {
  return `💬 **Comandos disponibles:**

**After Effects**
\`/comps\` — listar composiciones
\`/nueva Nombre W H Seg\` — crear comp
\`/render NombreComp C:\\out.avi\` — renderizar
\`/logo-anim ruta preset\` — animar logo

**Presets de logo:**
\`bounce-spin\` \`build-in\` \`bounce-only\` \`spin-fade\` \`typewriter\`

**Premiere Pro**
\`/seqs\` — listar secuencias
\`/export NombreSeq C:\\out.mp4\` — exportar

**General**
\`/jsx código\` — ejecutar ExtendScript
\`/ayuda\` — mostrar esta lista`;
}

async function insertContext() {
  const tool = currentApp === 'PPRO' ? 'ppro_list_sequences' : 'ae_list_comps';
  const r = await callBridge(tool, {});
  document.getElementById('user-input').value = r;
}

function addMessage(role, text) {
  const container = document.getElementById('messages');
  const msg = document.createElement('div');
  msg.className = `msg msg-${role}`;
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = markdownToHtml(text);
  msg.appendChild(bubble);
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function addTyping() {
  const id = 'typing-' + Date.now();
  const container = document.getElementById('messages');
  const msg = document.createElement('div');
  msg.className = 'msg msg-assistant';
  msg.id = id;
  msg.innerHTML = '<div class="msg-bubble"><div class="typing-indicator"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div></div>';
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id); if (el) el.remove();
}

function clearChat() {
  document.getElementById('messages').innerHTML = '<div class="msg msg-system"><div class="msg-bubble">Chat limpiado</div></div>';
}

function markdownToHtml(text) {
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/```([\s\S]*?)```/g,'<pre>$1</pre>')
    .replace(/\n/g,'<br>');
}

function fetchWithTimeout(url, options, ms) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return fetch(url, { ...options, signal: c.signal }).finally(() => clearTimeout(t));
}
