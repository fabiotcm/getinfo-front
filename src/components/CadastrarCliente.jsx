import React, { useState } from "react";
import {
  CForm,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CButton,
  CRow,
  CCol,
  CFormLabel,
} from "@coreui/react";

export default function CadastrarCliente() {
  const [formData, setFormData] = useState({
    nomeResponsavel: "",
    sobrenomeResponsavel: "",
    cpfResponsavel: "",
    emailResponsavel: "",
    telefoneResponsavel: "",
    razaoSocial: "",
    nomeFantasia: "",
    logradouro: "",
    cep: "",
    bairro: "",
    numero: "",
    complemento: "",
    emailEmpresa: "",
    telefoneEmpresa: "",
    cnpj: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "anexo") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dados do cliente:", formData);
    alert("Cliente cadastrado com sucesso!");
      // Reset opcional
    setFormData((prev) => ({ ...prev, descricao: "", entregaveis: "" }));
  };

  return (
    <div className="p-4 space-y-4">
      <CForm onSubmit={handleSubmit} className="space-y-4">
        {/* ================== RESPONSÁVEL PELA EMPRESA ================== */}
        <CRow>
          <CCol md={6} className="space-y-1">
            <CFormLabel htmlFor="nomeResponsavel">Nome do Responsável</CFormLabel>
            <CFormInput
              id="nomeResponsavel"
              name="nomeResponsavel"
              value={formData.nomeResponsavel}
              onChange={handleChange}
              required
            />
          </CCol>
          <CCol md={6} className="space-y-1">
            <CFormLabel htmlFor="sobrenomeResponsavel">Sobrenome do Responsável</CFormLabel>
            <CFormInput
              id="sobrenomeResponsavel"
              name="sobrenomeResponsavel"
              value={formData.sobrenomeResponsavel}
              onChange={handleChange}
              required
            />
          </CCol>
        </CRow>

        <CRow>
          <CCol md={4} className="space-y-1">
            <CFormLabel htmlFor="cpfResponsavel">CPF</CFormLabel>
            <CFormInput
              id="cpfResponsavel"
              name="cpfResponsavel"
              value={formData.cpfResponsavel}
              onChange={handleChange}
              required
            />
          </CCol>
          <CCol md={4} className="space-y-1">
            <CFormLabel htmlFor="emailResponsavel">Email</CFormLabel>
            <CFormInput
              type="email"
              id="emailResponsavel"
              name="emailResponsavel"
              value={formData.emailResponsavel}
              onChange={handleChange}
              required
            />
          </CCol>
          <CCol md={4} className="space-y-1">
            <CFormLabel htmlFor="telefoneResponsavel">Telefone</CFormLabel>
            <CFormInput
              type="tel"
              id="telefoneResponsavel"
              name="telefoneResponsavel"
              value={formData.telefoneResponsavel}
              onChange={handleChange}
              required
            />
          </CCol>
        </CRow>

        {/* ================== EMPRESA ================== */}
        <CRow>
          <CCol md={6} className="space-y-1">
            <CFormLabel htmlFor="razaoSocial">Razão Social</CFormLabel>
            <CFormInput
              id="razaoSocial"
              name="razaoSocial"
              value={formData.razaoSocial}
              onChange={handleChange}
              required
            />
          </CCol>
          <CCol md={6} className="space-y-1">
            <CFormLabel htmlFor="nomeFantasia">Nome Fantasia</CFormLabel>
            <CFormInput
              id="nomeFantasia"
              name="nomeFantasia"
              value={formData.nomeFantasia}
              onChange={handleChange}
              required
            />
          </CCol>
        </CRow>

        <CRow>
          <CCol md={4} className="space-y-1">
            <CFormLabel htmlFor="logradouro">Logradouro</CFormLabel>
            <CFormInput
              id="logradouro"
              name="logradouro"
              value={formData.logradouro}
              onChange={handleChange}
              required
            />
          </CCol>
          <CCol md={2} className="space-y-1">
            <CFormLabel htmlFor="numero">Número</CFormLabel>
            <CFormInput
              id="numero"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              required
            />
          </CCol>
          <CCol md={3} className="space-y-1">
            <CFormLabel htmlFor="bairro">Bairro</CFormLabel>
            <CFormInput
              id="bairro"
              name="bairro"
              value={formData.bairro}
              onChange={handleChange}
              required
            />
          </CCol>
          <CCol md={3} className="space-y-1">
            <CFormLabel htmlFor="cep">CEP</CFormLabel>
            <CFormInput
              id="cep"
              name="cep"
              value={formData.cep}
              onChange={handleChange}
              required
            />
          </CCol>
        </CRow>

        <CRow>
          <CCol md={6} className="space-y-1">
            <CFormLabel htmlFor="complemento">Complemento</CFormLabel>
            <CFormInput
              id="complemento"
              name="complemento"
              value={formData.complemento}
              onChange={handleChange}
            />
          </CCol>
          <CCol md={3} className="space-y-1">
            <CFormLabel htmlFor="emailEmpresa">Email da Empresa</CFormLabel>
            <CFormInput
              type="email"
              id="emailEmpresa"
              name="emailEmpresa"
              value={formData.emailEmpresa}
              onChange={handleChange}
              required
            />
          </CCol>
          <CCol md={3} className="space-y-1">
            <CFormLabel htmlFor="telefoneEmpresa">Telefone da Empresa</CFormLabel>
            <CFormInput
              type="tel"
              id="telefoneEmpresa"
              name="telefoneEmpresa"
              value={formData.telefoneEmpresa}
              onChange={handleChange}
              required
            />
          </CCol>
        </CRow>

        <CRow>
          <CCol md={6} className="space-y-1">
            <CFormLabel htmlFor="cnpj">CNPJ</CFormLabel>
            <CFormInput
              id="cnpj"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              required
            />
          </CCol>
        </CRow>

        <div className="flex justify-end">
          <CButton type="submit" color="primary">
            Salvar Contrato
          </CButton>
        </div>
      </CForm>
    </div>
  );
}
