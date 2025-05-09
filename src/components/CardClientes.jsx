
import React from 'react'
import clientes from '../data/clientes.json' 
import { CCard, CCardBody, CCardTitle, CRow, CCol } from '@coreui/react'
import { useNavigate } from 'react-router-dom'

export default function CardClientes() {
  
  const navigate = useNavigate()

  const handleCardClick = (id) => {
    navigate(`/clientes/${id}`)
  }

  return (
    <div className="p-4 space-y-4">
      <h2>Clientes Cadastrados</h2>
      <CRow className="g-4">
        {clientes.map((cliente) => (
          <CCol key={cliente.id} md={4}>
            <CCard
              onClick={() => handleCardClick(cliente.id)}
              className="cursor-pointer hover:shadow-lg transition-shadow"
            >
              <CCardBody>
                <CCardTitle>{cliente.nomeFantasia}</CCardTitle>
                <p><strong>Razão Social:</strong> {cliente.razaoSocial}</p>
                <p><strong>Responsável:</strong> {cliente.nomeResponsavel} {cliente.sobrenomeResponsavel}</p>
                <p><strong>Email:</strong> {cliente.emailResponsavel}</p>
                <p><strong>CNPJ:</strong> {cliente.cnpj}</p>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>
    </div>
  )
}
