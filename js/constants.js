export const ERROR_MESSAGES = {
  QUESTION_NOT_FOUND:
    "As questões não foram encontradas no gabarito. Verifique se o dia está certo.",
  PDF_PARSE_ERROR: "Ocorreu um erro ao processar o PDF.",
  EXAM_YEAR_NOT_FOUND: "Ano da prova não encontrado no gabarito.",
  INVALID_EXAM_YEAR: "O ano da prova é inferior ao suportado.",
  INVALID_PARAMETERS:
    "Parâmetros inválidos. Verifique as alternativas estão marcadas.",
  UNKNOWN_ERROR: "Erro desconhecido. Tente novamente mais tarde.",
};

export const API = {
  BASE_URL: "https://enem-icih.onrender.com",
  CORRECT_EXAM: "/api/v1/correct-exam",
};