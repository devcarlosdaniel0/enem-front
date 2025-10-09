const pdfInput = document.getElementById("pdfInput");
const chooseBtn = document.getElementById("chooseBtn");
const fileName = document.getElementById("fileName");
const form = document.getElementById("mainForm");
const result = document.getElementById("result");
const resetBtn = document.getElementById("resetBtn");
const questionsDiv = document.getElementById("questions");
const languageField = document.getElementById("languageField");

chooseBtn.addEventListener("click", () => pdfInput.click());

pdfInput.addEventListener("change", () => {
  const file = pdfInput.files[0];
  if (!file) {
    fileName.textContent = "Nenhum arquivo selecionado";
    return;
  }

  if (file.type !== "application/pdf") {
    alert("Por favor envie um arquivo PDF.");
    pdfInput.value = "";
    fileName.textContent = "Nenhum arquivo selecionado";
    return;
  }

  fileName.textContent = `${file.name} · ${(file.size / 1024).toFixed(1)} KB`;
});

resetBtn.addEventListener("click", () => {
  form.reset();
  pdfInput.value = "";
  fileName.textContent = "Nenhum arquivo selecionado";
  questionsDiv.innerHTML = "";
  languageField.classList.add("hidden");
  hideResult();
});

form.querySelectorAll('input[name="dia"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    const diaSelecionado = radio.value;
    languageField.classList.remove("hidden");
    generateQuestions(diaSelecionado);
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
  const languageOption = form.querySelector('input[name="language"]:checked');

  if (!selectedFile) {
    alert("Selecione um arquivo PDF antes de enviar.");
    return;
  }

  if (!dia) {
    alert("Marque 1º ou 2º dia.");
    return;
  }

  if (languageOption === null && !languageField.classList.contains("hidden")) {
    alert(
      "Selecione a opção de Língua Estrangeira (Inglês, Espanhol ou Nenhum)."
    );
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

  let finalLanguageOption;

  if (languageOption.value === "NENHUM") {
    finalLanguageOption = null;
  } else {
    finalLanguageOption = languageOption.value;
  }

  const userAnswers = {
    languageOption: finalLanguageOption,
    answers: respostas,
  };

  const fd = new FormData();
  fd.append("file", selectedFile);
  fd.append(
    "userAnswers",
    new Blob([JSON.stringify(userAnswers)], { type: "application/json" })
  );

  const messages = {
    QUESTION_NOT_FOUND: "As questões não foram encontradas no gabarito. Verifique se o dia está certo.",
    PDF_PARSE_ERROR: "Ocorreu um erro ao processar o PDF.",
    EXAM_YEAR_NOT_FOUND: "Ano da prova não encontrado no gabarito.",
    INVALID_EXAM_YEAR: "O ano da prova é inferior ao suportado.",
    INVALID_PARAMETERS: "Parâmetros inválidos. Verifique os campos informados.",
    UNKNOWN_ERROR: "Erro inesperado. Tente novamente mais tarde.",
  };

  fetch("http://localhost:8080/api/v1/correct-exam", {
    method: "POST",
    body: fd,
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();

        const errorMessage = messages[errorData.errorCode] || "Erro desconhecido.";

        showResult(errorMessage);
      } else {
        const data = await response.json();
        showResult(data);
      }
    })
    .catch((err) => {
      showResult("Servidor indisponível. Tente novamente mais tarde.");
      console.log(err);
    });
});
