import React, { useState } from 'react'
import { Document, Page } from 'react-pdf';
import { useParams, useNavigate } from 'react-router-dom'
import contratos from '../../data/contratos_detalhados.json'
import { CButton, CCard, CCardBody, CCardTitle, CCardText, CListGroup, CListGroupItem, CRow, CContainer, CProgress, CCol } from '@coreui/react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'
import 'react-pdf/dist/Page/TextLayer.css';
import { CIcon } from '@coreui/icons-react'
import { cilDataTransferDown } from '@coreui/icons';

export default function ContratoDetalhes() {
  const { id } = useParams()
  const navigate = useNavigate()

  const contrato = contratos.find(c => c.id_contrato === parseInt(id))

  if (!contrato) {
    return <p>Contrato não encontrado.</p>
  }

  const handleNavigate = (path) => {
    navigate(`/contrato/${id}/${path}`)
  }

  const calcularDiasRestantes = (dataFinal) => {
    const hoje = new Date()
    const final = new Date(dataFinal)

    hoje.setHours(0, 0, 0, 0)
    final.setHours(0, 0, 0, 0)

    const diffMs = final - hoje

    if (diffMs < 0) return 'Contrato encerrado'
    const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    if (dias === 0) return 'Último dia'
    if (dias === 1) return '1 dia'
    return `${dias} dias`
  }

  const calcularPorcentagemRestante = (dataInicio, dataFinal) => {
    const inicio = new Date(dataInicio)
    const final = new Date(dataFinal)
    const hoje = new Date()

    inicio.setHours(0, 0, 0, 0)
    final.setHours(0, 0, 0, 0)
    hoje.setHours(0, 0, 0, 0)

    const totalDuracao = final - inicio
    const restante = final - hoje

    if (restante < 0) return 0
    if (hoje < inicio) return 100

    const porcentagem = (restante / totalDuracao) * 100
    return Math.round(porcentagem)
  }

  const formatarData = (dataISO) => {
    const data = new Date(dataISO)
    return new Intl.DateTimeFormat('pt-BR').format(data)
  }

  const getCorProgresso = (porcentagem) => {
    if (porcentagem > 60) return 'success'
    if (porcentagem > 30) return 'warning'
    return 'danger'
  }

  const porcentagemRestante = calcularPorcentagemRestante(contrato.data_inicio, contrato.data_final)

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <div className="p-4">
            <CCard className="mb-4">
              <CCardBody>
                <CCardTitle className="h4">{contrato.tipo_contrato}</CCardTitle>
                <CRow>
                  <CCol>
                    <strong>Empresa:</strong> {contrato.empresa.nome_fantasia} <br />
                    <strong>Descrição:</strong> {contrato.descricao}
                  </CCol>
                  <CCol>
                    <strong>Valor:</strong> R$ {contrato.valor.toLocaleString()} <br />
                    <strong>Status:</strong> {contrato.status.descricao}
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
                  <CCol>
                    <strong>Data Início:</strong> {formatarData(contrato.data_inicio)}
                  </CCol>
                  <CCol className='flex-center'>
                    <strong>Tempo Restante:</strong> {calcularDiasRestantes(contrato.data_final)}
                  </CCol>
                  <CCol className='flex-end'>
                    <strong>Data Fim:</strong> {formatarData(contrato.data_final)}
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
            <CRow>
              <CCol>
                <CCard className="mb-4">
                  <CCardBody>
                    <CCardTitle className="h5">Responsável pelo Contrato</CCardTitle>
                      <CListGroup flush>
                        <CListGroupItem><strong>Nome:</strong> {contrato.funcionarioResponsavel?.nome}</CListGroupItem>
                        <CListGroupItem><strong>Contato:</strong> {contrato.funcionarioResponsavel?.contato}</CListGroupItem>
                        <CListGroupItem><strong>Cargo:</strong> {contrato.funcionarioResponsavel?.cargo?.descricao}</CListGroupItem>
                      </CListGroup>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
            <CCard className="mb-4">
              <CCardBody>
                <CCardTitle className="h5">Agregados</CCardTitle>
                {contrato.colaboradores.length === 0 ? (
                  <p>Nenhum colaborador registrado.</p>
                ) : (
                  <CListGroup flush>
                    {contrato.colaboradores.map(colab => (
                      <CListGroupItem key={colab.id_funcionario}>
                        <strong>{colab.nome}</strong> - {colab.cargo.descricao} <br />
                        Contato: {colab.contato}
                      </CListGroupItem>
                    ))}
                  </CListGroup>
                )}
              </CCardBody>
            </CCard>

            <CCard className="mb-4">
              <CCardBody>
                <CCardTitle className="h5">Entregáveis</CCardTitle>
                {contrato.entregaveis.length === 0 ? (
                  <p>Nenhum entregável registrado.</p>
                ) : (
                  <CListGroup flush>
                    {contrato.entregaveis.map(e => (
                      <CListGroupItem key={e.id_entregavel}>
                        <strong>{e.descricao}</strong> <br />
                        Status: {e.status.descricao} <br />
                        {e.data_entrega && <>Data Entrega: {formatarData(e.data_entrega)} <br /></>}
                        {e.data_canc && <>Data Cancelamento: {formatarData(e.data_canc)} <br /></>}
                      </CListGroupItem>
                    ))}
                  </CListGroup>
                )}
              </CCardBody>
            </CCard>

            <CCard className="mb-4">
              <CCardBody>
                <CCardTitle className="h5">Aditivos</CCardTitle>
                {contrato.anexos.length === 0 ? (
                  <p>Nenhum anexo disponível.</p>
                ) : (
                  <CListGroup flush className='flex-row'>
                    {contrato.anexos.map(a => {
                      const url = `/pdfs/${a.nome_arquivo}`
                      return (
                        <CListGroupItem key={a.id_anexo} className="d-flex align-items-center justify-content-between">
                          <div className="d-flex relative">
                            <div className="download-button">
                              <a href={url} download>
                                <CIcon icon={cilDataTransferDown} title='download' fontSize={'1.3rem'} color='white' className='text-white' />
                              </a>
                            </div>
                            <a href={url} target="_blank" rel="noopener noreferrer">
                              <Document file={url}>
                                <Page pageNumber={1} width={200} height={100} />
                              </Document>
                              <div className='documento-titulo'>
                                <div>
                                  <img src="/icons/pdf_icon.png" alt="PDF icon"/>
                                </div>
                                <CCardText>
                                  {a.nome_arquivo}
                                </CCardText>
                              </div>
                            </a>
                          </div>
                        </CListGroupItem>
                      )
                    })}
                  </CListGroup>
                )}
              </CCardBody>
            </CCard>

            <div className="d-flex gap-2 mt-3">
              <CButton color="primary" onClick={() => handleNavigate('editar')}>
                Editar
              </CButton>
              <CButton className='text-white' color="danger" onClick={() => handleNavigate('aditivo')}>
                Inserir Aditivo
              </CButton>
              <CButton className='text-white' color="warning" onClick={() => handleNavigate('repactuacao')}>
                Inserir Repactuação
              </CButton>
            </div>
          </div>
        </div>
        <AppFooter />
      </div>
    </div>
  )
}
