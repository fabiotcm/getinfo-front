import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CButton, CCard, CCardBody, CCardTitle, CCardText, CListGroup,
  CListGroupItem, CRow, CCol, CProgress, CSpinner
} from '@coreui/react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'
import { cilDataTransferDown, cilFile, cilArrowRight } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import {
  buscarContratoPorId,
  buscarAgregados,
  buscarEntregaveis,
  viewAnexo,
  downloadAnexo
} from '../../services/contratoService'

export default function ContratoDetalhes() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [contrato, setContrato] = useState(null)
  const [colaboradores, setColaboradores] = useState([])
  const [entregaveis, setEntregaveis] = useState([])
  const [anexoUrl, setAnexoUrl] = useState(null)
  const [loadingAnexo, setLoadingAnexo] = useState(true);

  useEffect(() => {
    let createdUrl = null;

    const fetchContratoData = async () => {
      setLoadingAnexo(true);
      try {
        const [contratoRes, agregadosRes, entregaveisRes] = await Promise.all([
          buscarContratoPorId(id),
          buscarAgregados(id),
          buscarEntregaveis(id)
        ])

        setContrato(contratoRes.data)
        setColaboradores(agregadosRes.data)
        setEntregaveis(entregaveisRes.data)

        try {
          const anexoRes = await viewAnexo(id)
          if (anexoRes.data && anexoRes.data.type === 'application/pdf') {
            const url = URL.createObjectURL(anexoRes.data)
            createdUrl = url;
            setAnexoUrl(url)
            console.log('Anexo PDF URL para visualização:', url)
          } else {
            console.warn('O anexo não é um PDF ou está vazio para visualização.')
            setAnexoUrl(null)
          }
        } catch (anexoError) {
          if (anexoError.response && anexoError.response.status === 404) {
             console.info('Nenhum anexo encontrado para este contrato (Status 404).');
          } else {
             console.warn('Erro ao buscar anexo para visualização:', anexoError);
          }
          setAnexoUrl(null);
        }

        console.log('Contrato:', contratoRes.data)
        console.log('Colaboradores:', agregadosRes.data)
        console.log('Entregáveis:', entregaveisRes.data)

      } catch (error) {
        console.error('Erro ao buscar dados do contrato:', error)
      } finally {
        setLoadingAnexo(false);
      }
    }

    fetchContratoData()

    return () => {
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    }
  }, [id])

  const formatarData = (data) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(data))
  }

  const calcularDiasRestantes = (dataFinal) => {
    const hoje = new Date()
    const final = new Date(dataFinal)
    const diffMs = final - hoje
    if (diffMs < 0) return 'Contrato encerrado'
    const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    if (dias === 0) return 'Último dia'
    if (dias === 1) return '1 dia'
    return `${dias} dias`
  }

  const calcularPorcentagemRestante = (inicio, fim) => {
    const dInicio = new Date(inicio)
    const dFim = new Date(fim)
    const hoje = new Date()
    const total = dFim - dInicio
    const restante = dFim - hoje
    if (restante < 0) return 0
    if (hoje < dInicio) return 100
    return Math.round((restante / total) * 100)
  }

  const getCorProgresso = (porcentagem) => {
    if (porcentagem > 60) return 'success'
    if (porcentagem > 30) return 'warning'
    return 'danger'
  }

  const handleNavigate = (path) => {
    navigate(`/contrato/${id}/${path}`)
  }

  const handleDownloadAnexo = async () => {
    try {
      const response = await downloadAnexo(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `anexo_contrato_${id}.pdf`); 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao fazer download do anexo:', error);
      alert('Não foi possível fazer o download do anexo.');
    }
  };


  if (!contrato) return <p>Carregando contrato...</p>

  const porcentagemRestante = calcularPorcentagemRestante(contrato.dataInicio, contrato.dataFim)

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
                  <strong>Valor:</strong> R$ {parseFloat(contrato.valor).toLocaleString()} <br />
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
                    </CListGroupItem>
                  ))}
                </CListGroup>
              )}
            </CCardBody>
          </CCard>

          {/* --- NOVO CARD: Anexo do Contrato (Estilo Gmail com prévia pequena e clique no texto) --- */}
          <CCard className="mb-4">
            <CCardBody>
              <CCardTitle className="h5">Anexos do Contrato</CCardTitle>
              {loadingAnexo ? (
                 <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80px' }}>
                   <CSpinner color="primary" size="sm" />
                   <span className="ms-2">Carregando anexo...</span>
                 </div>
              ) : anexoUrl ? (
                <CListGroup flush>
                  <CListGroupItem className="d-flex align-items-center justify-content-between">
                    {/* Contêiner da Prévia e Nome - AGORA CLICÁVEL */}
                    <div
                      className="d-flex align-items-center flex-grow-1" // flex-grow-1 para ocupar espaço e permitir clique
                      onClick={() => window.open(anexoUrl, '_blank')} // Abre em nova aba ao clicar
                      style={{ cursor: 'pointer' }} // Cursor de ponteiro para indicar clicável
                    >
                      {/* Mini Prévia do PDF */}
                      <div className="me-3" style={{
                          width: '80px',
                          height: '100px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          backgroundColor: '#f9f9f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                      }}>
                          <iframe
                            src={anexoUrl}
                            width="100%"
                            height="100%"
                            title="Mini Prévia do Anexo"
                            style={{ border: 'none', transform: 'scale(0.7)', transformOrigin: '0 0' }}
                            scrolling="no"
                            onError={(e) => console.error('Erro ao renderizar mini iframe:', e)}
                          >
                            PDF
                          </iframe>
                      </div>
                      
                      {/* Nome do Anexo - Com estilos de hover */}
                      <div
                        className="d-flex flex-column"
                        // Estilos para hover: texto azul e sublinhado
                        onMouseEnter={(e) => {
                          e.currentTarget.querySelector('span.anexo-nome').style.color = '#007bff'; // Bootstrap blue
                          e.currentTarget.querySelector('span.anexo-nome').style.textDecoration = 'underline';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.querySelector('span.anexo-nome').style.color = 'inherit';
                          e.currentTarget.querySelector('span.anexo-nome').style.textDecoration = 'none';
                        }}
                      >
                          <span className="fw-bold anexo-nome">Contrato Anexo (PDF)</span> {/* Adicionado classe 'anexo-nome' */}
                          <small className="text-muted">Clique para visualizar o arquivo completo.</small>
                      </div>
                    </div>

                    {/* Botões de Ação - Mantidos separados para Download */}
                    <div>
                      {/* Removido o botão "Visualizar em Nova Aba" daqui */}
                      <CButton
                        color="success"
                        variant="ghost"
                        size="sm"
                        onClick={handleDownloadAnexo}
                        title="Fazer Download"
                      >
                         <CIcon icon={cilDataTransferDown} />
                      </CButton>
                    </div>
                  </CListGroupItem>
                </CListGroup>
              ) : (
                <p>Nenhum anexo disponível.</p>
              )}
            </CCardBody>
          </CCard>
          {/* --- FIM DO NOVO CARD --- */}

          <div className="d-flex gap-2 mt-3">
            <CButton color="primary" onClick={() => handleNavigate('editar')}>Editar</CButton>
            <CButton className="text-white" color="danger" onClick={() => handleNavigate('aditivo')}>Aditivo</CButton>
            <CButton className="text-white" color="warning" onClick={() => handleNavigate('repactuacao')}>Repactuação</CButton>
          </div>
        </div>
        <AppFooter />
      </div>
    </div>
  )
}