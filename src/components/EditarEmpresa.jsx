import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CForm,
  CFormInput,
  CFormSelect,
  CButton,
  CCol,
  CRow,
  CFormLabel,
  CCard,
  CCardBody,
  CCardTitle,
  CCardText,
  CSpinner,
  CAlert
} from "@coreui/react";
import { getEmpresaById, updateEmpresa } from "../services/empresaService";

export default function EditarEmpresa() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEmpresa() {
      try {
        const response = await getEmpresaById(id);
        setFormData(response.data || {});
      } catch (error) {
        console.error("Erro ao buscar empresa:", error);
        setError("Erro ao carregar dados da empresa.");
      } finally {
        setLoading(false);
      }
    }

    fetchEmpresa();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setShowSuccessAlert(false);
    setError(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setShowSuccessAlert(false);
    setError(null);

    try {
      await updateEmpresa(id, formData); // Envia formData com nome e sobrenome
      setShowSuccessAlert(true);

      setTimeout(() => {
        setShowSuccessAlert(false);
        navigate("/clientes");
      }, 1000);
    } catch (error) {
      console.error("Erro ao atualizar empresa:", error);
      setError("Erro ao atualizar empresa. Verifique os campos.");
    } finally {
      setIsSaving(false); // Desativa o estado de salvando
    }
  };

  if (loading || !formData) {
    return (
      <div className="text-center mt-5">
        <CSpinner color="primary" />
      </div>
    );
  }

  return (
    <CCard className="p-4">
      <CCardBody>
        <CCardTitle className="h4 mb-3">Editar Empresa</CCardTitle>

          {showSuccessAlert && (
            <CAlert color="success" dismissible className="mb-3">
              Colaborador atualizado com sucesso!
            </CAlert>
          )}
          {error && (
            <CAlert color="danger" dismissible className="mb-3">
              {error}
            </CAlert>
          )}
  
          <CForm onSubmit={handleSubmit} className="row g-3">
          {/* Informações Básicas */}
          <CCol xs={12}>
            <h5>Informações Básicas</h5>
          </CCol>

          <CCol md={4}>
            <CFormLabel>CNPJ</CFormLabel>
            <CFormInput
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              disabled
            />
          </CCol>

          <CCol md={4}>
            <CFormLabel>Razão Social (*)</CFormLabel>
            <CFormInput
              name="razaoSocial"
              value={formData.razaoSocial}
              onChange={handleChange}
              disabled
            />
          </CCol>

          <CCol md={4}>
            <CFormLabel>Nome Fantasia (*)</CFormLabel>
            <CFormInput
              name="nomeFantasia"
              value={formData.nomeFantasia}
              onChange={handleChange}
              placeholder="Nome Fantasia da Empresa"
            />
          </CCol>

          <CCol md={4}>
            <CFormLabel>Tipo de Empresa (*)</CFormLabel>
            <CFormSelect
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
            >
              <option value="">Selecione...</option>
              <option value="PUBLICA">Pública</option>
              <option value="PRIVADA">Privada</option>
            </CFormSelect>
          </CCol>

          {/* Endereço */}
          <CCol xs={12} className="mt-3">
            <h5>Endereço</h5>
          </CCol>

          <CCol md={4}>
            <CFormLabel>CEP (*)</CFormLabel>
            <CFormInput
            name="cep"
            value={formData.cep}
            onChange={handleChange}
            placeholder="00000-000"
            required
            />
          </CCol>
          <CCol md={4}>
            <CFormLabel>Logradouro (*)</CFormLabel>
            <CFormInput
            name="logradouro"
            value={formData.logradouro}
            onChange={handleChange}
            placeholder="Rua, Avenida, etc."
            required
            />
          </CCol>
          <CCol md={4}>
            <CFormLabel>Bairro (*)</CFormLabel>
            <CFormInput
            name="bairro"
            value={formData.bairro}
            onChange={handleChange}
            placeholder="Bairro"
            required
            />
          </CCol>
          <CCol md={2}>
            <CFormLabel>Número (*)</CFormLabel>
            <CFormInput
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            placeholder="Número"
            required
            />
          </CCol>
          <CCol md={3}>
            <CFormLabel>Cidade (*)</CFormLabel>
            <CFormInput
            name="cidade"
            value={formData.cidade}
            onChange={handleChange}
            placeholder="Cidade"
            required
            />
          </CCol>
          <CCol md={3}>
            <CFormLabel>Estado (*)</CFormLabel>
            <CFormSelect name="estado" value={formData.estado} onChange={handleChange}>
              <option value="">Selecione...</option>
              {[
                "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
                "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN",
                "RO", "RR", "RS", "SC", "SE", "SP", "TO"
              ].map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol md={4}>
            <CFormLabel>Complemento</CFormLabel>
            <CFormInput
            name="complemento"
            value={formData.complemento}
            onChange={handleChange}
            placeholder="Complemento (opcional)"
            />
          </CCol>

          {/* Contato da Empresa */}
          <CCol xs={12} className="mt-3">
            <h5>Contato da Empresa</h5>
          </CCol>

          <CCol md={6}>
            <CFormLabel>Email (*)</CFormLabel>
            <CFormInput
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email da Empresa"
            required
            />
          </CCol>
          <CCol md={6}>
            <CFormLabel>Telefone (*)</CFormLabel>
            <CFormInput
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            placeholder="Telefone da Empresa"
            required
            />
          </CCol>

          {/* Responsável */}
          <CCol xs={12} className="mt-3">
            <h5>Responsável</h5>
          </CCol>

          <CCol md={6}>
            <CFormLabel>Nome (*)</CFormLabel>
            <CFormInput
            name="nomeResponsavel"
            value={formData.nomeResponsavel}
            onChange={handleChange}
            placeholder="Nome do Responsável"
            required
            />
          </CCol>
          <CCol md={6}>
            <CFormLabel>Email (*)</CFormLabel>
            <CFormInput
            name="emailResponsavel"
            value={formData.emailResponsavel}
            onChange={handleChange}
            placeholder="Email do Responsável"
            required
            />
          </CCol>
          <CCol md={6}>
            <CFormLabel>Telefone (*)</CFormLabel>
            <CFormInput
            name="telefoneResponsavel"
            value={formData.telefoneResponsavel}
            onChange={handleChange}
            placeholder="Telefone do Responsável"
            required
            />
          </CCol>
          <CCol md={6}>
            <CFormLabel>CPF (*)</CFormLabel>
            <CFormInput
            name="cpfResponsavel"
            value={formData.cpfResponsavel}
            onChange={handleChange}
            placeholder="CPF do Responsável"
            required
            />
          </CCol>

          <CCol xs={12} className="mt-4 text-end">
            <CButton color="secondary" className="me-2" onClick={() => navigate("/clientes")}>
              Cancelar
            </CButton>
            <CButton type="submit" color="success" disabled={isSaving} className="text-white">
              {isSaving ? (
                <>
                  <CSpinner component="span" size="sm" aria-hidden="true" className="me-2" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </CButton>
          </CCol>
        </CForm>
      </CCardBody>
    </CCard>
  );
}
