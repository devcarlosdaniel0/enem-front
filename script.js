const pdfInput = document.getElementById("pdfInput");
const fileName = document.getElementById("fileName");
const form = document.getElementById("mainForm");
const result = document.getElementById("result");
const resetBtn = document.getElementById("resetBtn");
const submitBtn = document.getElementById("submitBtn");
const questionsDiv = document.getElementById("questions");
const languageField = document.getElementById("languageField");

let userAnswers = {};

function initializeAnswers() {
  try {
    const stored = localStorage.getItem("userAnswers");
    if (stored) {
      userAnswers = JSON.parse(stored);
    }
  } catch (e) {
    console.error("Erro ao ler localStorage, resetando respostas.", e);
    localStorage.removeItem("userAnswers");
    userAnswers = {};
  }
}

initializeAnswers();

let saveTimeout;
function saveAnswersDebounced() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      localStorage.setItem("userAnswers", JSON.stringify(userAnswers));
    } catch (e) {
      console.error("Erro ao salvar respostas", e);
    }
  }, 300);
}

window.addEventListener("load", () => {
  form.reset();
});

pdfInput.addEventListener("change", handleFileChange);

resetBtn.addEventListener("click", handleReset);

form.addEventListener("change", (e) => {
  if (e.target.name === "dia") {
    const diaSelecionado = e.target.value;
    languageField.classList.remove("hidden");
    generateQuestions(diaSelecionado);
  }
});

form.addEventListener("submit", handleSubmit);

function handleFileChange() {
  const file = pdfInput.files[0];

  if (!file) {
    resetFileInputDisplay();
    return;
  }

  if (file.type !== "application/pdf") {
    alert("Por favor envie um arquivo PDF.");
    pdfInput.value = "";
    resetFileInputDisplay();
    return;
  }

  const sizeKB = (file.size / 1024).toFixed(1);
  fileName.textContent = `${file.name} · ${sizeKB} KB`;
}

function resetFileInputDisplay() {
  fileName.textContent = "Nenhum arquivo selecionado";
}

function handleReset() {
  form.reset();
  pdfInput.value = "";
  resetFileInputDisplay();
  questionsDiv.innerHTML = "";
  languageField.classList.add("hidden");

  userAnswers = {};
  localStorage.removeItem("userAnswers");

  hideResult();
}

function generateQuestions(dia) {
  const start = dia === "1" ? 1 : 91;
  const end = dia === "1" ? 90 : 180;

  const questionsHTML = [];

  for (let i = start; i <= end; i++) {
    const selectedOption = userAnswers[i];
    const options = ["A", "B", "C", "D", "E"];

    const buttonsHTML = options
      .map(
        (opt) =>
          `<button type="button" class="option-button${
            selectedOption === opt ? " selected" : ""
          }" data-question="${i}" data-option="${opt}">${opt}</button>`
      )
      .join("");

    questionsHTML.push(`
      <div class="question">
        <label>${i}.</label>
        <div class="answers">
          ${buttonsHTML}
        </div>
      </div>
    `);
  }

  questionsDiv.innerHTML = questionsHTML.join("");

  questionsDiv.addEventListener("click", handleAnswerClick);
}

function handleAnswerClick(e) {
  const btn = e.target.closest(".option-button");
  if (!btn) return;

  const questionNumber = btn.dataset.question;
  const option = btn.dataset.option;
  const answersDiv = btn.parentElement;

  const previous = answersDiv.querySelector(".selected");
  if (previous) {
    previous.classList.remove("selected");
  }

  if (previous === btn) {
    delete userAnswers[questionNumber];
  } else {
    btn.classList.add("selected");
    userAnswers[questionNumber] = option;
  }

  saveAnswersDebounced();
}

