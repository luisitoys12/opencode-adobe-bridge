import os from "os";
import path from "path";
import fs from "fs";

const CONFIG = JSON.parse(fs.readFileSync(new URL("../config/paths.json", import.meta.url), "utf8"));
const TEMP = CONFIG.tempDir.replace("%USERNAME%", os.userInfo().username);

function writeResult(app, data) {
  const file = path.join(TEMP, `${app}_result.json`).replace(/\\/g, "\\\\");
  return `
  var resultFile = new File("${file}");
  resultFile.open("w");
  resultFile.write(JSON.stringify(${data}));
  resultFile.close();
`;
}

export function buildAEScript(tool, args = {}) {
  switch (tool) {
    case "ae_list_comps":
      return `
        var comps = [];
        for (var i = 1; i <= app.project.numItems; i++) {
          var item = app.project.item(i);
          if (item instanceof CompItem) {
            comps.push({ name: item.name, width: item.width, height: item.height, duration: item.duration, fps: item.frameRate });
          }
        }
        ${writeResult("ae", "{ comps: comps }")}
      `;

    case "ae_create_comp": {
      const name = args.name || "Nueva Comp";
      const w = args.width || 1920;
      const h = args.height || 1080;
      const dur = args.duration || 10;
      const fps = args.fps || 30;
      return `
        var comp = app.project.items.addComp("${name}", ${w}, ${h}, 1, ${dur}, ${fps});
        ${writeResult("ae", `{ created: true, name: comp.name, width: comp.width, height: comp.height }`)}
      `;
    }

    case "ae_render": {
      const compName = args.compName;
      const outPath = (args.outputPath || "").replace(/\\/g, "\\\\");
      return `
        var targetComp = null;
        for (var i = 1; i <= app.project.numItems; i++) {
          if (app.project.item(i).name === "${compName}") {
            targetComp = app.project.item(i);
            break;
          }
        }
        if (!targetComp) {
          ${writeResult("ae", `{ error: "Comp '${compName}' no encontrada" }`)}
        } else {
          var rqItem = app.project.renderQueue.items.add(targetComp);
          rqItem.outputModule(1).file = new File("${outPath}");
          app.project.renderQueue.render();
          ${writeResult("ae", `{ rendered: true, comp: "${compName}", output: "${outPath}" }`)}
        }
      `;
    }

    case "ae_run_script":
      return args.script || "";

    default:
      return `alert("Tool AE desconocida: ${tool}");`;
  }
}

export function buildPProScript(tool, args = {}) {
  switch (tool) {
    case "ppro_list_sequences":
      return `
        var proj = app.project;
        var seqs = [];
        for (var i = 0; i < proj.sequences.numSequences; i++) {
          var seq = proj.sequences[i];
          seqs.push({ name: seq.name, id: seq.sequenceID });
        }
        ${writeResult("ppro", "{ sequences: seqs }")}
      `;

    case "ppro_export_sequence": {
      const seqName = args.sequenceName || "";
      const outPath = (args.outputPath || "").replace(/\\/g, "\\\\");
      const preset = args.preset || "H.264 - Match Source - High bitrate";
      return `
        var proj = app.project;
        var targetSeq = null;
        for (var i = 0; i < proj.sequences.numSequences; i++) {
          if (proj.sequences[i].name === "${seqName}") {
            targetSeq = proj.sequences[i];
            break;
          }
        }
        if (!targetSeq) {
          ${writeResult("ppro", `{ error: "Secuencia '${seqName}' no encontrada" }`)}
        } else {
          app.project.activeSequence = targetSeq;
          app.encoder.encodeSequence(targetSeq, "${outPath}", "${preset}", app.encoder.ENCODE_IN_TO_OUT, false);
          ${writeResult("ppro", `{ exported: true, sequence: "${seqName}", output: "${outPath}" }`)}
        }
      `;
    }

    case "ppro_run_script":
      return args.script || "";

    default:
      return `alert("Tool PPro desconocida: ${tool}");`;
  }
}
