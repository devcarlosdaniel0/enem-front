import { showResult, showError, hideResult } from "./result.js";
import { userAnswers } from "./state.js";
import { ERROR_MESSAGES } from "./constants.js";

export function handleSubmit(elements) {
  return async function (ev) {
    ev.preventDefault();

    const { pdfInput, form, languageField, result } = elements;

    hideResult(result);

    const selectedFile = pdfInput.files[0];
    const diaInput = form.querySelector('input[name="dia"]:checked');
    const languageOption = form.querySelector('input[name="language"]:checked');

    if (!selectedFile) {
      return alert("Selecione um arquivo PDF antes de enviar.");
    }

    if (!diaInput) {
      return alert("Marque 1º ou 2º dia.");
    }

    if (!languageField.classList.contains("hidden") && !languageOption) {
      return alert(
        "Selecione a opção de Língua Estrangeira (Inglês, Espanhol ou Nenhum)."
      );
    }

    const start = diaInput.value === "1" ? 1 : 91;
    const end = diaInput.value === "1" ? 90 : 180;
    const respostasFiltradas = {};

    for (let i = start; i <= end; i++) {
      if (userAnswers[i]) {
        respostasFiltradas[i] = userAnswers[i].toUpperCase();
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
    } catch (err) {
      if (err instanceof TypeError) {
        showError("Servidor indisponível. Tente novamente.", result);
      } else {
        showError(err.message || "Erro inesperado.", result);
      }
    }
  };
}
