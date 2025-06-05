import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  buscarContratoPorId,
  ativarContrato,
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
  const { id } = useParams()
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nomeFantasia: '',
    cnpj: '',
    statusContrato: '',
    valor: '',
    descricao: '',
    tipo: '',
    dataInicio: '',
    dataFim: '',
    nomeResponsavel: '',
  })
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchContrato = async () => {
      try {
        const response = await buscarContratoPorId(id)
        const data = response.data
        setFormData({
          nomeFantasia: data.nomeFantasia || '',
          cnpj: data.cnpj || '',
          statusContrato: data.statusContrato || '',
          valor: data.valor || '',
          descricao: data.descricao || '',
          tipo: data.tipo || '',
          dataInicio: data.dataInicio || '',
          dataFim: data.dataFim || '',
          nomeResponsavel: data.nomeResponsavel || '',
        })
      } catch (err) {
        console.error('Erro ao buscar contrato:', err)
        setError('Não foi possível carregar os dados do contrato.')
      } finally {
        setLoading(false)
      }
    };
    fetchContrato();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpa alerts e erros ao começar a digitar/alterar
    setShowSuccessAlert(false)
    setError(null);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setShowSuccessAlert(false);
    setError(null);

    try {
      await ativarContrato(id);
      setShowSuccessAlert(true);

      // Não redireciona imediatamente, espera o alert desaparecer
      setTimeout(() => {
        setShowSuccessAlert(false);
        navigate("/colaboradores");
      }, 3000); // Exibe o alert por 3 segundos
    } catch (error) {
      console.error("Erro ao atualizar colaborador:", error);
      setError("Erro ao atualizar colaborador. Verifique os campos.");
    } finally {
      setIsSaving(false);
    }
  }

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

          <CCol md={4}>
            <CFormLabel htmlFor="statusContrato">Status do Contrato</CFormLabel>
            <CFormSelect
              id="statusContrato"
              name="statusContrato"
              value={formData.statusContrato}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
              <option value="ENCERRADO">Encerrado</option>
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

          <CCol md={4}>
            <CFormLabel htmlFor="tipo">Tipo</CFormLabel>
            <CFormSelect
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              <option value="COMUNICACAO">COMUNICAÇÃO</option>
              <option value="SERVICO">SERVIÇO</option>
              <option value="INFRAESTRUTURA">INFRAESTRUTURA</option>
              <option value="POSTO_DE_SERVICO">POSTO DE SERVIÇO</option>
            </CFormSelect>
          </CCol>

          <CCol md={6}>
            <CFormLabel htmlFor="dataInicio">Data Início</CFormLabel>
            <CFormInput
              id="dataInicio"
              name="dataInicio"
              type="date"
              value={formData.dataInicio}
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
              disabled
            />
          </CCol>

          <CCol xs={12}>
            <CFormTextarea
              id="descricao"
              label="Descrição"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows={4}
              required
            />
          </CCol>

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

          <CCol xs={12} className="mt-4 text-end">
            <CButton type="submit" color="success" className="text-white">
              Salvar Alterações
            </CButton>
          </CCol>
        </CForm>
      </CCardBody>
    </CCard>
  )
}
