/**
 * host.jsx - ExtendScript host script para el CEP Panel
 * Se ejecuta dentro de Adobe (AE o Premiere Pro).
 * El panel JS puede llamar funciones aqui via cs.evalScript()
 */

// ── After Effects helpers ─────────────────────────────────────
function ae_getProjectName() {
  return app.project.file ? app.project.file.name : 'Sin guardar';
}

function ae_listComps() {
  var result = [];
  for (var i = 1; i <= app.project.numItems; i++) {
    var item = app.project.item(i);
    if (item instanceof CompItem) {
      result.push({
        name: item.name,
        width: item.width,
        height: item.height,
        duration: item.duration,
        fps: item.frameRate
      });
    }
  }
  return JSON.stringify(result);
}

function ae_createComp(name, width, height, duration, fps) {
  var comp = app.project.items.addComp(
    name || 'Nueva Comp',
    width  || 1920,
    height || 1080,
    1,
    duration || 10,
    fps    || 30
  );
  return JSON.stringify({ name: comp.name, width: comp.width, height: comp.height });
}

// ── Premiere Pro helpers ──────────────────────────────────────
function ppro_getProjectName() {
  return app.project.name;
}

function ppro_listSequences() {
  var seqs = [];
  var proj = app.project;
  for (var i = 0; i < proj.sequences.numSequences; i++) {
    seqs.push({ name: proj.sequences[i].name, id: proj.sequences[i].sequenceID });
  }
  return JSON.stringify(seqs);
}

// ── Generic info ──────────────────────────────────────────────
function getHostInfo() {
  return JSON.stringify({
    app: app.version,
    platform: $.os
  });
}
