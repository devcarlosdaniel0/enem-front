export function handleFileChange(pdfInput, fileName) {
  const file = pdfInput.files[0];

  if (!file) {
    resetFileInputDisplay(fileName);
    return;
  }

  if (file.type !== "application/pdf") {
    alert("Por favor envie um arquivo PDF.");
    pdfInput.value = "";
    resetFileInputDisplay(fileName);
    return;
  }

  const sizeKB = (file.size / 1024).toFixed(1);
  fileName.textContent = `${file.name} · ${sizeKB} KB`;
}

export function resetFileInputDisplay(fileName) {
  fileName.textContent = "Nenhum arquivo selecionado";
}