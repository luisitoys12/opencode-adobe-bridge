# opencode-adobe-bridge

> Plugin CEP para **Adobe After Effects** y **Adobe Premiere Pro** que abre un chat de **OpenCode AI** directamente dentro de Adobe — sin salir de la app.

![Panel preview: chat OpenCode dentro de Adobe](https://via.placeholder.com/700x200/1a1a1c/4f98a3?text=OpenCode+AI+Panel+inside+Adobe)

---

## ¿Cómo funciona?

```
┌─────────────────────────────────┐
│  Adobe (AE / Premiere Pro)      │
│  ┌───────────────────────────┐  │
│  │  CEP Panel (HTML/CSS/JS)  │  │  ← Chat UI dentro de Adobe
│  │  OpenCode AI Chat         │  │
│  └────────────┬──────────────┘  │
└───────────────│─────────────────┘
                │ HTTP fetch
                ▼
        Bridge local :3333
         (Express + Node)
                │
                ├──► afterfx.exe -r script.jsx
                └──► premiere.exe -r script.jsx
```

1. **CEP Panel** — Interfaz HTML embebida dentro de Adobe. Se abre desde `Window > Extensions > OpenCode AI`
2. **Bridge HTTP** — Servidor Node que recibe comandos del panel y ejecuta scripts
3. **ExtendScript `.jsx`** — Controla la app Adobe desde adentro

---

## Instalación rápida (Windows 10/11)

```bat
git clone https://github.com/luisitoys12/opencode-adobe-bridge
cd opencode-adobe-bridge
npm install
install.bat
```

`install.bat` copia el panel a `%APPDATA%\Adobe\CEP\extensions\` y habilita el modo debug para extensiones sin firma.

---

## Uso

**Terminal — iniciar bridge:**
```bat
start-bridge.bat
```

**En Adobe:**
> `Window > Extensions > OpenCode AI`

El panel aparece como cualquier panel nativo de Adobe (acoplable, redimensionable).

---

## Comandos del chat

| Comando | App | Descripción |
|---|---|---|
| `/comps` | After Effects | Lista composiciones abiertas |
| `/nueva Intro 1920 1080 10` | AE | Crea composición |
| `/render Intro C:\Videos\out.avi` | AE | Renderiza composición |
| `/seqs` | Premiere Pro | Lista secuencias |
| `/export Final C:\Videos\out.mp4` | PPro | Exporta secuencia |
| `/jsx alert('hola')` | Ambas | Ejecuta ExtendScript |

---

## También compatible con OpenCode MCP

El archivo `.opencode.json` configura el MCP server para que puedas controlar Adobe también desde el terminal de OpenCode:

```bat
opencode
```

---

## Versiones Adobe soportadas

- After Effects 2022–2025 (v22+)
- Premiere Pro 2022–2025 (v22+)

---

## Licencia

MIT — Luis Martinez / [Estacion Kus Medios](https://estacionkusmedios.org)
