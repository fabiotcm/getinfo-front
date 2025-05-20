import React, { useState } from "react";
import {
  CForm,
  CFormInput,
  CFormSelect,
  CButton,
  CRow,
  CCol,
  CFormLabel,
} from "@coreui/react";
import { createEmpresa } from "../services/empresaService";

export default function CadastrarEmpresa() {
  const [formData, setFormData] = useState({
    cnpj: "",
    razaoSocial: "",
    nomeFantasia: "",
    tipo: "",
    cep: "",
    logradouro: "",
    bairro: "",
    numero: "",
    cidade: "",
    estado: "", // Novo campo
    complemento: "",
    email: "",
    telefone: "",
    nomeResponsavel: "",
    emailResponsavel: "",
    telefoneResponsavel: "",
    cpfResponsavel: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createEmpresa(formData);
      alert('Empresa cadastrada com sucesso!');
    } catch (error) {
      console.error('Erro ao cadastrar cliente', error);
      console.error('Detalhes do backend:', error.response?.data);
      alert('Erro ao cadastrar: ' + (error.response?.data?.message || 'Verifique os campos'));
    }

    console.log("Dados da Empresa:", formData);
  };

  return (
    <div className="p-4 space-y-4">
      <CForm onSubmit={handleSubmit} className="space-y-4">
        {/* INFORMAÇÕES DA EMPRESA */}
        <h4>Informações da Empresa</h4>
        <CRow className="mb-3">
          <CCol md={4}>
            <CFormLabel htmlFor="cnpj">CNPJ</CFormLabel>
            <CFormInput
              id="cnpj"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              required
            />
          </CCol>

          <CCol md={4}>
            <CFormLabel htmlFor="razaoSocial">Razão Social</CFormLabel>
            <CFormInput
              id="razaoSocial"
              name="razaoSocial"
              value={formData.razaoSocial}
              onChange={handleChange}
              required
            />
          </CCol>

          <CCol md={4}>
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

        <CRow className="mb-3">
          <CCol md={4}>
            <CFormLabel htmlFor="tipo">Tipo de Empresa</CFormLabel>
            <CFormSelect
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              <option value="PUBLICA">Pública</option>
              <option value="PRIVADA">Privada</option>
            </CFormSelect>
          </CCol>

          <CCol md={4}>
            <CFormLabel htmlFor="cep">CEP</CFormLabel>
            <CFormInput
              id="cep"
              name="cep"
              value={formData.cep}
              onChange={handleChange}
              required
            />
          </CCol>

          <CCol md={4}>
            <CFormLabel htmlFor="logradouro">Logradouro</CFormLabel>
            <CFormInput
              id="logradouro"
              name="logradouro"
              value={formData.logradouro}
              onChange={handleChange}
              required
            />
          </CCol>
        </CRow>

        <CRow className="mb-3">
          <CCol md={3}>
            <CFormLabel htmlFor="bairro">Bairro</CFormLabel>
            <CFormInput
              id="bairro"
              name="bairro"
              value={formData.bairro}
              onChange={handleChange}
              required
            />
          </CCol>

          <CCol md={2}>
            <CFormLabel htmlFor="numero">Número</CFormLabel>
            <CFormInput
              id="numero"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              required
            />
          </CCol>

          <CCol md={3}>
            <CFormLabel htmlFor="cidade">Cidade</CFormLabel>
            <CFormInput
              id="cidade"
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
              required
            />
          </CCol>

          <CCol md={2}>
            <CFormLabel htmlFor="estado">Estado</CFormLabel>
            <CFormSelect
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              <option value="AC">AC</option>
              <option value="AL">AL</option>
              <option value="AP">AP</option>
              <option value="AM">AM</option>
              <option value="BA">BA</option>
              <option value="CE">CE</option>
              <option value="DF">DF</option>
              <option value="ES">ES</option>
              <option value="GO">GO</option>
              <option value="MA">MA</option>
              <option value="MG">MG</option>
              <option value="MS">MS</option>
              <option value="MT">MT</option>
              <option value="PA">PA</option>
              <option value="PB">PB</option>
              <option value="PE">PE</option>
              <option value="PI">PI</option>
              <option value="PR">PR</option>
              <option value="RJ">RJ</option>
              <option value="RN">RN</option>
              <option value="RO">RO</option>
              <option value="RR">RR</option>
              <option value="RS">RS</option>
              <option value="SC">SC</option>
              <option value="SE">SE</option>
              <option value="SP">SP</option>
              <option value="TO">TO</option>
            </CFormSelect>
          </CCol>

          <CCol md={2}>
            <CFormLabel htmlFor="complemento">Complemento</CFormLabel>
            <CFormInput
              id="complemento"
              name="complemento"
              value={formData.complemento}
              onChange={handleChange}
            />
          </CCol>
        </CRow>

        <CRow className="mb-3">
          <CCol md={6}>
            <CFormLabel htmlFor="email">Email da Empresa</CFormLabel>
            <CFormInput
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </CCol>

          <CCol md={6}>
            <CFormLabel htmlFor="telefone">Telefone da Empresa</CFormLabel>
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

        {/* INFORMAÇÕES DO RESPONSÁVEL */}
        <h4>Informações do Responsável</h4>
        <CRow className="mb-3">
          <CCol md={6}>
            <CFormLabel htmlFor="nomeResponsavel">Nome do Responsável</CFormLabel>
            <CFormInput
              id="nomeResponsavel"
              name="nomeResponsavel"
              value={formData.nomeResponsavel}
              onChange={handleChange}
              required
            />
          </CCol>

          <CCol md={6}>
            <CFormLabel htmlFor="emailResponsavel">Email do Responsável</CFormLabel>
            <CFormInput
              type="email"
              id="emailResponsavel"
              name="emailResponsavel"
              value={formData.emailResponsavel}
              onChange={handleChange}
              required
            />
          </CCol>
        </CRow>

        <CRow>
          <CCol md={6}>
            <CFormLabel htmlFor="telefoneResponsavel">Telefone do Responsável</CFormLabel>
            <CFormInput
              type="tel"
              id="telefoneResponsavel"
              name="telefoneResponsavel"
              value={formData.telefoneResponsavel}
              onChange={handleChange}
              required
            />
          </CCol>

          <CCol md={6}>
            <CFormLabel htmlFor="cpfResponsavel">CPF do Responsável</CFormLabel>
            <CFormInput
              id="cpfResponsavel"
              name="cpfResponsavel"
              value={formData.cpfResponsavel}
              onChange={handleChange}
              required
            />
          </CCol>
        </CRow>

        <div className="flex justify-end mt-4">
          <CButton type="submit" color="primary">
            Salvar Cliente
          </CButton>
        </div>
      </CForm>
    </div>
  );
}
