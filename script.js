const pdfInput = document.getElementById("pdfInput");
const chooseBtn = document.getElementById("chooseBtn");
const fileName = document.getElementById("fileName");
const form = document.getElementById("mainForm");
const result = document.getElementById("result");
const resetBtn = document.getElementById("resetBtn");
const questionsDiv = document.getElementById("questions");

chooseBtn.addEventListener("click", () => pdfInput.click());

pdfInput.addEventListener("change", () => {
  const f = pdfInput.files[0];
  if (!f) {
    fileName.textContent = "Nenhum arquivo selecionado";
    return;
  }
  if (f.type !== "application/pdf") {
    alert("Por favor envie um arquivo PDF.");
    pdfInput.value = "";
    fileName.textContent = "Nenhum arquivo selecionado";
    return;
  }
  fileName.textContent = `${f.name} · ${(f.size / 1024).toFixed(1)} KB`;
});

resetBtn.addEventListener("click", () => {
  form.reset();
  pdfInput.value = "";
  fileName.textContent = "Nenhum arquivo selecionado";
  questionsDiv.innerHTML = "";
  hideResult();
});

form.querySelectorAll('input[name="dia"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    generateQuestions(radio.value);
  });
});

function generateQuestions(dia) {
  questionsDiv.innerHTML = "";
  let start = dia === "1" ? 1 : 91;
  let end = dia === "1" ? 90 : 180;
  for (let i = start; i <= end; i++) {
    const q = document.createElement("div");
    q.className = "question";
    q.innerHTML = `<label>Questão ${i}</label>`;
    const answersDiv = document.createElement("div");
    answersDiv.className = "answers";
    ["A", "B", "C", "D", "E"].forEach((opt) => {
      const id = `q${i}_${opt}`;
      answersDiv.innerHTML += `<label><input type="radio" name="q${i}" value="${opt}" id="${id}"> ${opt}</label>`;
    });
    q.appendChild(answersDiv);
    questionsDiv.appendChild(q);
  }
}

function showResult(obj) {
  result.classList.remove("hidden");
  result.textContent =
    typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
}
function hideResult() {
  result.classList.add("hidden");
  result.textContent = "";
}

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  hideResult();

  const selectedFile = pdfInput.files[0];
  const dia = form.querySelector('input[name="dia"]:checked');
  if (!selectedFile) {
    alert("Selecione um arquivo PDF antes de enviar.");
    return;
  }
  if (!dia) {
    alert("Marque 1º ou 2º dia.");
    return;
  }

  const respostas = {};
  const start = dia.value === "1" ? 1 : 91;
  const end = dia.value === "1" ? 90 : 180;
  for (let i = start; i <= end; i++) {
    const checked = form.querySelector(`input[name="q${i}"]:checked`);
    if (checked) {
      respostas[i] = checked.value.toUpperCase(); 
    }
  }

  const userAnswers = {
    languageOption: "INGLES", 
    answers: respostas,
  };

  const fd = new FormData();
  fd.append("file", selectedFile);
  fd.append(
    "userAnswers",
    new Blob([JSON.stringify(userAnswers)], { type: "application/json" })
  );

  try {
    const response = await fetch("http://localhost:8080/api/v1/correct-exam", {
      method: "POST",
      body: fd,
    });
    if (!response.ok) throw new Error("Erro no servidor: " + response.status);
    const data = await response.json();
    showResult(data);
  } catch (err) {
    showResult("Falha ao enviar: " + err.message);
  }
});
