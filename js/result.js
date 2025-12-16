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

export function showError(message, result) {
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

export function hideResult(result) {
  result.classList.add("hidden");
  result.classList.remove("error-message");
  result.innerHTML = "";
}
