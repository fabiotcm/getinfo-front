import React, { useState } from 'react'
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
  CFormInput,
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus } from '@coreui/icons'

export default function ContratoCard() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const getClienteNome = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId)
    return cliente?.nome || 'Empresa não encontrada'
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

  const filteredContratos = contratos.filter((contrato) => {
    const clienteNome = getClienteNome(contrato.clienteId).toLowerCase()
    const search = searchTerm.toLowerCase()
    return (
      contrato.titulo.toLowerCase().includes(search) ||
      clienteNome.includes(search) ||
      contrato.valor.toString().includes(search)
    )
  })

  return (
    <div className="p-4 position-relative">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Contratos</h2>
        <CFormInput
          type="search"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: '250px' }}
        />
      </div>

      <CTable hover responsive>
        <CTableHead color="light">
          <CTableRow>
            <CTableHeaderCell>N° do Contrato</CTableHeaderCell>
            <CTableHeaderCell>Empresa</CTableHeaderCell>
            <CTableHeaderCell>Valor</CTableHeaderCell>
            <CTableHeaderCell>Período</CTableHeaderCell>
            <CTableHeaderCell className="text-end">Ações</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {filteredContratos.map((contrato) => (
            <CTableRow key={contrato.id}>
              <CTableDataCell onClick={() => handleRowClick(contrato.id)}>{contrato.id}</CTableDataCell>
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
