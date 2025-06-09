import React, { useEffect, useState } from 'react'
import { Document, Page } from 'react-pdf'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CButton, CCard, CCardBody, CCardTitle, CCardText, CListGroup,
  CListGroupItem, CRow, CCol, CProgress
} from '@coreui/react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'
import { cilDataTransferDown } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import 'react-pdf/dist/Page/TextLayer.css'

import {
  buscarContratoPorId,
  buscarAgregados,
  buscarEntregaveis
} from '../../services/contratoService'

export default function ContratoDetalhes() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [contrato, setContrato] = useState(null)
  const [colaboradores, setColaboradores] = useState([])
  const [entregaveis, setEntregaveis] = useState([])


  useEffect(() => {
  const fetchContrato = async () => {
    try {
      const [contratoRes, agregadosRes, entregaveisRes] = await Promise.all([
        buscarContratoPorId(id),
        buscarAgregados(id),
        buscarEntregaveis(id)
      ])

      setContrato(contratoRes.data)
      setColaboradores(agregadosRes.data)
      setEntregaveis(entregaveisRes.data)

      console.log('Contrato:', contratoRes.data)
      console.log('Colaboradores:', agregadosRes.data)
      console.log('Entregáveis:', entregaveisRes.data)

    } catch (error) {
      console.error('Erro ao buscar dados do contrato:', error)
    }
  }

  fetchContrato()
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

  if (!contrato) return <p>Carregando contrato...</p>

  const porcentagemRestante = calcularPorcentagemRestante(contrato.dataInicio, contrato.dataFim)

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1 p-4">
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

          <CCard className="mb-4">
            <CCardBody>
              <CCardTitle className="h5">Responsável pelo Contrato</CCardTitle>
              <CListGroup flush>
                <CListGroupItem><strong>Nome:</strong> {contrato.nomeResponsavel}</CListGroupItem>
              </CListGroup>
            </CCardBody>
          </CCard>

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