function showResult(data) {
  result.classList.remove("hidden");
  result.scrollIntoView({ behavior: "smooth" });

  const {
    correctCount,
    wrongCount,
    totalAnswered,
    totalQuestions,
    totalCanceled,
    wrongAnswers,
    expectedAnswers,
    cancelledQuestions,
  } = data;

  const countsHTML = `
        <div class="counts-summary">
            <div class="count-card count-correct">
                <h3>Acertos ✅</h3>
                <p>${correctCount}</p>
            </div>
            <div class="count-card count-wrong">
                <h3>Erros ❌</h3>
                <p>${wrongCount}</p>
            </div>
            <div class="count-card count-canceled">
                <h3>Anuladas 🚫</h3>
                <p>${totalCanceled}</p>
            </div>
            <div class="count-card count-answered">
                <h3>Respondidas 📝</h3>
                <p>${totalAnswered} de ${totalQuestions}</p>
            </div>
        </div>
    `;

  let errorsListHTML = "";
  const errorQuestionNumbers = Object.keys(wrongAnswers).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  if (errorQuestionNumbers.length > 0) {
    const errorItems = errorQuestionNumbers
      .map((qNum) => {
        const userAnswer = wrongAnswers[qNum];
        const correctAnswer = expectedAnswers[qNum];
        return `
                <li class="error-item">
                    <div class="question-number">Questão ${qNum}</div>
                    <div class="answers-compare">
                        <span class="answer-box your-answer">Sua: ${userAnswer}</span>
                        <span class="answer-box correct-answer">Correta: ${correctAnswer}</span>
                    </div>
                </li>
            `;
      })
      .join("");

    errorsListHTML = `
            <div class="result-details">
                <h3>Questões que Você Errou (${wrongCount})</h3>
                <ul class="error-list">
                    ${errorItems}
                </ul>
            </div>
        `;
  }

  let canceledListHTML = "";
  const canceledQuestionNumbers = Object.keys(cancelledQuestions).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  if (canceledQuestionNumbers.length > 0) {
    const canceledItems = canceledQuestionNumbers
      .map((qNum) => {
        return `
                <li class="canceled-item">
                    <div class="question-number">Questão ${qNum}</div>
                    <div class="answers-compare">
                        <span class="answer-box canceled-answer">STATUS: ANULADA</span>
                    </div>
                </li>
            `;
      })
      .join("");

    canceledListHTML = `
            <div class="result-details">
                <h3>Questões Anuladas (${totalCanceled})</h3>
                <ul class="error-list">
                    ${canceledItems}
                </ul>
            </div>
        `;
  }

  result.innerHTML = `
        <div class="result-header">
            <h2>Resultado da Correção</h2>
            <span>Prova do ENEM</span>
        </div>
        ${countsHTML}
        ${errorsListHTML}
        ${canceledListHTML}
    `;
}

function showError(message) {
  result.classList.remove("hidden");
  result.classList.add("error-message");
  result.innerHTML = `
        <div class="result-header">
            <h2>Ops! Ocorreu um erro.</h2>
        </div>
        <p style="font-weight: bold; color: #b91c1c;">${message}</p>
        <p style="font-size: 0.9em; margin-top: 15px;">Tente reenviar ou verifique o arquivo e o dia selecionado.</p>
    `;
  result.scrollIntoView({ behavior: "smooth" });
}

function hideResult() {
  result.classList.add("hidden");
  result.classList.remove("error-message");
  result.innerHTML = "";
}

async function handleSubmit(ev) {
  ev.preventDefault();
  hideResult();

  const selectedFile = pdfInput.files[0];
  const diaInput = form.querySelector('input[name="dia"]:checked');
  const languageOption = form.querySelector('input[name="language"]:checked');

  if (!selectedFile) return alert("Selecione um arquivo PDF antes de enviar.");
  if (!diaInput) return alert("Marque 1º ou 2º dia.");

  if (!languageField.classList.contains("hidden") && !languageOption) {
    return alert(
      "Selecione a opção de Língua Estrangeira (Inglês, Espanhol ou Nenhum)."
    );
  }

  const start = diaInput.value === "1" ? 1 : 91;
  const end = diaInput.value === "1" ? 90 : 180;
  const respostasFiltradas = {};

  for (let i = start; i <= end; i++) {
    if (userAnswers[`${i}`]) {
      respostasFiltradas[i] = userAnswers[`${i}`].toUpperCase();
    }
  }

  const finalLanguageOption =
    languageOption && languageOption.value !== "NENHUM"
      ? languageOption.value
      : null;

  const payload = {
    languageOption: finalLanguageOption,
    answers: respostasFiltradas,
  };

  const fd = new FormData();
  fd.append("file", selectedFile);
  fd.append(
    "userAnswers",
    new Blob([JSON.stringify(payload)], { type: "application/json" })
  );

  try {
    const response = await fetch("http://localhost:8080/api/v1/correct-exam", {
      method: "POST",
      body: fd,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const messages = {
        QUESTION_NOT_FOUND:
          "As questões não foram encontradas no gabarito. Verifique se o dia está certo.",
        PDF_PARSE_ERROR: "Ocorreu um erro ao processar o PDF.",
        EXAM_YEAR_NOT_FOUND: "Ano da prova não encontrado no gabarito.",
        INVALID_EXAM_YEAR: "O ano da prova é inferior ao suportado.",
        INVALID_PARAMETERS:
          "Parâmetros inválidos. Verifique as alternativas estão marcadas.",
        UNKNOWN_ERROR: "Erro inesperado. Tente novamente mais tarde.",
      };
      throw new Error(
        messages[errorData.errorCode] ||
          errorData.message ||
          "Erro desconhecido no servidor."
      );
    }

    const data = await response.json();
    showResult(data);
  } catch (err) {
    console.error(err);
    showResult(err.message || "Servidor indisponível. Tente novamente.");
  }
}
