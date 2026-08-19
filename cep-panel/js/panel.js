/* OpenCode AI - CEP Panel JS
   Comunicación: CEP Panel <-> Bridge HTTP (localhost:3333) <-> Adobe ExtendScript
*/

const BRIDGE_URL = 'http://localhost:3333';
let cs;
let bridgeOk = false;
let currentApp = 'Unknown';

// ── Init ──────────────────────────────────────────────────────
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-resize textarea
  const ta = document.getElementById('user-input');
  ta.addEventListener('input', () => {
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 100) + 'px';
  });
});

// ── App detection ─────────────────────────────────────────────
function detectApp() {
  const chip = document.getElementById('chip-app');
  const appMap = {
    'AEFT': '🎬 After Effects',
    'PPRO': '🎞 Premiere Pro',
    'ILST': '🖊 Illustrator',
    'PHXS': '🖼 Photoshop'
  };
  const label = appMap[currentApp] || currentApp;
  chip.textContent = label;

  // Get project name via ExtendScript
  if (cs) {
    const jsxCall = currentApp === 'PPRO'
      ? 'app.project.name'
      : 'app.project.file ? app.project.file.name : "Sin guardar"';
    cs.evalScript(jsxCall, (name) => {
      if (name && name !== 'undefined') {
        document.getElementById('chip-project').textContent = '📁 ' + name;
      }
    });
  }
}

// ── Bridge health check ───────────────────────────────────────
async function checkBridge() {
  try {
    const res = await fetchWithTimeout(`${BRIDGE_URL}/health`, {}, 3000);
    const data = await res.json();
    bridgeOk = true;
    setStatus('Bridge conectado — ' + (data.bridge || 'ok'), 'connected');
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

// ── Message handling ──────────────────────────────────────────
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

// ── Command router ────────────────────────────────────────────
async function handleCommand(text) {
  const t = text.trim().toLowerCase();

  // Slash commands
  if (t.startsWith('/comps') || t.startsWith('/comps')) {
    return callBridge('ae_list_comps', {});
  }
  if (t.startsWith('/seqs')) {
    return callBridge('ppro_list_sequences', {});
  }
  if (t.startsWith('/nueva ')) {
    const parts = text.slice(7).split(' ');
    return callBridge('ae_create_comp', {
      name: parts[0] || 'Nueva Comp',
      width: parseInt(parts[1]) || 1920,
      height: parseInt(parts[2]) || 1080,
      duration: parseInt(parts[3]) || 10
    });
  }
  if (t.startsWith('/render ')) {
    const parts = text.slice(8).split(' ');
    return callBridge('ae_render', {
      compName: parts[0],
      outputPath: parts.slice(1).join(' ')
    });
  }
  if (t.startsWith('/export ')) {
    const parts = text.slice(8).split(' ');
    return callBridge('ppro_export_sequence', {
      sequenceName: parts[0],
      outputPath: parts.slice(1).join(' ')
    });
  }
  if (t.startsWith('/jsx ')) {
    const script = text.slice(5);
    const tool = currentApp === 'PPRO' ? 'ppro_run_script' : 'ae_run_script';
    return callBridge(tool, { script });
  }

  // Auto-detect intent keywords
  if (t.includes('composici') || t.includes('comp') || t.includes('listar')) {
    return callBridge('ae_list_comps', {});
  }
  if (t.includes('secuencia') || t.includes('sequence')) {
    return callBridge('ppro_list_sequences', {});
  }

  // Generic question — explain available commands
  return formatHelp();
}

// ── Bridge call ───────────────────────────────────────────────
async function callBridge(tool, args) {
  if (!bridgeOk) {
    return '⚠️ El bridge no está corriendo.\nEjecuta **start-bridge.bat** y vuelve a intentarlo.';
  }
  setStatus('Procesando...', 'loading');
  try {
    const res = await fetchWithTimeout(`${BRIDGE_URL}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, args })
    }, 30000);
    const data = await res.json();
    setStatus('Bridge conectado', 'connected');
    return formatResult(tool, data);
  } catch(e) {
    setStatus('Error de conexión', 'disconnected');
    throw e;
  }
}

// ── Result formatter ──────────────────────────────────────────
function formatResult(tool, data) {
  if (!data.ok) return `❌ ${data.error || 'Error desconocido'}`;
  const r = data.result;

  if (tool === 'ae_list_comps') {
    if (!r.comps || r.comps.length === 0) return '📭 No hay composiciones en el proyecto.';
    const list = r.comps.map((c, i) => `${i+1}. **${c.name}** — ${c.width}×${c.height} • ${c.duration}s • ${c.fps}fps`).join('\n');
    return `🎬 **${r.comps.length} composición(es):**\n${list}`;
  }
  if (tool === 'ae_create_comp') {
    return `✅ Composición creada: **${r.name}** (${r.width}×${r.height})`;
  }
  if (tool === 'ae_render') {
    return `🚀 Renderizando **${r.comp}**\n📂 Salida: ${r.output}`;
  }
  if (tool === 'ppro_list_sequences') {
    if (!r.sequences || r.sequences.length === 0) return '📭 No hay secuencias en el proyecto.';
    const list = r.sequences.map((s, i) => `${i+1}. **${s.name}**`).join('\n');
    return `🎞 **${r.sequences.length} secuencia(s):**\n${list}`;
  }
  if (tool === 'ppro_export_sequence') {
    return `✅ Exportando **${r.sequence}**\n📂 Salida: ${r.output}`;
  }
  if (r.error) return `❌ ${r.error}`;
  return `✅ Listo\n\`\`\`\n${JSON.stringify(r, null, 2)}\n\`\`\``;
}

function formatHelp() {
  return `No reconocí ese comando. Prueba:\n
- \`/comps\` — listar comps (AE)\n- \`/nueva Nombre W H Seg\` — crear comp\n- \`/render NombreComp C:\\out.avi\` — renderizar\n- \`/seqs\` — listar secuencias (Premiere)\n- \`/export NombreSeq C:\\out.mp4\` — exportar\n- \`/jsx alert('hola')\` — ejecutar ExtendScript`;
}

// ── Insert context button ─────────────────────────────────────
async function insertContext() {
  const tool = currentApp === 'PPRO' ? 'ppro_list_sequences' : 'ae_list_comps';
  const result = await callBridge(tool, {});
  document.getElementById('user-input').value = result;
}

// ── Chat DOM helpers ──────────────────────────────────────────
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
  return msg;
}

function addTyping() {
  const id = 'typing-' + Date.now();
  const container = document.getElementById('messages');
  const msg = document.createElement('div');
  msg.className = 'msg msg-assistant';
  msg.id = id;
  msg.innerHTML = `<div class="msg-bubble"><div class="typing-indicator"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div></div>`;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function clearChat() {
  const container = document.getElementById('messages');
  container.innerHTML = '<div class="msg msg-system"><div class="msg-bubble">Chat limpiado</div></div>';
}

// ── Markdown mini-renderer ────────────────────────────────────
function markdownToHtml(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>')
    .replace(/\n/g, '<br>');
}

// ── Fetch with timeout ────────────────────────────────────────
function fetchWithTimeout(url, options, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}
