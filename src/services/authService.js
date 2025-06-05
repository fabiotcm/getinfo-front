// src/services/authService.js

import api from "../api/Api";

// Registro de novo usuário
export const register = (dados) => api.post("/auth/register", dados);

// Login de usuário
export const login = (dados) => api.post("/auth/login", dados);
