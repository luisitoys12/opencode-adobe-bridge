// Lista secuencias del proyecto activo en Premiere Pro
var proj = app.project;
var names = [];
for (var i = 0; i < proj.sequences.numSequences; i++) {
  names.push(proj.sequences[i].name);
}
alert("Secuencias (" + names.length + "):\n" + names.join("\n"));
