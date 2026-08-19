// Lista todas las composiciones y las muestra en alerta
var names = [];
for (var i = 1; i <= app.project.numItems; i++) {
  if (app.project.item(i) instanceof CompItem) {
    names.push(app.project.item(i).name);
  }
}
alert("Composiciones (" + names.length + "):\n" + names.join("\n"));
