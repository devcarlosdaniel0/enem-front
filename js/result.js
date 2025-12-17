export function showResult(data, result) {
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

  const countsHTML = createCountsSummary({
    correctCount,
    wrongCount,
    totalCanceled,
    totalAnswered,
    totalQuestions,
  });

  const errorsListHTML = createErrorsList(wrongAnswers, expectedAnswers, wrongCount);
  const canceledListHTML = createCanceledList(cancelledQuestions, totalCanceled);

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

function createCountsSummary({ correctCount, wrongCount, totalCanceled, totalAnswered, totalQuestions }) {
  return `
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
}

function createErrorsList(wrongAnswers, expectedAnswers, wrongCount) {
  const errorQuestionNumbers = Object.keys(wrongAnswers).sort((a, b) => a - b);
  
  if (errorQuestionNumbers.length === 0) return "";

  const errorItems = errorQuestionNumbers
    .map((qNum) => `
      <li class="error-item">
        <div class="question-number">Questão ${qNum}</div>
        <div class="answers-compare">
          <span class="answer-box your-answer">Sua: ${wrongAnswers[qNum]}</span>
          <span class="answer-box correct-answer">Correta: ${expectedAnswers[qNum]}</span>
        </div>
      </li>
    `)
    .join("");

  return `
    <div class="result-details">
      <h3>Questões que Você Errou (${wrongCount})</h3>
      <ul class="error-list">${errorItems}</ul>
    </div>
  `;
}

function createCanceledList(cancelledQuestions, totalCanceled) {
  const canceledQuestionNumbers = Object.keys(cancelledQuestions).sort((a, b) => a - b);
  
  if (canceledQuestionNumbers.length === 0) return "";

  const canceledItems = canceledQuestionNumbers
    .map((qNum) => `
      <li class="canceled-item">
        <div class="question-number">Questão ${qNum}</div>
        <div class="answers-compare">
          <span class="answer-box canceled-answer">STATUS: ANULADA</span>
        </div>
      </li>
    `)
    .join("");

  return `
    <div class="result-details">
      <h3>Questões Anuladas (${totalCanceled})</h3>
      <ul class="error-list">${canceledItems}</ul>
    </div>
  `;
}

export function showError(message, result) {
  result.classList.remove("hidden");
  result.classList.add("error-message");
  result.innerHTML = `
        <div class="result-header">
            <h2>Ops! Ocorreu um erro.</h2>
        </div>
        <p id="errorMessage">${message}</p>
        <p id="errorReupload">Tente reenviar ou verifique o arquivo e o dia selecionado.</p>
    `;
  result.scrollIntoView({ behavior: "smooth" });
}

export function hideResult(result) {
  result.classList.add("hidden");
  result.classList.remove("error-message");
  result.innerHTML = "";
}
