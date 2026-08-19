# OpenCode Adobe Bridge — Referencia de Comandos

Comandos disponibles en el panel CEP y desde OpenCode MCP.
Formato: `/comando [argumento] [argumento_opcional]`

---

## 🎬 After Effects

### Composiciones

| Comando | Descripción | Ejemplo |
|---|---|---|
| `/comps` | Lista composiciones del proyecto | `/comps` |
| `/nueva [nombre] [W] [H] [seg]` | Crea composición | `/nueva Intro 1920 1080 10` |
| `/render [comp] [ruta]` | Renderiza comp a archivo | `/render Intro C:\Videos\out.avi` |

### 🎨 Animación de Logo — `/logo-anim`

```
/logo-anim [ruta-logo] [preset] [nombre-comp] [duracion-seg]
```

**Presets disponibles:**

| Preset | Descripción | Ideal para |
|---|---|---|
| `bounce-spin` | Entra girando, llega grande y rebota suavemente | Logos de marca, intros de YouTube |
| `build-in` | 3 piezas entran escalonadas desde abajo y se arman | Logos modulares, badges con texto |
| `bounce-only` | Rebote vertical con squash y stretch realista | Logos minimalistas, iconos |
| `spin-fade` | Giro completo 360° con zoom y fade in | Sellos, logos circulares |
| `typewriter` | Máscara reveladora de izquierda a derecha | Logos de texto, wordmarks |

**Ejemplos:**
```
/logo-anim C:\logos\marca.ai bounce-spin LogoIntro 5
/logo-anim C:\logos\icono.png build-in   LogoBuild 4
/logo-anim C:\logos\texto.svg typewriter LogoText  3
/logo-anim C:\logos\sello.ai  spin-fade  LogoSpin  6
```

---

## 🎞 Premiere Pro

| Comando | Descripción | Ejemplo |
|---|---|---|
| `/seqs` | Lista secuencias del proyecto | `/seqs` |
| `/export [seq] [ruta]` | Exporta secuencia con Adobe Media Encoder | `/export Final C:\Videos\final.mp4` |

---

## 🖼 Photoshop *(roadmap)*

> Requiere Photoshop 2022+ con CEP habilitado.

| Comando | Descripción |
|---|---|
| `/ps-export [ruta]` | Exporta el documento activo a PNG/JPG/WebP |
| `/ps-resize [W] [H]` | Redimensiona el canvas del documento activo |
| `/ps-batch [carpeta] [accion]` | Aplica una Action grabada a todos los archivos de una carpeta |
| `/ps-flatten [ruta]` | Aplana capas y exporta como PNG |
| `/ps-smart [capa] [reemplazo]` | Reemplaza contenido de un Smart Object por nombre |
| `/ps-color [capa] [#hex]` | Cambia el color de relleno de una capa de forma |
| `/ps-text [capa] [texto]` | Edita el contenido de una capa de texto |

---

## 🔷 Illustrator *(roadmap)*

> Requiere Illustrator 2022+ con CEP habilitado.

| Comando | Descripción |
|---|---|
| `/ai-export [formato]` | Exporta el artboard activo (SVG/PNG/PDF) |
| `/ai-export-all [carpeta]` | Exporta todos los artboards como archivos separados |
| `/ai-color-replace [#from] [#to]` | Reemplaza un color global en todo el documento |
| `/ai-text [nombre-capa] [texto]` | Edita texto de una capa por nombre |
| `/ai-logo-outline` | Convierte texto del logo a outlines (vectoriza) |
| `/ai-artboards` | Lista todos los artboards con sus dimensiones |
| `/ai-recolor [paleta]` | Aplica una paleta de recolor al documento |

---

## 🎯 Adobe XD *(roadmap)*

> Requiere Adobe XD 44+ con UXP habilitado.

| Comando | Descripción |
|---|---|
| `/xd-export [artboard] [formato]` | Exporta un artboard específico |
| `/xd-export-all [carpeta]` | Exporta todos los artboards a carpeta |
| `/xd-text [nombre] [valor]` | Edita texto de un componente por nombre |
| `/xd-color [componente] [#hex]` | Cambia color de un elemento |
| `/xd-prototype [artboard]` | Activa modo preview del prototipo |

---

## 🎥 Edición de Video *(roadmap — Premiere Pro)*

| Comando | Descripción |
|---|---|
| `/ppro-import [ruta]` | Importa un clip al bin del proyecto |
| `/ppro-add-clip [clip] [seq] [timecode]` | Inserta clip en secuencia en un timecode |
| `/ppro-cut [seq] [in] [out]` | Corta entre dos timecodes |
| `/ppro-color [preset]` | Aplica un LUT o preset de Lumetri a la secuencia activa |
| `/ppro-subtitle [srt]` | Importa subtítulos desde archivo SRT |
| `/ppro-speed [clip] [%]` | Cambia velocidad de un clip |
| `/ppro-transition [tipo]` | Aplica transición entre todos los cortes de la secuencia |
| `/ppro-audio-level [db]` | Normaliza el nivel de audio de la secuencia |

---

## 🖼 Edición de Imagen *(roadmap — Photoshop)*

| Comando | Descripción |
|---|---|
| `/img-resize [W] [H] [ruta]` | Redimensiona imagen sin abrir Photoshop |
| `/img-convert [ruta] [formato]` | Convierte entre PNG/JPG/WebP/TIFF |
| `/img-remove-bg [ruta]` | Elimina fondo con Select Subject (PS neural) |
| `/img-filter [filtro] [valor]` | Aplica filtro: sharpen, blur, denoise |
| `/img-watermark [texto] [ruta]` | Agrega marca de agua con texto a una imagen |
| `/img-batch-export [carpeta] [formato]` | Exporta toda una carpeta al mismo formato |

---

## ✏️ Adobe Animate *(roadmap)*

| Comando | Descripción |
|---|---|
| `/anim-export [formato]` | Exporta la película activa (GIF/MP4/HTML5) |
| `/anim-tween [capa] [inicio] [fin]` | Crea motion tween entre dos keyframes |
| `/anim-fps [fps]` | Cambia los FPS del documento |
| `/anim-symbol [nombre]` | Lista o selecciona un símbolo de la biblioteca |

---

## 🛠 General

| Comando | Descripción |
|---|---|
| `/jsx [código]` | Ejecuta ExtendScript crudo en la app activa |
| `/ayuda` | Muestra lista de comandos disponibles |
| `/help` | Alias de /ayuda |

---

## Notas

- Los comandos marcados con **roadmap** están planeados. Para activarlos, implementa el handler correspondiente en `bridge/scriptBuilder.js` y agrega la herramienta en `mcp-server/tools.js`.
- El archivo `cep-panel/jsx/host.jsx` puede extenderse con funciones nuevas sin reiniciar Adobe.
- Siempre requiere que la app de Adobe esté **abierta** antes de ejecutar un comando.
- El bridge corre en `http://localhost:3333` y debe estar iniciado con `start-bridge.bat`.
