import { showResult, showError, hideResult } from "./result.js";
import { userAnswers } from "./state.js";
import { ERROR_MESSAGES } from "./constants.js";

export function handleSubmit(elements) {
  return async function (ev) {
    ev.preventDefault();

    const { pdfInput, form, languageField, result } = elements;

    const selectedFile = pdfInput.files[0];
    const diaInput = form.querySelector('input[name="dia"]:checked');
    const languageOption = form.querySelector('input[name="language"]:checked');
    const yearInput = form.querySelector('input[name="manualExamYear"]');

    const manualExamYear = yearInput.value.trim() ? Number(yearInput.value) : null;

    let verified = verifyFormElements(
      selectedFile,
      diaInput,
      languageField,
      languageOption,
      manualExamYear
    );

    if (verified === false) {
      return;
    }

    hideResult(result);

    const finalLanguageOption = getFinalLanguageOption(languageOption);
    const filteredAnswers = getFilteredAnswers(diaInput);

    const payload = {
      languageOption: finalLanguageOption,
      answers: filteredAnswers,
      manualExamYear,
    };

    const fd = new FormData();
    fd.append("file", selectedFile);
    fd.append(
      "userAnswers",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    );

    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/correct-exam",
        {
          method: "POST",
          body: fd,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(
          ERROR_MESSAGES[errorData.errorCode] ||
            errorData.message ||
            "Erro desconhecido no servidor."
        );
      }

      const data = await response.json();
      showResult(data, result);
    } catch (error) {
      handleCatchError(error, result);
    }
  };
}

function verifyFormElements(
  selectedFile,
  diaInput,
  languageField,
  languageOption,
  manualExamYear
) {

  if (!selectedFile) {
    alert("Selecione um arquivo PDF antes de enviar.");
    return false;
  }

  if (!diaInput) {
    alert("Marque 1º ou 2º dia.");
    return false;
  }

  if (!languageField.classList.contains("hidden") && !languageOption) {
    alert(
      "Selecione a opção de Língua Estrangeira (Inglês, Espanhol ou Nenhum)."
    );
    return false;
  }

  if (manualExamYear) {
    const currentYear = new Date().getFullYear();
    if (manualExamYear < 2011 || manualExamYear > currentYear + 1) {
      alert("Por favor, insira um ano válido entre 2011 e " + (currentYear + 1));
      return false;
    }
  }

  return true;
}

function getFinalLanguageOption(languageOption) {
  const finalLanguageOption =
    languageOption.value !== "NENHUM" ? languageOption.value : null;

  return finalLanguageOption;
}

function getFilteredAnswers(diaInput) {
  const [start, end] = diaInput.value === "1" ? [1, 90] : [91, 180];
  const filteredAnswers = {};

  for (let i = start; i <= end; i++) {
    if (userAnswers[i]) {
      filteredAnswers[i] = userAnswers[i].toUpperCase();
    }
  }

  return filteredAnswers;
}

function handleCatchError(error, result) {
  if (error instanceof TypeError) {
    showError("Servidor indisponível. Tente novamente.", result);
  } else {
    showError(error.message || "Erro inesperado.", result);
  }
}
