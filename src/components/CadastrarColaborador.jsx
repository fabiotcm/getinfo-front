import React, { useState } from "react";
import {
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CRow,
  CCol,
} from "@coreui/react";

export default function CadastrarColaborador() {
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    cpf: "",
    email: "",
    telefone: "",
    cargo: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dados do Colaborador:", formData);
    alert("Colaborador cadastrado com sucesso!");
    // Reset opcional
    setFormData({
      nome: "",
      sobrenome: "",
      cpf: "",
      email: "",
      telefone: "",
      cargo: "",
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h4>Cadastro de Colaborador</h4>
      <CForm onSubmit={handleSubmit} className="space-y-4">
        <CRow>
          <CCol md={6}>
            <CFormLabel htmlFor="nome">Nome</CFormLabel>
            <CFormInput
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </CCol>
          <CCol md={6}>
            <CFormLabel htmlFor="sobrenome">Sobrenome</CFormLabel>
            <CFormInput
              id="sobrenome"
              name="sobrenome"
              value={formData.sobrenome}
              onChange={handleChange}
              required
            />
          </CCol>
        </CRow>

        <CRow>
          <CCol md={4}>
            <CFormLabel htmlFor="cpf">CPF</CFormLabel>
            <CFormInput
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              required
            />
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="email">Email</CFormLabel>
            <CFormInput
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="telefone">Telefone</CFormLabel>
            <CFormInput
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              required
            />
          </CCol>
        </CRow>

        <CRow>
          <CCol md={6}>
            <CFormLabel htmlFor="cargo">Cargo</CFormLabel>
            <CFormInput
              id="cargo"
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              required
            />
          </CCol>
        </CRow>

        <div className="flex justify-end mt-4">
          <CButton type="submit" color="primary">
            Salvar Colaborador
          </CButton>
        </div>
      </CForm>
    </div>
  );
}
