import { saveAnswersDebounced, userAnswers } from "./state.js";

export function generateQuestions(dia, questionsDiv) {
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

export function handleAnswerClick(e) {
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
