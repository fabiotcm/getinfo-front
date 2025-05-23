import api from "../api/Api";

export const getEmpresas = () => api.get("/empresas");
export const getEmpresaById = (id) => api.get(`/empresas/id/${id}`); 
export const createEmpresa = (dados) => api.post("/empresas", dados);
export const updateEmpresa = (id, dados) => api.put(`/empresas/${id}`, dados);
export const deleteEmpresa = (id) => api.delete(`/empresas/${id}`);