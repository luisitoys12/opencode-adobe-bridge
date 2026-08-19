// Ejemplo standalone: Crea una comp 1920x1080 de 10s a 30fps
// Uso: afterfx.exe -r create-comp.jsx
var comp = app.project.items.addComp("Mi Comp", 1920, 1080, 1, 10, 30);
alert("Composicion creada: " + comp.name);
