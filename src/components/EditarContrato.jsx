import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  buscarContratoPorId,
  editarContrato,
} from "../services/contratoService";
import {
  CForm,
  CFormInput,
  CFormTextarea,
  CButton,
  CFormSelect,
  CCol,
  CFormLabel,
  CCard,
  CCardBody,
  CCardTitle,
  CSpinner,
  CAlert,
} from '@coreui/react'

export default function EditarContrato() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    // Estes campos são para exibição, serão preenchidos pelo `buscarContratoPorId`
    nomeFantasia: '',
    cnpj: '',
    valor: '',
    dataInicio: '',
    dataFim: '',
    // Estes campos são editáveis e correspondem ao ContratoPatchDTO
    statusContrato: '', // No front, manteremos este nome para o estado
    descricao: '',
    tipo: '',
    nomeResponsavel: '',
  });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContrato = async () => {
      try {
        const response = await buscarContratoPorId(id);
        const data = response.data;
        setFormData({
          // Campos desabilitados para exibição
          nomeFantasia: data.nomeFantasia || '',
          cnpj: data.cnpj || '',
          valor: data.valor || '',
          dataInicio: data.dataInicio || '',
          dataFim: data.dataFim || '',
          // Campos editáveis (para ContratoPatchDTO)
          statusContrato: data.statusContrato || '', // Note que o backend pode retornar 'status' ou 'statusContrato' dependendo do DTO de exibição
          descricao: data.descricao || '',
          tipo: data.tipo || '',
          nomeResponsavel: data.nomeResponsavel || '',
        });
      } catch (err) {
        console.error('Erro ao buscar contrato:', err);
        setError('Não foi possível carregar os dados do contrato.');
      } finally {
        setLoading(false);
      }
    };
    fetchContrato();
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

    // --- AQUI ESTÁ A MUDANÇA PRINCIPAL: MONTANDO O DTO PARA O BACKEND ---
    const contratoParaAtualizar = {
      descricao: formData.descricao,
      tipo: formData.tipo,
      status: formData.statusContrato, // Renomeando de 'statusContrato' (front) para 'status' (back)
      nomeResponsavel: formData.nomeResponsavel,
    };

    try {
      

      await editarContrato(id, contratoParaAtualizar); // Envia o DTO filtrado
      setShowSuccessAlert(true);

      setTimeout(() => {
        setShowSuccessAlert(false);
        navigate("/contrato");
      }, 1000);
    } catch (error) {
      console.error("Erro ao atualizar contrato:", error);
      // Detalhar o erro se o backend retornar mais informações úteis
      const errorMessage = error.response?.data?.message || "Erro ao atualizar contrato. Verifique os campos.";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/contrato");
  };

  if (loading) {
    return (
      <CCard
        className="p-4 d-flex justify-content-center align-items-center"
        style={{ minHeight: '200px' }}
      >
        <CSpinner color="primary" />
      </CCard>
    )
  }

  return (
    <CCard className="p-4">
      <CCardBody>
        <CCardTitle className="h4 mb-3">Editar Contrato</CCardTitle>

        {showSuccessAlert && (
          <CAlert color="success" dismissible className="mb-3">
            Contrato atualizado com sucesso!
          </CAlert>
        )}
        {error && (
          <CAlert color="danger" dismissible className="mb-3">
            {error}
          </CAlert>
        )}

        <CForm onSubmit={handleSubmit} className="row g-3">
          {/* Campos que não são editáveis e são exibidos como 'disabled' */}
          <CCol md={6}>
            <CFormLabel htmlFor="nomeFantasia">Nome Fantasia</CFormLabel>
            <CFormInput
              id="nomeFantasia"
              name="nomeFantasia"
              value={formData.nomeFantasia}
              onChange={handleChange}
              disabled
            />
          </CCol>

          <CCol md={6}>
            <CFormLabel htmlFor="cnpj">CNPJ</CFormLabel>
            <CFormInput
              id="cnpj"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              disabled
            />
          </CCol>

          {/* Campo 'statusContrato' no front, mas é 'status' no DTO do back */}
          <CCol md={4}>
            <CFormLabel htmlFor="statusContrato">Status do Contrato (*)</CFormLabel>
            <CFormSelect
              id="statusContrato"
              name="statusContrato"
              value={formData.statusContrato}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              <option value="ATIVO">Ativo</option>
              <option value="CANCELADO">Inativo</option>
              <option value="ARQUIVADO">Arquivado</option>
            </CFormSelect>
          </CCol>

          <CCol md={4}>
            <CFormLabel htmlFor="valor">Valor</CFormLabel>
            <CFormInput
              id="valor"
              name="valor"
              value={`R$ ${Number(formData.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              onChange={handleChange}
              disabled
            />
          </CCol>

          {/* Campo 'tipo' */}
          <CCol md={4}>
            <CFormLabel htmlFor="tipo">Tipo (*)</CFormLabel>
            <CFormSelect
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              <option value="POSTO_DE_SERVICO">POSTO DE SERVIÇO</option>
              <option value="SERVICO">SERVIÇO</option>
              <option value="COMUNICACAO">COMUNICAÇÃO</option>
              <option value="INFRAESTRUTURA">INFRAESTRUTURA</option>
              <option value="DESENVOLVIMENTO">DESENVOLVIMENTO</option>
            </CFormSelect>
          </CCol>

          <CCol md={6}>
            <CFormLabel htmlFor="dataInicio">Data Início</CFormLabel>
            <CFormInput
              id="dataInicio"
              name="dataInicio"
              type="date"
              value={formData.dataInicio}
              onChange={handleChange} // Mantenha o onChange para evitar warning, mas o campo está disabled
              disabled
            />
          </CCol>

          <CCol md={6}>
            <CFormLabel htmlFor="dataFim">Data Fim</CFormLabel>
            <CFormInput
              id="dataFim"
              name="dataFim"
              type="date"
              value={formData.dataFim}
              onChange={handleChange} // Mantenha o onChange para evitar warning, mas o campo está disabled
              disabled
            />
          </CCol>

          {/* Campo 'descricao' */}
          <CCol xs={12}>
            <CFormTextarea
              id="descricao"
              label="Descrição (*)"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows={4}
              required
            />
          </CCol>

          {/* Campo 'nomeResponsavel' */}
          <CCol md={6}>
            <CFormLabel htmlFor="nomeResponsavel">Nome do Responsável (*)</CFormLabel>
            <CFormInput
              id="nomeResponsavel"
              name="nomeResponsavel"
              value={formData.nomeResponsavel}
              onChange={handleChange}
              required
            />
          </CCol>

          <CCol xs={12} className="mt-4 text-end">
            <CButton color="secondary" onClick={handleCancel} className="me-2">
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