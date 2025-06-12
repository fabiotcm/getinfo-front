import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CButton, CCard, CCardBody, CCardTitle, CCardText, CListGroup,
  CListGroupItem, CRow, CCol, CProgress, CSpinner
} from '@coreui/react';
import { AppSidebar, AppHeader, AppFooter } from '../components';
import { cilDataTransferDown, cilFile } from '@coreui/icons'; // Removido cilArrowRight, não utilizado
import CIcon from '@coreui/icons-react';

import {
  buscarContratoPorId,
  buscarAgregados,
  buscarEntregaveis,
  viewAnexo, // Para anexo principal do contrato
  downloadAnexo, // Para anexo principal do contrato
  exibirAditivosDoContrato // Para buscar os aditivos
} from '../services/contratoService';

import {
  viewAnexoAditivo, // Para anexo de aditivo
  downloadAnexoAditivo // Para anexo de aditivo
} from '../services/aditivoService'; // Importa o serviço de aditivo

export default function ContratoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contrato, setContrato] = useState(null);
  const [colaboradores, setColaboradores] = useState([]);
  const [entregaveis, setEntregaveis] = useState([]);
  const [aditivos, setAditivos] = useState([]);
  const [allAttachments, setAllAttachments] = useState([]); // Novo estado para todos os anexos (principal + aditivos)
  const [loadingAttachments, setLoadingAttachments] = useState(true);

  // Variável para armazenar URLs criadas para revogação no cleanup
  const createdObjectUrls = [];

  useEffect(() => {
    const fetchContratoData = async () => {
      setLoadingAttachments(true);
      try {
        const [contratoRes, agregadosRes, entregaveisRes, aditivosRes] = await Promise.all([
          buscarContratoPorId(id),
          buscarAgregados(id),
          buscarEntregaveis(id),
          exibirAditivosDoContrato(id)
        ]);

        setContrato(contratoRes.data);
        setColaboradores(agregadosRes.data);
        setEntregaveis(entregaveisRes.data);
        setAditivos(aditivosRes.data);

        const fetchedAttachments = [];

        // 1. Tenta buscar o anexo principal do contrato
        try {
          const mainAnexoRes = await viewAnexo(id);
          if (mainAnexoRes.data && mainAnexoRes.data.type === 'application/pdf') {
            const url = URL.createObjectURL(mainAnexoRes.data);
            createdObjectUrls.push(url); // Adiciona para revogação
            fetchedAttachments.push({
              id: id,
              type: 'main',
              name: 'Anexo Principal do Contrato',
              url: url
            });
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.info('Nenhum anexo principal encontrado para este contrato (Status 404).');
          } else {
            console.warn('Erro ao buscar anexo principal para visualização:', error);
          }
        }

        // 2. Tenta buscar anexos para cada aditivo
        for (const aditivo of aditivosRes.data) {
          try {
            const aditivoAnexoRes = await viewAnexoAditivo(aditivo.id);
            if (aditivoAnexoRes.data && aditivoAnexoRes.data.type === 'application/pdf') {
              const url = URL.createObjectURL(aditivoAnexoRes.data);
              createdObjectUrls.push(url); // Adiciona para revogação
              fetchedAttachments.push({
                id: aditivo.id,
                type: 'aditivo',
                name: `Anexo do Aditivo #${aditivo.id}`,
                url: url
              });
            }
          } catch (error) {
            if (error.response && error.response.status === 404) {
              console.info(`Nenhum anexo encontrado para o Aditivo #${aditivo.id} (Status 404).`);
            } else {
              console.warn(`Erro ao buscar anexo para o Aditivo #${aditivo.id}:`, error);
            }
          }
        }
        
        setAllAttachments(fetchedAttachments);

      } catch (error) {
        console.error('Erro ao buscar dados do contrato:', error);
      } finally {
        setLoadingAttachments(false);
      }
    };

    fetchContratoData();

    // Cleanup: revoga todas as URLs criadas para liberar memória
    return () => {
      createdObjectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [id]); // Re-executa o efeito quando o ID do contrato muda

  const formatarData = (data) => {
    if (!data) return 'N/A';
    return new Intl.DateTimeFormat('pt-BR').format(new Date(data));
  };

  const calcularDiasRestantes = (dataFinal) => {
    const hoje = new Date();
    const final = new Date(dataFinal);
    hoje.setHours(0, 0, 0, 0);
    final.setHours(0, 0, 0, 0);

    const diffMs = final - hoje;
    if (diffMs < 0) return 'Contrato encerrado';
    const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (dias === 0) return 'Último dia';
    if (dias === 1) return '1 dia';
    return `${dias} dias`;
  };

  const calcularPorcentagemRestante = (inicio, fim) => {
    const dInicio = new Date(inicio);
    const dFim = new Date(fim);
    const hoje = new Date();
    
    dInicio.setHours(0, 0, 0, 0);
    dFim.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);

    const total = dFim.getTime() - dInicio.getTime();
    const restante = dFim.getTime() - hoje.getTime();

    if (total <= 0) return 0;
    if (restante < 0) return 0;
    if (hoje.getTime() < dInicio.getTime()) return 100;

    return Math.round((restante / total) * 100);
  };

  const getCorProgresso = (porcentagem) => {
    if (porcentagem > 60) return 'success';
    if (porcentagem > 30) return 'warning';
    return 'danger';
  };

  const handleNavigate = (path) => {
    navigate(`/contrato/${id}/${path}`);
  };

  // Nova função genérica para download de anexos (principal ou de aditivo)
  const handleDownloadAttachment = async (attachmentId, type) => {
    try {
      let response;
      let filename;
      if (type === 'main') {
        response = await downloadAnexo(attachmentId);
        filename = `anexo_contrato_${attachmentId}.pdf`;
      } else if (type === 'aditivo') {
        response = await downloadAnexoAditivo(attachmentId);
        filename = `anexo_aditivo_${attachmentId}.pdf`;
      } else {
        console.error('Tipo de anexo desconhecido para download.');
        return;
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Revoga a URL após o download
    } catch (error) {
      console.error(`Erro ao fazer download do anexo (${type}, ID: ${attachmentId}):`, error);
      console.error('Não foi possível fazer o download do anexo.');
    }
  };

  if (!contrato) return <p>Carregando contrato...</p>;

  const porcentagemRestante = calcularPorcentagemRestante(contrato.dataInicio, contrato.dataFim);

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1 p-4">
          {/* Card de Informações Gerais do Contrato */}
          <CCard className="mb-4">
            <CCardBody>
              <CCardTitle className="h4">{contrato.tipo}</CCardTitle>
              <CRow>
                <CCol>
                  <strong>Empresa:</strong> {contrato.nomeFantasia} <br />
                  <strong>Descrição:</strong> {contrato.descricao}
                </CCol>
                <CCol>
                  <strong>Valor:</strong> R$ {parseFloat(contrato.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <br />
                  <strong>Status:</strong> {contrato.statusContrato}
                </CCol>
              </CRow>
              <CRow className='mt-3'>
                <CCol>
                  <CProgress
                    thin
                    color={getCorProgresso(porcentagemRestante)}
                    value={porcentagemRestante}
                  />
                </CCol>
              </CRow>
              <CRow className='mt-1'>
                <CCol><strong>Data Início:</strong> {formatarData(contrato.dataInicio)}</CCol>
                <CCol><strong>Tempo Restante:</strong> {calcularDiasRestantes(contrato.dataFim)}</CCol>
                <CCol><strong>Data Fim:</strong> {formatarData(contrato.dataFim)}</CCol>
              </CRow>
            </CCardBody>
          </CCard>

          {/* Card de Responsável pelo Contrato */}
          <CCard className="mb-4">
            <CCardBody>
              <CCardTitle className="h5">Responsável pelo Contrato</CCardTitle>
              <CListGroup flush>
                <CListGroupItem><strong>Nome:</strong> {contrato.nomeResponsavel}</CListGroupItem>
              </CListGroup>
            </CCardBody>
          </CCard>

          {/* Card de Agregados */}
          <CCard className="mb-4">
            <CCardBody>
              <CCardTitle className="h5">Agregados</CCardTitle>
              {colaboradores.length === 0 ? (
                <p>Nenhum colaborador registrado.</p>
              ) : (
                <CListGroup flush>
                  {colaboradores.map(colab => (
                    <CListGroupItem key={colab.id}>
                      <strong>{colab.nome} {colab.sobrenome}</strong> - {colab.cargo} <br />
                      Contato: {colab.telefone}
                    </CListGroupItem>
                  ))}
                </CListGroup>
              )}
            </CCardBody>
          </CCard>

          {/* Card de Entregáveis */}
          <CCard className="mb-4">
            <CCardBody>
              <CCardTitle className="h5">Entregáveis</CCardTitle>
              {entregaveis.length === 0 ? (
                <p>Nenhum entregável registrado.</p>
              ) : (
                <CListGroup flush>
                  {entregaveis.map((e, idx) => (
                    <CListGroupItem key={idx}>
                      <strong>{e.descricao}</strong><br />
                      Status: {e.status} <br />
                      {e.dataEntrega && <>Data Entrega: {formatarData(e.dataEntrega)}<br /></>}
                      {e.dataCancelamento && <>Data Cancelamento: {formatarData(e.dataCancelamento)}<br /></>}
                      {e.observacao && <>Observação: {e.observacao}<br /></>}
                    </CListGroupItem>
                  ))}
                </CListGroup>
              )}
            </CCardBody>
          </CCard>

          {/* Card: Aditivos */}
          <CCard className="mb-4">
            <CCardBody>
              <CCardTitle className="h5">Aditivos</CCardTitle>
              {aditivos.length === 0 ? (
                <p>Nenhum aditivo registrado para este contrato.</p>
              ) : (
                <CListGroup flush>
                  {aditivos.map(aditivo => (
                    <CListGroupItem key={aditivo.id}>
                      <strong>Aditivo #{aditivo.id}</strong><br />
                      Descrição: {aditivo.descricao}<br />
                      Dias Aditivados: {aditivo.diasAditivo} dias<br />
                      Valor Aditivado: R$ {parseFloat(aditivo.valorAditivo).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </CListGroupItem>
                  ))}
                </CListGroup>
              )}
            </CCardBody>
          </CCard>

          {/* Card de Anexos do Contrato (Principal + Aditivos) */}
          <CCard className="mb-4">
            <CCardBody>
              <CCardTitle className="h5">Anexos do Contrato</CCardTitle>
              {loadingAttachments ? (
                 <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80px' }}>
                   <CSpinner color="primary" size="sm" />
                   <span className="ms-2">Carregando anexos...</span>
                 </div>
               ) : allAttachments.length === 0 ? (
                <p>Nenhum anexo disponível para este contrato ou seus aditivos.</p>
              ) : (
                <CListGroup flush>
                  {allAttachments.map((attachment, index) => (
                    <CListGroupItem key={`${attachment.type}-${attachment.id}-${index}`} className="d-flex align-items-center justify-content-between">
                      <div
                        className="d-flex align-items-center flex-grow-1"
                        onClick={() => window.open(attachment.url, '_blank')}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="me-3" style={{
                            width: '80px',
                            height: '100px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            backgroundColor: '#f9f9f9',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {/* Ajuste o src para lidar com possíveis erros ou URLs temporárias */}
                            <iframe
                              src={attachment.url}
                              title={`Prévia do Anexo ${attachment.name}`}
                              width="150%"
                              height="140%"
                              style={{ border: 'none', position: 'absolute', top: '-10%', left: '-20%' }}
                              onError={(e) => console.error(`Erro ao renderizar mini iframe para ${attachment.name}:`, e)}
                            >
                              Seu navegador não suporta a prévia.
                            </iframe>
                        </div>
                        
                        <div
                          className="d-flex flex-column"
                          onMouseEnter={(e) => {
                            e.currentTarget.querySelector('span.anexo-nome').style.color = '#007bff';
                            e.currentTarget.querySelector('span.anexo-nome').style.textDecoration = 'underline';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.querySelector('span.anexo-nome').style.color = 'inherit';
                            e.currentTarget.querySelector('span.anexo-nome').style.textDecoration = 'none';
                          }}
                        >
                              <span className="fw-bold anexo-nome">{attachment.name} (PDF)</span>
                              <small className="text-muted">Clique para visualizar o arquivo completo.</small>
                        </div>
                      </div>

                      <div>
                        <CButton
                          color="success"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadAttachment(attachment.id, attachment.type)}
                          title="Fazer Download"
                        >
                             <CIcon icon={cilDataTransferDown} />
                         </CButton>
                      </div>
                    </CListGroupItem>
                  ))}
                </CListGroup>
              )}
            </CCardBody>
          </CCard>

          <div className="d-flex gap-2 mt-3">
            <CButton color="primary" onClick={() => handleNavigate('editar')}>Editar</CButton>
            <CButton className="text-white" color="danger" onClick={() => handleNavigate('aditivo')}>Aditivo</CButton>
            <CButton className="text-white" color="warning" onClick={() => handleNavigate('repactuacao')}>Repactuação</CButton>
          </div>
        </div>
        <AppFooter />
      </div>
    </div>
  );
}
