import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CForm,
  CFormInput,
  CFormTextarea,
  CButton,
  CCol,
  CRow,
  CFormLabel,
  CCard,
  CCardBody,
  CCardTitle,
  CAlert,
  CSpinner
} from '@coreui/react';
import { repactuarContrato, buscarContratoPorId } from '../services/contratoService';
import { uploadAnexoRepactuacao } from '../services/repactuacaoService'; // Importa o serviço de upload de anexo de repactuação

export default function Repactuacao() {
  const { id } = useParams(); // ID do contrato
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    novoValorContrato: '',
    dataRepactuacao: new Date().toISOString().split('T')[0],
    novaDataFinal: '',
    descricao: '',
    motivoRepactuacao: '',
    documentosAnexos: [], // NOVO: Estado para armazenar os documentos anexados
  });

  const [contrato, setContrato] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [error, setError] = useState(null);

  // Efeito para buscar os dados do contrato original e pré-preencher o formulário
  useEffect(() => {
    const fetchContrato = async () => {
      try {
        const response = await buscarContratoPorId(id);
        const contratoData = response.data;
        setContrato(contratoData);

        setFormData(prev => ({
          ...prev,
          novoValorContrato: contratoData.valorContrato ? String(contratoData.valorContrato) : '',
          novaDataFinal: contratoData.dataFim || '',
        }));
      } catch (error) {
        console.error('Erro ao buscar contrato:', error);
        setError('Ocorreu um erro ao buscar os dados do contrato. Verifique o ID e tente novamente.');
      }
    };

    if (id) {
      fetchContrato();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'documentosAnexos') {
      // Converte FileList para Array para armazenar múltiplos arquivos
      setFormData(prev => ({ ...prev, [name]: Array.from(files) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setShowSuccessAlert(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setShowSuccessAlert(false);
    setError(null);

    // --- Validações de Frontend ---
    if (!formData.novoValorContrato || parseFloat(formData.novoValorContrato) <= 0) {
      setError('O Novo Valor do Contrato deve ser um número maior que zero.');
      setIsSaving(false);
      return;
    }

    if (!formData.dataRepactuacao) {
      setError('A Data de Repactuação é obrigatória.');
      setIsSaving(false);
      return;
    }

    if (!formData.novaDataFinal) {
      setError('A Nova Data Final é obrigatória.');
      setIsSaving(false);
      return;
    }

    const dataRepactuacaoObj = new Date(formData.dataRepactuacao);
    const novaDataFinalObj = new Date(formData.novaDataFinal);

    dataRepactuacaoObj.setHours(0, 0, 0, 0);
    novaDataFinalObj.setHours(0, 0, 0, 0);

    if (novaDataFinalObj.getTime() < dataRepactuacaoObj.getTime()) {
      setError('A Nova Data Final não pode ser anterior à Data de Repactuação.');
      setIsSaving(false);
      return;
    }
    
    if (!formData.descricao.trim()) {
      setError('A Descrição é obrigatória.');
      setIsSaving(false);
      return;
    }

    if (!formData.motivoRepactuacao.trim()) {
      setError('O Motivo da Repactuação é obrigatório.');
      setIsSaving(false);
      return;
    }
    // --- Fim das Validações de Frontend ---

    try {
      const repactuacaoData = {
        novoValorContrato: parseFloat(formData.novoValorContrato),
        dataRepactuacao: formData.dataRepactuacao,
        novaDataFinal: formData.novaDataFinal,
        descricao: formData.descricao.trim(),
        motivoRepactuacao: formData.motivoRepactuacao.trim(),
      };

      console.log('Enviando dados da repactuação:', repactuacaoData);
      const response = await repactuarContrato(id, repactuacaoData);
      // Supondo que a resposta de 'repactuarContrato' contenha o ID da repactuação criada
      const repactuacaoId = response.data.id; 
      console.log('Repactuação criada com sucesso. ID:', repactuacaoId);

      // NOVO: Faz upload dos anexos para a repactuação recém-criada
      if (formData.documentosAnexos.length > 0) {
        for (const file of formData.documentosAnexos) {
          console.log('Enviando anexo para repactuação ID:', repactuacaoId, 'arquivo:', file.name);
          await uploadAnexoRepactuacao(repactuacaoId, file);
        }
        console.log('Todos os anexos da repactuação foram enviados.');
      }

      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false);
        navigate(`/contrato/${id}`);
      }, 2000);

    } catch (error) {
      setShowSuccessAlert(false);
      setIsSaving(false);
      console.error('Erro ao criar repactuação:', error.response?.data || error.message);
      setError('Ocorreu um erro ao criar a repactuação. Verifique os dados e tente novamente.');
    }
  };

  console.log('Dados do contrato:', contrato);

  return (
    <div className="body flex-grow-1 p-4">
      <CCard className="p-4">
        <CCardBody>
          <CCardTitle className="h4 mb-3">
            Inserir Repactuação para o Contrato #{id}
            {contrato && ` (${contrato.nomeFantasia})`}
          </CCardTitle>

          {showSuccessAlert && (
            <CAlert color="success" dismissible className="mb-3">
              Repactuação adicionada com sucesso! Redirecionando...
            </CAlert>
          )}
          {error && (
            <CAlert color="danger" dismissible className="mb-3">
              {error}
            </CAlert>
          )}

          <CForm onSubmit={handleSubmit} className="row g-3">
            <CCol md={6}>
              <CFormLabel>Novo Valor do Contrato (*)</CFormLabel>
              <CFormInput
                type="number"
                name="novoValorContrato"
                value={formData.novoValorContrato}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                placeholder='Novo valor do contrato'
              />
              {contrato && (
                <small className='text-muted'>Valor original: R$ {contrato.valor ? parseFloat(contrato.valor).toFixed(2).replace('.', ',') : 'N/A'}</small>
              )}
            </CCol>

            <CCol md={6}>
              <CFormLabel>Data de Repactuação (*)</CFormLabel>
              <CFormInput
                type="date"
                name="dataRepactuacao"
                value={formData.dataRepactuacao}
                onChange={handleChange}
                required
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Nova Data Final do Contrato (*)</CFormLabel>
              <CFormInput
                type="date"
                name="novaDataFinal"
                value={formData.novaDataFinal}
                onChange={handleChange}
                required
              />
              {contrato && (
                <small className='text-muted'>Data final original: {contrato.dataFim ? new Date(contrato.dataFim).toLocaleDateString('pt-BR') : 'N/A'}</small>
              )}
            </CCol>

            <CCol md={12}>
              <CFormLabel>Descrição (*)</CFormLabel>
              <CFormTextarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                rows={3}
                required
                placeholder="Descreva os termos da repactuação."
              />
            </CCol>

            <CCol md={12}>
              <CFormLabel>Motivo da Repactuação (*)</CFormLabel>
              <CFormTextarea
                name="motivoRepactuacao"
                value={formData.motivoRepactuacao}
                onChange={handleChange}
                rows={3}
                required
                placeholder="Explique o motivo da repactuação."
              />
            </CCol>

            {/* NOVO: Campo para Anexar Documentos */}
            <CCol md={12}>
              <CFormLabel htmlFor="documentosAnexos">Anexar Documentos (PDF)</CFormLabel>
              <CFormInput
                type="file"
                id="documentosAnexos"
                name="documentosAnexos"
                onChange={handleChange}
                multiple // Permite selecionar múltiplos arquivos
                accept=".pdf" // Aceita apenas arquivos PDF
              />
              <small className="text-muted">Apenas arquivos PDF são aceitos. Você pode anexar múltiplos documentos.</small>
            </CCol>

            <CCol xs={12} className="d-flex justify-content-end gap-2 mt-4">
              <CButton color="secondary" onClick={() => navigate(`/contrato/${id}`)}>
                Cancelar
              </CButton>
              <CButton type="submit" color="success" className="text-white" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <CSpinner component="span" size="sm" aria-hidden="true" className="me-2" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Repactuação'
                )}
              </CButton>
            </CCol>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  );
}
