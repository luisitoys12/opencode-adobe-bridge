// Exporta la secuencia activa con Adobe Media Encoder
var seq = app.project.activeSequence;
if (!seq) {
  alert("No hay secuencia activa en Premiere Pro");
} else {
  var outputPath = "C:\\Users\\" + $.getenv("USERNAME") + "\\Desktop\\export_" + seq.name + ".mp4";
  app.encoder.encodeSequence(seq, outputPath, "H.264 - Match Source - High bitrate", app.encoder.ENCODE_IN_TO_OUT, false);
  alert("Exportando: " + seq.name + " -> " + outputPath);
}
