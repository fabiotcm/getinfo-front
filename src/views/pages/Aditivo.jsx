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

  const [contratoOriginal, setContratoOriginal] = useState(null);
  const [loadingContrato, setLoadingContrato] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    valorAditivo: '', // Novo campo para o valor do aditivo
    novaDataFim: '', // Nova data de fim do contrato
    descricaoAditivo: '', // Descrição do aditivo
    entregaveisAditivo: [], // Modificado: Começa como um array vazio, não é mais obrigatório ter um
    documentosAnexos: [], // Múltiplos arquivos para upload
  });

  // Fetch do contrato original para exibir dados e calcular dias
  useEffect(() => {
    const fetchOriginalContrato = async () => {
      try {
        const response = await buscarContratoPorId(id);
        const originalContractData = response.data;
        setContratoOriginal(originalContractData);

        // Preenche a novaDataFim com a data final do contrato original
        if (originalContractData.dataFim) {
          setFormData(prev => ({
            ...prev,
            novaDataFim: originalContractData.dataFim // dataFim já deve estar no formato YYYY-MM-DD
          }));
        }

      } catch (err) {
        console.error('Erro ao buscar contrato original:', err);
        setError('Não foi possível carregar os detalhes do contrato original.');
      } finally {
        setLoadingContrato(false);
      }
    };
    fetchOriginalContrato();
  }, [id]); // Dependência 'id' para refetch caso o ID do contrato mude

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'documentosAnexos') {
      // Converte FileList para Array
      setFormData(prev => ({ ...prev, [name]: Array.from(files) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError(null); // Limpa erros ao digitar
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
    // Modificado: Agora permite remover todos os entregáveis, tornando a lista vazia
    const novosEntregaveis = formData.entregaveisAditivo.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, entregaveisAditivo: novosEntregaveis }));
  };
  // --- Fim das Funções para Entregáveis do Aditivo ---

  const calcularDiasAditivo = () => {
    if (!contratoOriginal || !formData.novaDataFim) return 0;
    const dataFimAtual = new Date(contratoOriginal.dataFim);
    const novaDataFim = new Date(formData.novaDataFim);

    // Garante que as datas sejam tratadas como início do dia para cálculo preciso
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

    // Validações básicas
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
      // Dias de aditivo negativos já são tratados pela validação da data final
      // if (diasAditivoCalculado < 0) {
      //   setError('A nova data final não pode ser anterior à data final atual do contrato.');
      //   setIsSaving(false);
      //   return;
      // }

      const aditivoDTO = {
        diasAditivo: diasAditivoCalculado,
        valorAditivo: parseFloat(formData.valorAditivo),
        descricao: formData.descricaoAditivo.trim(),
      };

      // 1. Criar o Aditivo Principal
      console.log('Enviando Aditivo DTO:', aditivoDTO);
      const responseAditivo = await aditivarContrato(id, aditivoDTO);
      const aditivoId = responseAditivo.data.id;
      console.log('Aditivo criado com ID:', aditivoId);

      // 2. Adicionar Entregáveis ao Aditivo
      if (formData.entregaveisAditivo.length > 0) {
        for (const ent of formData.entregaveisAditivo) {
          const entregavelAditivoDTO = {
            descricao: ent.descricao.trim(),
            observacao: ent.observacao.trim(),
            dataFinal: ent.dataFinal, // dataFinal já deve estar no formato YYYY-MM-DD
          };
          console.log('Enviando entregável para aditivo:', entregavelAditivoDTO);
          await adicionarEntregavelAoAditivo(aditivoId, entregavelAditivoDTO);
        }
        console.log('Todos os entregáveis do aditivo foram adicionados.');
      }

      // 3. Fazer Upload dos Anexos do Aditivo (se houver)
      if (formData.documentosAnexos.length > 0) {
        for (const file of formData.documentosAnexos) {
          console.log('Enviando anexo:', file.name);
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
      // Tentar pegar uma mensagem de erro mais específica do backend
      const errorMessage = err.response?.data?.message || 'Ocorreu um erro ao salvar o aditivo. Verifique os dados e tente novamente.';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingContrato) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <CSpinner color="primary" />
        <span className="ms-2">Carregando detalhes do contrato...</span>
      </div>
    );
  }

  if (error && !showSuccessAlert) { // Exibe erro apenas se não houver sucesso
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
                {error && !showSuccessAlert && ( // Exibe erro apenas se não houver sucesso
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

                <CForm onSubmit={handleSubmit} className="row g-3"> {/* Alterado de space-y-3 para row g-3 para melhor layout CoreUI */}
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
                        min={contratoOriginal?.dataFim ? new Date(contratoOriginal.dataFim).toISOString().split('T')[0] : ''} // Impede data anterior
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
                    <div key={index} className="border rounded p-3 mb-3 w-100"> {/* w-100 para ocupar a largura total */}
                      <CRow className="mb-2">
                        <CCol md={6}>
                          <CFormLabel>Descrição do Entregável (*)</CFormLabel>
                          <CFormInput
                            type="text"
                            name="descricao"
                            value={entregavel.descricao}
                            onChange={(e) => handleEntregavelAditivoChange(index, e)}
                            required // Mantém o required para entregáveis adicionados
                          />
                        </CCol>
                        <CCol md={4}>
                          <CFormLabel>Data Final do Entregável (*)</CFormLabel>
                          <CFormInput
                            type="date"
                            name="dataFinal"
                            value={entregavel.dataFinal}
                            onChange={(e) => handleEntregavelAditivoChange(index, e)}
                            required // Mantém o required para entregáveis adicionados
                          />
                        </CCol>
                        <CCol md={2} className="d-flex align-items-end justify-content-end"> {/* Ajustado para alinhar à direita */}
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
                        multiple // Permite selecionar múltiplos arquivos, mas o upload será individual
                        accept=".pdf"
                      />
                      <small className="text-muted">Apenas arquivos PDF são aceitos.</small>
                    </CCol>
                  </CRow>

                  <CCol md={12} className="d-flex justify-content-end gap-2"> {/* Ajustado para alinhar botões à direita */}
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
