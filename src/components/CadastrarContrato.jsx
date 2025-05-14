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

export default function CadastrarContrato() {
  const [formData, setFormData] = useState({
    cnpj: "",
    tipoContrato: "",
    valorContrato: "",
    descricao: "",
    anexo: null,
    funcionarioResponsavel: "",
    entregaveis: "",
    prazo: "",
    dataInicio: "",
    dataEntrega: "",
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
    console.log("Dados do contrato:", formData);
    alert("Contrato cadastrado com sucesso!");
      // Reset opcional
    setFormData((prev) => ({ ...prev, descricao: "", entregaveis: "" }));
  };

  return (
    <div className="p-4 space-y-4">
      <CForm onSubmit={handleSubmit} className="space-y-4">
        <h4>Cadastro de Contrato</h4>

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
          <CCol md={6} className="space-y-1">
            <CFormLabel htmlFor="tipoContrato">Tipo de Contrato</CFormLabel>
            <CFormSelect
              id="tipoContrato"
              name="tipoContrato"
              value={formData.tipoContrato}
              onChange={handleChange}
              required
            >
              <option value="">Selecione</option>
              <option value="servico">Serviço</option>
              <option value="comunicacao">Comunicação</option>
              <option value="infraestrutura">Infraestrutura</option>
              <option value="desenvolvimento">Desenvolvimento</option>
            </CFormSelect>
          </CCol>
        </CRow>

        <CRow>
          <CCol md={4} className="space-y-1">
            <CFormLabel htmlFor="valorContrato">Valor do Contrato</CFormLabel>
            <CFormInput
              type="number"
              id="valorContrato"
              name="valorContrato"
              value={formData.valorContrato}
              onChange={handleChange}
              required
            />
          </CCol>
          <CCol md={4} className="space-y-1">
            <CFormLabel htmlFor="prazo">Prazo</CFormLabel>
            <CFormInput
              id="prazo"
              name="prazo"
              value={formData.prazo}
              onChange={handleChange}
              required
            />
          </CCol>
          <CCol md={4} className="space-y-1">
            <CFormLabel htmlFor="funcionarioResponsavel">Colaborador Responsável</CFormLabel>
            <CFormInput
              id="funcionarioResponsavel"
              name="funcionarioResponsavel"
              value={formData.funcionarioResponsavel}
              onChange={handleChange}
              required
            />
          </CCol>
        </CRow>

        <CRow>
          <CCol md={6} className="space-y-1">
            <CFormLabel htmlFor="dataInicio">Data de Início</CFormLabel>
            <CFormInput
              type="date"
              id="dataInicio"
              name="dataInicio"
              value={formData.dataInicio}
              onChange={handleChange}
              required
            />
          </CCol>
          <CCol md={6} className="space-y-1">
            <CFormLabel htmlFor="dataEntrega">Data de Entrega</CFormLabel>
            <CFormInput
              type="date"
              id="dataEntrega"
              name="dataEntrega"
              value={formData.dataEntrega}
              onChange={handleChange}
              required
            />
          </CCol>
        </CRow>

        <CRow>
          <CCol md={12} className="space-y-1">
            <CFormLabel htmlFor="descricao">Descrição</CFormLabel>
            <CFormTextarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows={4}
              placeholder="Descreva o escopo do contrato"
              required
            />
          </CCol>
        </CRow>

        <CRow>
          <CCol md={12} className="space-y-1">
            <CFormLabel htmlFor="entregaveis">Entregáveis</CFormLabel>
            <CFormTextarea
              id="entregaveis"
              name="entregaveis"
              value={formData.entregaveis}
              onChange={handleChange}
              rows={3}
              placeholder="Liste os entregáveis separados por vírgula ou linha"
            />
          </CCol>
        </CRow>

        <CRow>
          <CCol md={12} className="space-y-1">
            <CFormLabel htmlFor="anexo">Anexo de Documentos</CFormLabel>
            <CFormInput
              type="file"
              id="anexo"
              name="anexo"
              onChange={handleChange}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
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
