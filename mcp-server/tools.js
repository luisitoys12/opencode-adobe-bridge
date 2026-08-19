import fetch from 'node-fetch';

const BASE = `http://localhost:${process.env.BRIDGE_PORT || 3333}`;

async function callBridge(tool, args) {
  try {
    const res = await fetch(`${BASE}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, args })
    });
    const data = await res.json();
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  } catch (err) {
    return {
      content: [{ type: 'text', text: `Error al conectar con el bridge: ${err.message}` }],
      isError: true
    };
  }
}

export const tools = [
  // ── AFTER EFFECTS ────────────────────────────────────
  {
    name: 'ae_list_comps',
    description: 'Lista todas las composiciones del proyecto abierto en After Effects',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'ae_create_comp',
    description: 'Crea una nueva composición en After Effects',
    inputSchema: {
      type: 'object',
      properties: {
        name:     { type: 'string' },
        width:    { type: 'number' },
        height:   { type: 'number' },
        duration: { type: 'number' },
        fps:      { type: 'number' }
      },
      required: ['name']
    }
  },
  {
    name: 'ae_render',
    description: 'Agrega una composición a la cola de render y la renderiza',
    inputSchema: {
      type: 'object',
      properties: {
        compName:   { type: 'string' },
        outputPath: { type: 'string' }
      },
      required: ['compName', 'outputPath']
    }
  },
  {
    name: 'ae_logo_anim',
    description: 'Crea animación de logo en After Effects con preset: bounce-spin, build-in, bounce-only, spin-fade, typewriter',
    inputSchema: {
      type: 'object',
      properties: {
        logoPath: { type: 'string', description: 'Ruta completa al archivo del logo (SVG/PNG/AI)' },
        preset:   { type: 'string', description: 'bounce-spin | build-in | bounce-only | spin-fade | typewriter' },
        compName: { type: 'string', description: 'Nombre para la composición (opcional)' },
        duration: { type: 'number', description: 'Duración en segundos (default: 5)' }
      },
      required: ['logoPath']
    }
  },
  {
    name: 'ae_run_script',
    description: 'Ejecuta código ExtendScript personalizado en After Effects',
    inputSchema: {
      type: 'object',
      properties: { script: { type: 'string' } },
      required: ['script']
    }
  },
  // ── PREMIERE PRO ────────────────────────────────────
  {
    name: 'ppro_list_sequences',
    description: 'Lista todas las secuencias del proyecto abierto en Premiere Pro',
    inputSchema: { type: 'object', properties: {} }
  },
  {
    name: 'ppro_export_sequence',
    description: 'Exporta una secuencia de Premiere Pro con Adobe Media Encoder',
    inputSchema: {
      type: 'object',
      properties: {
        sequenceName: { type: 'string' },
        preset:       { type: 'string' },
        outputPath:   { type: 'string' }
      },
      required: ['sequenceName', 'outputPath']
    }
  },
  {
    name: 'ppro_run_script',
    description: 'Ejecuta código ExtendScript personalizado en Premiere Pro',
    inputSchema: {
      type: 'object',
      properties: { script: { type: 'string' } },
      required: ['script']
    }
  }
];

export async function handleTool({ name, arguments: args }) {
  return callBridge(name, args);
}
