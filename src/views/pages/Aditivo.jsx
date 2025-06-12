import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CForm, CFormInput, CFormTextarea, CButton,
  CCol, CRow, CFormLabel, CCard, CCardBody, CCardTitle,
  CSpinner, CAlert, CListGroup, CListGroupItem
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilTrash } from '@coreui/icons';

import { AppSidebar, AppHeader, AppFooter } from '../../components';
import { aditivarContrato, buscarContratoPorId } from '../../services/contratoService';
import { adicionarEntregavelAoAditivo, uploadAnexoAditivo } from '../../services/aditivoService';

export default function Aditivo() {
  const { id } = useParams(); // ID do contrato ao qual o aditivo será adicionado
  const navigate = useNavigate();

  // --- START: VALIDAÇÃO INICIAL DO ID DA URL ---
  // Converte o ID para número para validação robusta
  const contractIdAsNumber = Number(id);

  // Se o ID não for um número, for zero ou negativo, ou não for um inteiro,
  // exibe um erro e impede o carregamento do restante do componente.
  if (!id || isNaN(contractIdAsNumber) || contractIdAsNumber <= 0 || !Number.isInteger(contractIdAsNumber)) {
    console.error(`ID do contrato inválido na URL: ${id}. Redirecionando ou exibindo erro.`);
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <CAlert color="danger" className="text-center mb-3">
          <h4 className="alert-heading">ID do Contrato Inválido!</h4>
          <p>O ID do contrato na URL não é válido. Por favor, verifique o endereço e tente novamente.</p>
          <hr />
          <p className="mb-0">Se o problema persistir, entre em contato com o suporte.</p>
        </CAlert>
        <CButton color="primary" onClick={() => navigate('/contrato')}>
          Voltar para Lista de Contratos
        </CButton>
      </div>
    );
  }
  // --- END: VALIDAÇÃO INICIAL DO ID DA URL ---

  const [contratoOriginal, setContratoOriginal] = useState(null);
  const [loadingContrato, setLoadingContrato] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    valorAditivo: '',
    novaDataFim: '',
    descricaoAditivo: '',
    entregaveisAditivo: [],
    documentosAnexos: [],
  });

  // Fetch do contrato original para exibir dados e calcular dias
  useEffect(() => {
    const fetchOriginalContrato = async () => {
      try {
        // Usa o 'id' (string) diretamente do useParams para a chamada de API
        // O Spring Boot é capaz de converter a string "123" para um Long.
        const response = await buscarContratoPorId(id); 
        const originalContractData = response.data;
        setContratoOriginal(originalContractData);

        if (originalContractData.dataFim) {
          setFormData(prev => ({
            ...prev,
            novaDataFim: originalContractData.dataFim
          }));
        }

      } catch (err) {
        console.error('Erro ao buscar contrato original:', err);
        setError('Não foi possível carregar os detalhes do contrato original. Verifique o ID e sua conexão.');
      } finally {
        setLoadingContrato(false);
      }
    };
    fetchOriginalContrato();
  }, [id]); // Dependência 'id' para refetch caso o ID do contrato mude

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'documentosAnexos') {
      setFormData(prev => ({ ...prev, [name]: Array.from(files) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError(null);
    setShowSuccessAlert(false);
  };

  // --- Funções para Entregáveis do Aditivo ---
  const handleEntregavelAditivoChange = (index, e) => {
    const { name, value } = e.target;
    const novosEntregaveis = [...formData.entregaveisAditivo];
    novosEntregaveis[index][name] = value;
    setFormData(prev => ({ ...prev, entregaveisAditivo: novosEntregaveis }));
  };

  const adicionarEntregavelAditivo = () => {
    setFormData(prev => ({
      ...prev,
      entregaveisAditivo: [...prev.entregaveisAditivo, { descricao: '', observacao: '', dataFinal: '' }],
    }));
  };

  const removerEntregavelAditivo = (index) => {
    const novosEntregaveis = formData.entregaveisAditivo.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, entregaveisAditivo: novosEntregaveis }));
  };
  // --- Fim das Funções para Entregáveis do Aditivo ---

  const calcularDiasAditivo = () => {
    if (!contratoOriginal || !formData.novaDataFim) return 0;
    const dataFimAtual = new Date(contratoOriginal.dataFim);
    const novaDataFim = new Date(formData.novaDataFim);

    dataFimAtual.setHours(0, 0, 0, 0);
    novaDataFim.setHours(0, 0, 0, 0);

    const diffMs = novaDataFim.getTime() - dataFimAtual.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setShowSuccessAlert(false);
    setError(null);

    // Validações básicas do formulário
    if (!formData.valorAditivo || !formData.novaDataFim || !formData.descricaoAditivo.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios do aditivo (indicados com *).');
      setIsSaving(false);
      return;
    }

    if (parseFloat(formData.valorAditivo) <= 0) {
      setError('O valor do aditivo deve ser maior que zero.');
      setIsSaving(false);
      return;
    }

    // Validação de nova data final
    if (contratoOriginal && new Date(formData.novaDataFim) < new Date(contratoOriginal.dataFim)) {
      setError('A nova data final não pode ser anterior à data final atual do contrato.');
      setIsSaving(false);
      return;
    }

    // Validação de entregáveis (agora só se houver entregáveis)
    if (formData.entregaveisAditivo.length > 0) {
      const entregaveisValidos = formData.entregaveisAditivo.every(ent =>
        ent.descricao.trim() !== '' && ent.dataFinal.trim() !== ''
      );
      if (!entregaveisValidos) {
        setError('Todos os entregáveis que você adicionou devem ter descrição e data final preenchidos.');
        setIsSaving(false);
        return;
      }
    }

    try {
      const diasAditivoCalculado = calcularDiasAditivo();
      
      const aditivoDTO = {
        diasAditivo: diasAditivoCalculado,
        valorAditivo: parseFloat(formData.valorAditivo),
        descricao: formData.descricaoAditivo.trim(),
      };

      // 1. Criar o Aditivo Principal
      console.log('Enviando Aditivo DTO para contrato ID:', id, 'com dados:', aditivoDTO);
      // O 'id' aqui é a string do useParams(), que o backend deve converter para Long no @PathVariable
      const responseAditivo = await aditivarContrato(id, aditivoDTO); 
      const aditivoId = responseAditivo.data.id;
      console.log('Aditivo criado com ID:', aditivoId);

      // 2. Adicionar Entregáveis ao Aditivo
      if (formData.entregaveisAditivo.length > 0) {
        for (const ent of formData.entregaveisAditivo) {
          const entregavelAditivoDTO = {
            descricao: ent.descricao.trim(),
            observacao: ent.observacao ? ent.observacao.trim() : '', // Garante string vazia se null/undefined
            dataFinal: ent.dataFinal,
          };
          console.log('Enviando entregável para aditivo ID:', aditivoId, 'com dados:', entregavelAditivoDTO);
          await adicionarEntregavelAoAditivo(aditivoId, entregavelAditivoDTO);
        }
        console.log('Todos os entregáveis do aditivo foram adicionados.');
      }

      // 3. Fazer Upload dos Anexos do Aditivo (se houver)
      if (formData.documentosAnexos.length > 0) {
        for (const file of formData.documentosAnexos) {
          console.log('Enviando anexo para aditivo ID:', aditivoId, 'arquivo:', file.name);
          await uploadAnexoAditivo(aditivoId, file);
        }
        console.log('Todos os anexos do aditivo foram enviados.');
      }

      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false);
        navigate(`/contrato/${id}`); // Volta para a página de detalhes do contrato
      }, 2000);

    } catch (err) {
      console.error('Erro ao salvar aditivo completo:', err);
      const errorMessage = err.response?.data?.message || 'Ocorreu um erro ao salvar o aditivo. Verifique os dados e tente novamente.';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Se o contrato original ainda está carregando, exibe spinner
  if (loadingContrato) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <CSpinner color="primary" />
        <span className="ms-2">Carregando detalhes do contrato...</span>
      </div>
    );
  }

  // Se houver um erro de carregamento do contrato e nenhum alerta de sucesso (para evitar sobreposição)
  if (error && !showSuccessAlert && !contratoOriginal) { 
    return (
      <div className="p-4">
        <CAlert color="danger" dismissible className="mb-3">{error}</CAlert>
        <CButton color="primary" onClick={() => navigate(`/contrato/${id}`)}>Voltar para Contrato</CButton>
      </div>
    );
  }

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <div className="p-4">
            <CCard className="mb-4">
              <CCardBody>
                <CCardTitle className="h4 mb-3">Inserir Aditivo ao Contrato {id}</CCardTitle>

                {showSuccessAlert && (
                  <CAlert color="success" dismissible className="mb-3">
                    Aditivo adicionado com sucesso! Redirecionando...
                  </CAlert>
                )}
                {error && !showSuccessAlert && (
                  <CAlert color="danger" dismissible className="mb-3">
                    {error}
                  </CAlert>
                )}

                {contratoOriginal && (
                  <CListGroup flush className="mb-4">
                    <CListGroupItem><strong>Contrato Original:</strong> {contratoOriginal.descricao}</CListGroupItem>
                    <CListGroupItem><strong>Data Final Original:</strong> {new Intl.DateTimeFormat('pt-BR').format(new Date(contratoOriginal.dataFim))}</CListGroupItem>
                    <CListGroupItem><strong>Valor Original:</strong> R$ {parseFloat(contratoOriginal.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</CListGroupItem>
                  </CListGroup>
                )}

                <CForm onSubmit={handleSubmit} className="row g-3">
                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CFormLabel htmlFor="novaDataFim">Nova Data Final do Contrato (*)</CFormLabel>
                      <CFormInput
                        type="date"
                        id="novaDataFim"
                        name="novaDataFim"
                        value={formData.novaDataFim}
                        onChange={handleChange}
                        required
                        min={contratoOriginal?.dataFim ? new Date(contratoOriginal.dataFim).toISOString().split('T')[0] : ''}
                      />
                      {contratoOriginal && formData.novaDataFim && (
                        <small className="text-muted">Dias de aditivo: {calcularDiasAditivo()}</small>
                      )}
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel htmlFor="valorAditivo">Valor do Aditivo (*)</CFormLabel>
                      <CFormInput
                        type="number"
                        id="valorAditivo"
                        name="valorAditivo"
                        value={formData.valorAditivo}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        required
                      />
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol md={12}>
                      <CFormLabel htmlFor="descricaoAditivo">Descrição do Aditivo (*)</CFormLabel>
                      <CFormTextarea
                        id="descricaoAditivo"
                        name="descricaoAditivo"
                        value={formData.descricaoAditivo}
                        onChange={handleChange}
                        rows={3}
                        required
                      />
                    </CCol>
                  </CRow>

                  {/* --- Entregáveis do Aditivo --- */}
                  <CRow className="mt-4 mb-3">
                    <CCol md={12}>
                      <h5 className="mb-3">Entregáveis do Aditivo (Opcional)</h5>
                    </CCol>
                  </CRow>
                  {formData.entregaveisAditivo.map((entregavel, index) => (
                    <div key={index} className="border rounded p-3 mb-3 w-100">
                      <CRow className="mb-2">
                        <CCol md={6}>
                          <CFormLabel>Descrição do Entregável (*)</CFormLabel>
                          <CFormInput
                            type="text"
                            name="descricao"
                            value={entregavel.descricao}
                            onChange={(e) => handleEntregavelAditivoChange(index, e)}
                            required
                          />
                        </CCol>
                        <CCol md={4}>
                          <CFormLabel>Data Final do Entregável (*)</CFormLabel>
                          <CFormInput
                            type="date"
                            name="dataFinal"
                            value={entregavel.dataFinal}
                            onChange={(e) => handleEntregavelAditivoChange(index, e)}
                            required
                          />
                        </CCol>
                        <CCol md={2} className="d-flex align-items-end justify-content-end">
                          <CButton className="text-white" color="danger" onClick={() => removerEntregavelAditivo(index)}>
                            <CIcon icon={cilTrash} className="me-1" /> Remover
                          </CButton>
                        </CCol>
                      </CRow>
                      <CRow>
                        <CCol md={12}>
                          <CFormLabel>Observações (Opcional)</CFormLabel>
                          <CFormTextarea
                            name="observacao"
                            value={entregavel.observacao}
                            onChange={(e) => handleEntregavelAditivoChange(index, e)}
                            rows={2}
                          />
                        </CCol>
                      </CRow>
                    </div>
                  ))}
                  <CRow className="mb-3">
                    <CCol md={12}>
                      <CButton color="secondary" className="mt-1 text-white" onClick={adicionarEntregavelAditivo}>
                        <CIcon icon={cilPlus} className="me-1" /> Novo Entregável
                      </CButton>
                    </CCol>
                  </CRow>
                  {/* --- Fim Entregáveis do Aditivo --- */}

                  <CRow className="mt-4 mb-3">
                    <CCol md={12}>
                      <CFormLabel htmlFor="documentosAnexos">Anexar Documentos (PDF)</CFormLabel>
                      <CFormInput
                        type="file"
                        id="documentosAnexos"
                        name="documentosAnexos"
                        onChange={handleChange}
                        multiple
                        accept=".pdf"
                      />
                      <small className="text-muted">Apenas arquivos PDF são aceitos.</small>
                    </CCol>
                  </CRow>

                  <CCol md={12} className="d-flex justify-content-end gap-2">
                    <CButton color="secondary" onClick={() => navigate(`/contrato/${id}`)}>
                      Cancelar
                    </CButton>
                    <CButton
                      className="text-white"
                      type="submit"
                      color="success"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <CSpinner component="span" size="sm" aria-hidden="true" className="me-2" />
                          Salvando...
                        </>
                      ) : (
                        "Salvar Aditivo"
                      )}
                    </CButton>
                  </CCol>
                </CForm>
              </CCardBody>
            </CCard>
          </div>
        </div>
        <AppFooter />
      </div>
    </div>
  );
}
