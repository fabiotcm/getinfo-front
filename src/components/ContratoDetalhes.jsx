import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardTitle,
  CListGroup,
  CListGroupItem,
  CRow,
  CCol,
  CProgress,
  CSpinner
} from '@coreui/react'
import { cilDataTransferDown } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import {
  buscarContratoPorId,
  buscarAgregados,
  buscarEntregaveis,
  viewAnexo,
  downloadAnexo,
  exibirAditivosDoContrato
} from '../services/contratoService'
import {
  viewAnexoAditivo,
  downloadAnexoAditivo
} from '../services/aditivoService'
import {
  listarTodasRepactuacoes,
  viewAnexoRepactuacao,
  downloadAnexoRepactuacao
} from '../services/repactuacaoService'

export default function ContratoDetalhes() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [contrato, setContrato] = useState(null)
  const [colaboradores, setColaboradores] = useState([])
  const [entregaveis, setEntregaveis] = useState([])
  const [aditivos, setAditivos] = useState([])
  const [repactuacoes, setRepactuacoes] = useState([])
  const [allAttachments, setAllAttachments] = useState([])
  const [loadingAttachments, setLoadingAttachments] = useState(true)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    const fetchContratoData = async () => {
      setLoading(true)
      setLoadingAttachments(true)
      try {
        const [contratoRes, agregadosRes, entregaveisRes, aditivosRes, repactuacoesRes] =
          await Promise.all([
            buscarContratoPorId(id),
            buscarAgregados(id),
            buscarEntregaveis(id),
            exibirAditivosDoContrato(id),
            listarTodasRepactuacoes()
          ])

        setContrato(contratoRes.data)
        setColaboradores(agregadosRes.data)
        setEntregaveis(entregaveisRes.data)
        setAditivos(aditivosRes.data)

        const filteredRepactuacoes = repactuacoesRes.data.filter(rep => String(rep.idContrato) === id)
        setRepactuacoes(filteredRepactuacoes)

        const fetchedAttachments = []
        const createdObjectUrls = []

        // Anexo Principal
        try {
          const mainAnexoRes = await viewAnexo(id)
          if (mainAnexoRes.data.type === 'application/pdf') {
            const url = URL.createObjectURL(mainAnexoRes.data)
            createdObjectUrls.push(url)
            fetchedAttachments.push({ id, type: 'main', name: 'Anexo Principal do Contrato', url })
          }
        } catch (error) {
          console.info('Nenhum anexo principal encontrado.')
        }

        // Anexos de Aditivos
        for (const aditivo of aditivosRes.data) {
          try {
            const aditivoAnexoRes = await viewAnexoAditivo(aditivo.id)
            if (aditivoAnexoRes.data.type === 'application/pdf') {
              const url = URL.createObjectURL(aditivoAnexoRes.data)
              createdObjectUrls.push(url)
              fetchedAttachments.push({ id: aditivo.id, type: 'aditivo', name: `Anexo do Aditivo #${aditivo.id}`, url })
            }
          } catch {}
        }

        // Anexos de Repactuações
        for (const repactuacao of filteredRepactuacoes) {
          try {
            const repactuacaoAnexoRes = await viewAnexoRepactuacao(repactuacao.id)
            if (repactuacaoAnexoRes.data.type === 'application/pdf') {
              const url = URL.createObjectURL(repactuacaoAnexoRes.data)
              createdObjectUrls.push(url)
              fetchedAttachments.push({ id: repactuacao.id, type: 'repactuacao', name: `Anexo da Repactuação #${repactuacao.id}`, url })
            }
          } catch {}
        }

        setAllAttachments(fetchedAttachments)
        // Cleanup URLs
        return () => createdObjectUrls.forEach(URL.revokeObjectURL)
      } catch (error) {
        console.error('Erro ao buscar dados do contrato:', error)
        setErro('Erro ao carregar detalhes do contrato.')
      } finally {
        setLoading(false)
        setLoadingAttachments(false)
      }
    }
    fetchContratoData()
  }, [id])

  const formatarData = data => data ? new Intl.DateTimeFormat('pt-BR').format(new Date(data)) : 'N/A'

  const calcularDiasRestantes = dataFinal => {
    const hoje = new Date(); hoje.setHours(0,0,0,0)
    const final = new Date(dataFinal); final.setHours(0,0,0,0)
    const diff = final - hoje
    if (diff < 0) return 'Contrato encerrado'
    const dias = Math.ceil(diff / (1000*60*60*24))
    return dias === 0 ? 'Último dia' : `${dias} dia${dias>1?'s':''}`
  }

  const calcularPorcentagemRestante = (inicio, fim) => {
    const dInicio = new Date(inicio), dFim = new Date(fim), hoje = new Date()
    hoje.setHours(0,0,0,0)
    const total = dFim - dInicio
    const restante = dFim - hoje
    if (total <= 0) return 0
    if (restante < 0) return 0
    if (hoje < dInicio) return 100
    return Math.round((restante/total)*100)
  }

  const getCorProgresso = pct => pct>60 ? 'success' : pct>30 ? 'warning' : 'danger'

  const handleNavigate = path => navigate(`/contrato/${id}/${path}`)

  const handleDownloadAttachment = async (attachmentId, type) => {
    try {
      let response, filename
      if (type === 'main') {
        response = await downloadAnexo(attachmentId)
        filename = `anexo_contrato_${attachmentId}.pdf`
      } else if (type === 'aditivo') {
        response = await downloadAnexoAditivo(attachmentId)
        filename = `anexo_aditivo_${attachmentId}.pdf`
      } else {
        response = await downloadAnexoRepactuacao(attachmentId)
        filename = `anexo_repactuacao_${attachmentId}.pdf`
      }
      const url = URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url; link.setAttribute('download', filename)
      document.body.appendChild(link); link.click()
      document.body.removeChild(link); URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro no download do anexo:', error)
    }
  }

  // Loading Spinner
  if (loading) {
    return (
      <div className="p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <CSpinner color="primary" />
        <span className="ms-2">Carregando detalhes do contrato...</span>
      </div>
    )
  }

  // Error state
  if (erro || !contrato) {
    return (
      <div className="p-4">
        <CCard className="mb-4">
          <CCardBody>
            <CCardTitle className="h4">Erro</CCardTitle>
            <p>{erro || 'Contrato não encontrado.'}</p>
            <CButton color="secondary" onClick={() => navigate('/contratos')}>
              Voltar para a lista de Contratos
            </CButton>
          </CCardBody>
        </CCard>
      </div>
    )
  }

  const porcentagemRestante = calcularPorcentagemRestante(contrato.dataInicio, contrato.dataFim)

  return (
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

      {/* NOVO Card: Repactuações */}
      <CCard className="mb-4">
        <CCardBody>
          <CCardTitle className="h5">Repactuações</CCardTitle>
          {repactuacoes.length === 0 ? (
            <p>Nenhuma repactuação registrada para este contrato.</p>
          ) : (
            <CListGroup flush>
              {repactuacoes.map(repactuacao => (
                <CListGroupItem key={repactuacao.id}>
                  <strong>Repactuação #{repactuacao.id}</strong><br />
                  Motivo: {repactuacao.motivoRepactuacao}<br />
                  Descrição: {repactuacao.descricao}<br />
                  Novo Valor: R$ {parseFloat(repactuacao.novoValorContrato).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br />
                  Data da Repactuação: {formatarData(repactuacao.dataRepactuacao)}<br />
                  Nova Data Final: {formatarData(repactuacao.novaDataFinal)}
                </CListGroupItem>
              ))}
            </CListGroup>
          )}
        </CCardBody>
      </CCard>

      {/* Card de Anexos do Contrato (Principal + Aditivos + Repactuações) */}
      <CCard className="mb-4">
        <CCardBody>
          <CCardTitle className="h5">Anexos do Contrato</CCardTitle>
          {loadingAttachments ? (
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80px' }}>
                <CSpinner color="primary" size="sm" />
                <span className="ms-2">Carregando anexos...</span>
              </div>
            ) : allAttachments.length === 0 ? (
            <p>Nenhum anexo disponível para este contrato, seus aditivos ou repactuações.</p>
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
  )
}
