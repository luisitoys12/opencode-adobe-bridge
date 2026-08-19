# opencode-adobe-bridge

> Conecta **OpenCode AI** con **Adobe After Effects** y **Adobe Premiere Pro** en Windows 10 via ExtendScript + MCP.

---

## ¿Cómo funciona?

```
OpenCode (Claude/AI)
      │
      ▼
MCP Server (tools: ae_create_comp, ae_render, ppro_export...)
      │
      ▼
Express HTTP :3333
      │
      ├──► afterfx.exe -r script.jsx  (After Effects)
      └──► premiere.exe -r script.jsx (Premiere Pro)
```

1. **MCP Server** — OpenCode se conecta como herramienta MCP vía stdio
2. **Bridge HTTP** — Express en `localhost:3333` traduce llamadas a scripts
3. **ExtendScript `.jsx`** — Adobe ejecuta los scripts contra la app abierta

---

## Requisitos

- Windows 10 (64-bit)
- Node.js 18+
- Adobe After Effects 2024/2025 **abierto**
- Adobe Premiere Pro 2024/2025 **abierto**
- [OpenCode](https://opencode.ai) instalado

---

## Instalación

```bat
git clone https://github.com/luisitoys12/opencode-adobe-bridge
cd opencode-adobe-bridge
npm install
```

Edita `config/paths.json` con las rutas exactas a tus ejecutables de Adobe.

---

## Uso

**Terminal 1 — Iniciar el bridge:**
```bat
npm run bridge
```

**Terminal 2 — Iniciar OpenCode (detecta `.opencode.json` automáticamente):**
```bat
opencode
```

Ya puedes pedirle a OpenCode cosas como:
- *"Crea una composición 1920x1080 llamada Intro en After Effects"*
- *"Renderiza la comp 'Intro' a C:\Videos\intro.avi"*
- *"Lista las secuencias abiertas en Premiere"*
- *"Exporta la secuencia 'Final Cut' a C:\Videos\final.mp4"*

---

## Herramientas MCP disponibles

| Herramienta | App | Descripción |
|---|---|---|
| `ae_list_comps` | After Effects | Lista composiciones abiertas |
| `ae_create_comp` | After Effects | Crea nueva composición |
| `ae_render` | After Effects | Agrega comp a la cola de render |
| `ae_run_script` | After Effects | Ejecuta JSX personalizado |
| `ppro_list_sequences` | Premiere Pro | Lista secuencias del proyecto |
| `ppro_export_sequence` | Premiere Pro | Exporta secuencia via AME |
| `ppro_run_script` | Premiere Pro | Ejecuta JSX personalizado |

---

## Configuración de rutas (`config/paths.json`)

Ajusta según tu versión de Adobe:

```json
{
  "afterEffects": "C:\\Program Files\\Adobe\\Adobe After Effects 2025\\Support Files\\afterfx.exe",
  "premierePro": "C:\\Program Files\\Adobe\\Adobe Premiere Pro 2025\\Adobe Premiere Pro.exe",
  "tempDir": "C:\\Users\\%USERNAME%\\AppData\\Local\\Temp\\opencode-adobe-bridge"
}
```

---

## Licencia

MIT — Luis Martinez / [Estacion Kus Medios](https://estacionkusmedios.org)
