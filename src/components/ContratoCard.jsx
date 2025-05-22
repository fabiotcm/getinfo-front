import React, { useState } from 'react'
import contratos from '../data/contratos_detalhados.json'
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
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus } from '@coreui/icons'

export default function ContratoCard() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

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

  const getStatusBadgeColor = (status) => {
    const desc = status?.descricao?.toLowerCase()
    if (desc === 'ativo') return 'success'
    if (desc === 'encerrado') return 'secondary'
    if (desc === 'cancelado') return 'danger'
    if (desc === 'em andamento') return 'info'
    return 'dark'
  }

  const filteredContratos = contratos.filter((contrato) => {
    const nomeFantasia = contrato.empresa?.nome_fantasia?.toLowerCase() || ''
    const razaoSocial = contrato.empresa?.razao_social?.toLowerCase() || ''
    const search = searchTerm.toLowerCase()
    return (
      contrato.descricao.toLowerCase().includes(search) ||
      nomeFantasia.includes(search) ||
      razaoSocial.includes(search) ||
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
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell className="text-end">Ações</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {filteredContratos.map((contrato) => (
            <CTableRow key={contrato.id_contrato}>
              <CTableDataCell onClick={() => handleRowClick(contrato.id_contrato)}>{contrato.id_contrato}</CTableDataCell>
              <CTableDataCell onClick={() => handleRowClick(contrato.id_contrato)}>
                {contrato.empresa?.nome_fantasia || 'Empresa não encontrada'}
              </CTableDataCell>
              <CTableDataCell onClick={() => handleRowClick(contrato.id_contrato)}>
                R$ {Number(contrato.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </CTableDataCell>
              <CTableDataCell onClick={() => handleRowClick(contrato.id_contrato)}>
                {contrato.data_inicio} → {contrato.data_final}
              </CTableDataCell>
              <CTableDataCell onClick={() => handleRowClick(contrato.id_contrato)}>
                <CBadge color={getStatusBadgeColor(contrato.status)}>
                  {contrato.status?.descricao || 'Desconhecido'}
                </CBadge>
              </CTableDataCell>
              <CTableDataCell className="text-end">
                <CButton
                  color="success"
                  variant="outline"
                  size="sm"
                  className="me-2"
                  onClick={() => handleEdit(contrato.id_contrato)}
                >
                  <CIcon icon={cilPencil} />
                </CButton>
                <CButton
                  color="danger"
                  variant="outline"
                  size="sm"
                  onClick={() => handleArchive(contrato.id_contrato)}
                >
                  <CIcon icon={cilTrash} />
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

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
