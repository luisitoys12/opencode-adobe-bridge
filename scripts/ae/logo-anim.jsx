/**
 * logo-anim.jsx
 * Anima un logo con presets: bounce-spin, build-in, bounce-only, spin-fade, typewriter
 * Uso: Llamado desde el bridge con { preset, logoPath, compName, outputPath }
 * Requiere: After Effects 2022+
 */

// ─────────────────────────────────────────
// Configuración inyectada desde el bridge
// ─────────────────────────────────────────
var CONFIG = {
  preset:     '{{PRESET}}',       // bounce-spin | build-in | bounce-only | spin-fade | typewriter
  logoPath:   '{{LOGO_PATH}}',    // ruta al archivo SVG/PNG/AI del logo
  compName:   '{{COMP_NAME}}',    // nombre de la composición a crear
  duration:   {{DURATION}},       // duración en segundos
  fps:        30,
  width:      1920,
  height:     1080,
  resultFile: '{{RESULT_FILE}}'
};

// ─────────────────────────────────────────
function writeResult(obj) {
  var f = new File(CONFIG.resultFile);
  f.open('w');
  f.write(JSON.stringify(obj));
  f.close();
}

function toFrames(sec) { return Math.round(sec * CONFIG.fps); }

// ─────────────────────────────────────────
// Importar logo
var logoFile = new File(CONFIG.logoPath);
if (!logoFile.exists) {
  writeResult({ error: 'Logo no encontrado: ' + CONFIG.logoPath });
  // script ends
} else {

var importOpts = new ImportOptions(logoFile);
var logoItem = app.project.importFile(importOpts);

// Crear composición
var comp = app.project.items.addComp(
  CONFIG.compName,
  CONFIG.width,
  CONFIG.height,
  1,
  CONFIG.duration,
  CONFIG.fps
);

// Añadir logo al centro
var logoLayer = comp.layers.add(logoItem);
logoLayer.anchorPoint.setValue([logoItem.width / 2, logoItem.height / 2]);
logoLayer.position.setValue([CONFIG.width / 2, CONFIG.height / 2]);

// ── Helper para easy ease keyframes ──
function addEasyKeyframe(prop, time, value) {
  prop.setValueAtTime(time, value);
  var kIdx = prop.nearestKeyIndex(time);
  prop.setInterpolationTypeAtKey(kIdx, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
  prop.setTemporalEaseAtKey(kIdx,
    [new KeyframeEase(0.5, 66)],
    [new KeyframeEase(0.5, 66)]
  );
}

var scl = logoLayer.scale;
var rot = logoLayer.rotation;
var pos = logoLayer.position;
var opa = logoLayer.opacity;

cx = CONFIG.width / 2;
cy = CONFIG.height / 2;

// ─────────────────────────────────────────
// PRESETS
// ─────────────────────────────────────────
if (CONFIG.preset === 'bounce-spin') {
  // Entra pequeño girando, llega grande y rebota
  addEasyKeyframe(scl, 0,    [0,   0  ]);
  addEasyKeyframe(scl, 0.4,  [120, 120]);
  addEasyKeyframe(scl, 0.6,  [90,  90 ]);
  addEasyKeyframe(scl, 0.8,  [105, 105]);
  addEasyKeyframe(scl, 1.0,  [100, 100]);

  addEasyKeyframe(rot, 0,   -180);
  addEasyKeyframe(rot, 0.5,  15 );
  addEasyKeyframe(rot, 0.8, -5  );
  addEasyKeyframe(rot, 1.0,  0  );

  addEasyKeyframe(opa, 0,   0  );
  addEasyKeyframe(opa, 0.3, 100);

} else if (CONFIG.preset === 'build-in') {
  // Piezas entran desde abajo escalonadas (simula armado)
  // Crea 3 capas offset para simular piezas
  var offsets = [-300, 0, 300];
  for (var i = 0; i < offsets.length; i++) {
    var dupLayer = (i === 0) ? logoLayer : logoLayer.duplicate();
    var delay = i * 0.15;
    var dp = dupLayer.position;
    var ds = dupLayer.scale;
    var dop = dupLayer.opacity;

    addEasyKeyframe(dp,  delay,       [cx + offsets[i], cy + 400]);
    addEasyKeyframe(dp,  delay + 0.5, [cx + offsets[i] * 0.1, cy]);

    addEasyKeyframe(ds,  delay,       [0,   0  ]);
    addEasyKeyframe(ds,  delay + 0.5, [100, 100]);

    addEasyKeyframe(dop, delay,       0  );
    addEasyKeyframe(dop, delay + 0.2, 100);
  }

} else if (CONFIG.preset === 'bounce-only') {
  // Rebote vertical clasico con aplastamiento
  addEasyKeyframe(pos, 0,   [cx, cy - 500]);
  addEasyKeyframe(pos, 0.5, [cx, cy      ]);
  addEasyKeyframe(pos, 0.65,[cx, cy + 30 ]);
  addEasyKeyframe(pos, 0.8, [cx, cy - 15 ]);
  addEasyKeyframe(pos, 1.0, [cx, cy      ]);

  addEasyKeyframe(scl, 0,    [100, 100]);
  addEasyKeyframe(scl, 0.5,  [115, 85 ]);
  addEasyKeyframe(scl, 0.65, [90,  110]);
  addEasyKeyframe(scl, 1.0,  [100, 100]);

  addEasyKeyframe(opa, 0,   0  );
  addEasyKeyframe(opa, 0.2, 100);

} else if (CONFIG.preset === 'spin-fade') {
  // Giro completo con fade in y ligero zoom
  addEasyKeyframe(rot, 0,   0  );
  addEasyKeyframe(rot, 1.2, 360);

  addEasyKeyframe(scl, 0,   [60,  60 ]);
  addEasyKeyframe(scl, 0.6, [105, 105]);
  addEasyKeyframe(scl, 1.0, [100, 100]);

  addEasyKeyframe(opa, 0,   0  );
  addEasyKeyframe(opa, 0.5, 100);

} else if (CONFIG.preset === 'typewriter') {
  // Aparece letra a letra (máscara reveladora de izquierda a derecha)
  // Solo funciona bien con logos de texto; usa rect mask
  addEasyKeyframe(scl, 0,   [100, 100]);

  var mask = logoLayer.mask.add();
  mask.maskMode = MaskMode.ADD;
  var mPath = mask.maskPath;
  var w = logoItem.width;
  var h = logoItem.height;

  var shape0 = new Shape();
  shape0.vertices = [[0,0],[0,h],[0,h],[0,0]];
  shape0.closed = true;
  mPath.setValueAtTime(0, shape0);

  var shapeFull = new Shape();
  shapeFull.vertices = [[0,0],[0,h],[w,h],[w,0]];
  shapeFull.closed = true;
  mPath.setValueAtTime(1.0, shapeFull);

  addEasyKeyframe(opa, 0, 100);

} else {
  writeResult({ error: 'Preset desconocido: ' + CONFIG.preset });
}

writeResult({
  ok: true,
  comp: comp.name,
  preset: CONFIG.preset,
  duration: CONFIG.duration,
  layers: comp.numLayers
});

} // end if logoFile.exists
