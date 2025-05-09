import React from 'react'
import contratos from '../data/contratos.json'
import clientes from '../data/clientes.json'
import { useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardTitle,
  CCardText,
  CRow,
  CCol
} from '@coreui/react'

export default function ContratoCard() {
  const navigate = useNavigate()

  const handleClick = (id) => {
    navigate(`/contrato/${id}`)
  }

  const getClienteNome = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId)
    return cliente?.nome || 'Cliente não encontrado'
  }

  return (
    <div className="p-4">
      <h2 className="mb-4">Contratos</h2>
      <CRow xs={{ cols: 1 }} md={{ cols: 2 }} lg={{ cols: 3 }} className="g-4">
        {contratos.map(contrato => (
          <CCol key={contrato.id}>
            <CCard
              className="h-100 shadow-sm hover-shadow"
              style={{ cursor: 'pointer' }}
              onClick={() => handleClick(contrato.id)}
            >
              <CCardBody>
                <CCardTitle className="h5 text-primary">{contrato.titulo}</CCardTitle>
                <CCardText>
                  <strong>Cliente:</strong> {getClienteNome(contrato.clienteId)}<br />
                  <strong>Valor:</strong> R$ {contrato.valor.toLocaleString()}<br />
                  <strong>Período:</strong> {contrato.dataInicio} → {contrato.dataFim}
                </CCardText>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>
    </div>
  )
}
