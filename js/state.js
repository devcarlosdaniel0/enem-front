import { resetFileInputDisplay } from "./fileHandler.js";
import { hideResult } from "./result.js";

let saveTimeout;
export let userAnswers = {};

export function initializeAnswers() {
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

export function saveAnswersDebounced() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    localStorage.setItem("userAnswers", JSON.stringify(userAnswers));
  }, 300);
}

export function handleReset(elements) {
  return function () {
    const { form, pdfInput, fileName, questionsDiv, languageField, result } = elements;

    form.reset();
    pdfInput.value = "";
    resetFileInputDisplay(fileName);
    questionsDiv.innerHTML = "";
    languageField.classList.add("hidden");

    userAnswers = {};
    localStorage.removeItem("userAnswers");

    hideResult(result);
  };
}
