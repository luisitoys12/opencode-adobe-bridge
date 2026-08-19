// Renderiza la primera composicion del proyecto
var comp = null;
for (var i = 1; i <= app.project.numItems; i++) {
  if (app.project.item(i) instanceof CompItem) {
    comp = app.project.item(i);
    break;
  }
}
if (comp) {
  var rqItem = app.project.renderQueue.items.add(comp);
  alert("Agregado a render queue: " + comp.name);
} else {
  alert("No hay composiciones en el proyecto");
}
