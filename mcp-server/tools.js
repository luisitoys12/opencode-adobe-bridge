import fetch from "node-fetch";

const BASE = `http://localhost:${process.env.BRIDGE_PORT || 3333}`;

async function callBridge(tool, args) {
  try {
    const res = await fetch(`${BASE}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool, args })
    });
    const data = await res.json();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  } catch (err) {
    return {
      content: [{
        type: "text",
        text: `Error al conectar con el bridge: ${err.message}\n\nAsegúrate de que 'npm run bridge' está corriendo en otra terminal.`
      }],
      isError: true
    };
  }
}

export const tools = [
  {
    name: "ae_list_comps",
    description: "Lista todas las composiciones del proyecto abierto en After Effects",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "ae_create_comp",
    description: "Crea una nueva composición en After Effects",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nombre de la composición" },
        width: { type: "number", description: "Ancho en px (default: 1920)" },
        height: { type: "number", description: "Alto en px (default: 1080)" },
        duration: { type: "number", description: "Duración en segundos (default: 10)" },
        fps: { type: "number", description: "Frames por segundo (default: 30)" }
      },
      required: ["name"]
    }
  },
  {
    name: "ae_render",
    description: "Agrega una composición a la cola de render de After Effects y la renderiza",
    inputSchema: {
      type: "object",
      properties: {
        compName: { type: "string", description: "Nombre exacto de la composición" },
        outputPath: { type: "string", description: "Ruta completa de salida ej: C:\\Videos\\output.avi" }
      },
      required: ["compName", "outputPath"]
    }
  },
  {
    name: "ae_run_script",
    description: "Ejecuta código ExtendScript (JSX) personalizado en After Effects",
    inputSchema: {
      type: "object",
      properties: {
        script: { type: "string", description: "Código ExtendScript a ejecutar" }
      },
      required: ["script"]
    }
  },
  {
    name: "ppro_list_sequences",
    description: "Lista todas las secuencias del proyecto abierto en Premiere Pro",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "ppro_export_sequence",
    description: "Exporta una secuencia de Premiere Pro con Adobe Media Encoder",
    inputSchema: {
      type: "object",
      properties: {
        sequenceName: { type: "string", description: "Nombre de la secuencia a exportar" },
        preset: { type: "string", description: "Preset de exportación (default: H.264 High bitrate)" },
        outputPath: { type: "string", description: "Ruta de salida ej: C:\\Videos\\final.mp4" }
      },
      required: ["sequenceName", "outputPath"]
    }
  },
  {
    name: "ppro_run_script",
    description: "Ejecuta código ExtendScript (JSX) personalizado en Premiere Pro",
    inputSchema: {
      type: "object",
      properties: {
        script: { type: "string", description: "Código ExtendScript a ejecutar" }
      },
      required: ["script"]
    }
  }
];

export async function handleTool({ name, arguments: args }) {
  return callBridge(name, args);
}
