import React from 'react'
import { useParams } from 'react-router-dom'
import contratos from '../../data/contratos.json'
import clientes from '../../data/clientes.json'
import { CButton, CCard, CCardBody, CCardTitle, CCardText } from '@coreui/react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'

export default function ContratoDetalhes() {
  const { id } = useParams()
  const contrato = contratos.find(c => c.id === parseInt(id))
  const cliente = clientes.find(c => c.id === contrato?.clienteId)

  if (!contrato) {
    return <p>Contrato não encontrado.</p>
  }

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
        <div className="p-4">
      <CCard>
        <CCardBody>
          <CCardTitle className="h4">{contrato.titulo}</CCardTitle>
          <CCardText>
            <strong>Cliente:</strong> {cliente?.nome}<br />
            <strong>Valor:</strong> R$ {contrato.valor.toLocaleString()}<br />
            <strong>Data Início:</strong> {contrato.dataInicio}<br />
            <strong>Data Fim:</strong> {contrato.dataFim}<br />
            <strong>Status:</strong> {contrato.status}<br />
            <strong>Descrição:</strong> {contrato.descricao}
          </CCardText>

          <div className="d-flex gap-2 mt-3">
            <CButton color="primary">Editar</CButton>
            <CButton color="warning">Inserir Aditivo</CButton>
            <CButton color="info">Inserir Repactuação</CButton>
          </div>
        </CCardBody>
      </CCard>
    </div>
        </div>
        <AppFooter />
      </div>
    </div>  
  )
}