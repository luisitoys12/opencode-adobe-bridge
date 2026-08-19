// Importa un clip al proyecto activo de Premiere Pro
// Cambia clipPath por la ruta de tu archivo
var clipPath = "C:\\Users\\" + $.getenv("USERNAME") + "\\Desktop\\mi-video.mp4";
var importArr = [clipPath];
app.project.importFiles(importArr, false, app.project.rootItem, false);
alert("Clip importado: " + clipPath);
