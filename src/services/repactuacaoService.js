// src/services/repactuacaoService.js
import api from "../api/Api"; // Importa a instância do Axios configurada

export const listarTodasRepactuacoes = () => {
  return api.get("/repactuacoes");
};

export const buscarRepactuacaoPorId = (id) => {
  return api.get(`/repactuacoes/${id}`);
};

export const viewAnexoRepactuacao = (id) => {
  return api.get(`/repactuacoes/view/${id}`, {
    responseType: "blob", // Indica que a resposta é um arquivo binário (Blob)
  });
};

export const downloadAnexoRepactuacao = (id) => {
  return api.get(`/repactuacoes/download/${id}`, {
    responseType: "blob", // Indica que a resposta é um arquivo binário (Blob)
  });
};

export const uploadAnexoRepactuacao = (id, file) => {
  const formData = new FormData(); // Cria um objeto FormData para enviar o arquivo
  formData.append("anexo", file); // 'anexo' deve ser o nome do parâmetro no backend (@RequestParam("anexo"))

  return api.post(`/repactuacoes/upload/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data", // Importante para upload de arquivos
    },
  });
};
