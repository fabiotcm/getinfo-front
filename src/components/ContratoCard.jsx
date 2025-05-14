import React from 'react'
import contratos from '../data/contratos.json'
import clientes from '../data/clientes.json'
import { useNavigate } from 'react-router-dom'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus } from '@coreui/icons'

export default function ContratoCard() {
  const navigate = useNavigate()

  const getClienteNome = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId)
    return cliente?.nome || 'Cliente não encontrado'
  }

  const handleRowClick = (id) => {
    navigate(`/contrato/${id}`)
  }

  const handleEdit = (id) => {
    navigate(`/contrato/${id}/editar`)
  }

  const handleArchive = (id) => {
    alert(`Contrato ${id} arquivado`)
  }

  const handleAdd = () => {
    navigate('/cadastrar-contrato')
  }

  return (
    <div className="p-4 position-relative">
      <h2 className="mb-4">Contratos</h2>

      <CTable hover responsive>
        <CTableHead color="light">
          <CTableRow>
            <CTableHeaderCell>Título</CTableHeaderCell>
            <CTableHeaderCell>Cliente</CTableHeaderCell>
            <CTableHeaderCell>Valor</CTableHeaderCell>
            <CTableHeaderCell>Período</CTableHeaderCell>
            <CTableHeaderCell className="text-end">Ações</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {contratos.map((contrato) => (
            <CTableRow key={contrato.id}>
              <CTableDataCell onClick={() => handleRowClick(contrato.id)}>{contrato.titulo}</CTableDataCell>
              <CTableDataCell onClick={() => handleRowClick(contrato.id)}>{getClienteNome(contrato.clienteId)}</CTableDataCell>
              <CTableDataCell onClick={() => handleRowClick(contrato.id)}>R$ {contrato.valor.toLocaleString()}</CTableDataCell>
              <CTableDataCell onClick={() => handleRowClick(contrato.id)}>
                {contrato.dataInicio} → {contrato.dataFim}
              </CTableDataCell>
              <CTableDataCell className="text-end">
                <CButton
                  color="success"
                  variant="outline"
                  size="sm"
                  className="me-2"
                  onClick={() => handleEdit(contrato.id)}
                >
                  <CIcon icon={cilPencil} />
                </CButton>
                <CButton
                  color="danger"
                  variant="outline"
                  size="sm"
                  onClick={() => handleArchive(contrato.id)}
                >
                  <CIcon icon={cilTrash} />
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      {/* Botão flutuante adicionar novo contrato */}
      <div className="position-fixed bottom-4 end-4">
        <CTooltip content="Adicionar novo contrato" placement="top">
          <CButton
            color="success"
            shape="rounded-pill"
            style={{ borderRadius: '12px', width: '56px', height: '56px' }}
            onClick={handleAdd}
          >
            <CIcon icon={cilPlus} size="lg" />
          </CButton>
        </CTooltip>
      </div>
    </div>
  )
}
