import { initializeAnswers, userAnswers } from "./state.js";
import { handleFileChange } from "./fileHandler.js";
import { handleReset } from "./state.js";
import { generateQuestions } from "./questions.js";
import { handleSubmit } from "./submit.js";

const elements = {
  pdfInput: document.getElementById("pdfInput"),
  fileName: document.getElementById("fileName"),
  form: document.getElementById("mainForm"),
  result: document.getElementById("result"),
  resetBtn: document.getElementById("resetBtn"),
  questionsDiv: document.getElementById("questions"),
  submitBtn: document.getElementById("submitBtn"),
  languageField: document.getElementById("languageField"),
};

initializeAnswers();

window.addEventListener("load", () => {
  elements.form.reset();
});

elements.pdfInput.addEventListener("change", () => {
  handleFileChange(elements.pdfInput, elements.fileName)
});

elements.resetBtn.addEventListener("click", handleReset(elements));

elements.form.addEventListener("change", (e) => {
  if (e.target.name === "dia") {
    const diaSelecionado = e.target.value;
    elements.languageField.classList.remove("hidden");
    generateQuestions(diaSelecionado, elements.questionsDiv);
  }
});

elements.form.addEventListener("submit", handleSubmit(elements));

console.log(userAnswers);