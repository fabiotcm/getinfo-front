import api from "../api/Api";

export const getColaboradores = () => api.get("/colaboradores");
export const getColaboradorById = (id) => api.get(`/colaboradores/${id}`);
export const createColaborador = (dados) => api.post("/colaboradores", dados);
export const updateColaborador = (id, dados) => api.put(`/colaboradores/${id}`, dados);
export const deleteColaborador = (id) => api.delete(`/colaboradores/${id}`);
