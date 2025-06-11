// src/services/aditivoService.js
import api from "../api/Api"; // Importa a instância do Axios configurada

// Listar todos os aditivos
export const listarTodosAditivos = () => api.get("/aditivos");

// Buscar aditivo por ID
export const buscarAditivoPorId = (id) => api.get(`/aditivos/${id}`);

// Listar entregáveis de um aditivo por ID do aditivo
export const listarEntregaveisDoAditivo = (id) =>
  api.get(`/aditivos/entregaveis/${id}`);

// Visualizar anexo de um aditivo (abre inline no navegador)
export const viewAnexoAditivo = (id) =>
  api.get(`/aditivos/view/${id}`, {
    responseType: "blob", // Indica que a resposta é um arquivo binário (Blob)
  });

// Fazer download do anexo de um aditivo
export const downloadAnexoAditivo = (id) =>
  api.get(`/aditivos/download/${id}`, {
    responseType: "blob", // Indica que a resposta é um arquivo binário (Blob)
  });

// Adicionar um entregável a um aditivo
// Recebe o ID do aditivo e os dados do entregável (EntregavelCreateDTO)
export const adicionarEntregavelAoAditivo = (id, entregavelData) =>
  api.post(`/aditivos/entregavel/${id}`, entregavelData);

// Fazer upload de anexo para um aditivo
// Recebe o ID do aditivo e o arquivo (MultipartFile)
export const uploadAnexoAditivo = (id, file) => {
  const formData = new FormData(); // Cria um objeto FormData para enviar o arquivo
  formData.append("anexo", file); // 'anexo' deve ser o nome do parâmetro no backend (@RequestParam("anexo"))
  return api.post(`/aditivos/upload/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data", // Importante para upload de arquivos
    },
  });
};
