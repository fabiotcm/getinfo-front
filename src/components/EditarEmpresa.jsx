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
} from "@coreui/react";
import { getEmpresaById, updateEmpresa } from "../services/empresaService";

export default function EditarEmpresa() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchEmpresa() {
      try {
        const response = await getEmpresaById(id);
        setFormData(response.data || {});
      } catch (error) {
        console.error("Erro ao buscar empresa:", error);
        alert("Erro ao carregar dados da empresa.");
      } finally {
        setLoading(false);
      }
    }

    fetchEmpresa();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateEmpresa(id, formData);
      alert("Empresa atualizada com sucesso!");
      navigate("/clientes");
    } catch (error) {
      console.error("Erro ao atualizar empresa", error);
      alert("Erro ao atualizar. Verifique os dados e tente novamente.");
    } finally {
      setSaving(false);
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

        <CForm className="row g-3">
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
            />
          </CCol>

          <CCol md={4}>
            <CFormLabel>Razão Social</CFormLabel>
            <CFormInput
              name="razaoSocial"
              value={formData.razaoSocial}
              onChange={handleChange}
            />
          </CCol>

          <CCol md={4}>
            <CFormLabel>Nome Fantasia</CFormLabel>
            <CFormInput
              name="nomeFantasia"
              value={formData.nomeFantasia}
              onChange={handleChange}
            />
          </CCol>

          <CCol md={4}>
            <CFormLabel>Tipo de Empresa</CFormLabel>
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
            <CFormLabel>CEP</CFormLabel>
            <CFormInput name="cep" value={formData.cep} onChange={handleChange} />
          </CCol>
          <CCol md={4}>
            <CFormLabel>Logradouro</CFormLabel>
            <CFormInput name="logradouro" value={formData.logradouro} onChange={handleChange} />
          </CCol>
          <CCol md={4}>
            <CFormLabel>Bairro</CFormLabel>
            <CFormInput name="bairro" value={formData.bairro} onChange={handleChange} />
          </CCol>
          <CCol md={2}>
            <CFormLabel>Número</CFormLabel>
            <CFormInput name="numero" value={formData.numero} onChange={handleChange} />
          </CCol>
          <CCol md={3}>
            <CFormLabel>Cidade</CFormLabel>
            <CFormInput name="cidade" value={formData.cidade} onChange={handleChange} />
          </CCol>
          <CCol md={3}>
            <CFormLabel>Estado</CFormLabel>
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
            <CFormInput name="complemento" value={formData.complemento} onChange={handleChange} />
          </CCol>

          {/* Contato da Empresa */}
          <CCol xs={12} className="mt-3">
            <h5>Contato da Empresa</h5>
          </CCol>

          <CCol md={6}>
            <CFormLabel>Email</CFormLabel>
            <CFormInput name="email" value={formData.email} onChange={handleChange} />
          </CCol>
          <CCol md={6}>
            <CFormLabel>Telefone</CFormLabel>
            <CFormInput name="telefone" value={formData.telefone} onChange={handleChange} />
          </CCol>

          {/* Responsável */}
          <CCol xs={12} className="mt-3">
            <h5>Responsável</h5>
          </CCol>

          <CCol md={6}>
            <CFormLabel>Nome</CFormLabel>
            <CFormInput name="nomeResponsavel" value={formData.nomeResponsavel} onChange={handleChange} />
          </CCol>
          <CCol md={6}>
            <CFormLabel>Email</CFormLabel>
            <CFormInput name="emailResponsavel" value={formData.emailResponsavel} onChange={handleChange} />
          </CCol>
          <CCol md={6}>
            <CFormLabel>Telefone</CFormLabel>
            <CFormInput name="telefoneResponsavel" value={formData.telefoneResponsavel} onChange={handleChange} />
          </CCol>
          <CCol md={6}>
            <CFormLabel>CPF</CFormLabel>
            <CFormInput name="cpfResponsavel" value={formData.cpfResponsavel} onChange={handleChange} />
          </CCol>

          <CCol xs={12} className="mt-4 text-end">
            <CButton color="secondary" className="me-2" onClick={() => navigate("/clientes")}>
              Cancelar
            </CButton>
            <CButton color="success" onClick={handleSave} disabled={saving} className="text-white">
              {saving ? (
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
