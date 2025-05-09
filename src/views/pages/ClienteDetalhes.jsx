// src/pages/ClienteDetalhes.jsx
import React from 'react'
import { useParams } from 'react-router-dom'
import clientes from '../../data/clientes.json'
import { CCard, CCardBody, CCardTitle, CButton, CRow, CCol } from '@coreui/react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'

export default function ClienteDetalhes() {
  const { id } = useParams()
  const cliente = clientes.find((c) => c.id === parseInt(id))

  if (!cliente) return <p className="p-4">Cliente não encontrado.</p>

  return (
    <div>
          <AppSidebar />
          <div className="wrapper d-flex flex-column min-vh-100">
            <AppHeader />
            <div className="body flex-grow-1">
            <div className="p-4 space-y-4">
      <CCard>
        <CCardBody>
          <CCardTitle className="text-xl mb-3">{cliente.nomeFantasia}</CCardTitle>
          <p><strong>Razão Social:</strong> {cliente.razaoSocial}</p>
          <p><strong>Responsável:</strong> {cliente.nomeResponsavel} {cliente.sobrenomeResponsavel}</p>
          <p><strong>Email:</strong> {cliente.emailResponsavel}</p>
          <p><strong>Telefone:</strong> {cliente.telefoneResponsavel}</p>
          <p><strong>CNPJ:</strong> {cliente.cnpj}</p>
        </CCardBody>
      </CCard>

      <CRow className="gap-2">
        <CCol sm="auto">
          <CButton color="warning">Editar</CButton>
        </CCol>
        <CCol sm="auto">
          <CButton color="info">Inserir Aditivo</CButton>
        </CCol>
        <CCol sm="auto">
          <CButton color="secondary">Inserir Repactuação</CButton>
        </CCol>
      </CRow>
    </div>
            </div>
            <AppFooter />
          </div>
        </div>
  )
}
