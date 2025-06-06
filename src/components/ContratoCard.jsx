import React, { useEffect, useState } from 'react'
import { listarContratos } from '../services/contratoService'
import { useNavigate } from 'react-router-dom'
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, CFormInput, CTooltip, CBadge, CCard, CCardBody, CCardTitle,
  CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilInbox, cilPlus, cilArrowTop, cilArrowBottom } from '@coreui/icons'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import logo from 'src/assets/brand/logo.png'

export default function ContratoCard() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [contratos, setContratos] = useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  const handleRowClick = (id) => navigate(`/contrato/${id}`)
  const handleEdit = (id) => navigate(`/contrato/${id}/editar`)
  const handleArchive = (id) => alert(`Contrato ${id} arquivado`)
  const handleAdd = () => navigate('/cadastrar-contrato')

  const getStatusBadgeColor = (status) => {
    const desc = status?.toLowerCase()
    if (desc === 'ativo') return 'success'
    if (desc === 'encerrado') return 'secondary'
    if (desc === 'cancelado') return 'danger'
    if (desc === 'em andamento') return 'info'
    return 'dark'
  }

  const filteredContratos = contratos.filter((contrato) => {
    const nomeFantasia = contrato.nomeFantasia?.toLowerCase() || ''
    const search = searchTerm.toLowerCase()
    return (
      contrato.descricao?.toLowerCase().includes(search) ||
      nomeFantasia.includes(search) ||
      contrato.valor?.toString().includes(search)
    )
  })

  const formatarData = (dataISO) => {
    if (!dataISO) return ''
    const data = new Date(dataISO)
    return new Intl.DateTimeFormat('pt-BR').format(data)
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetchContratos = async () => {
      try {
        const response = await listarContratos()
        setContratos(response.data)
      } catch (err) {
        console.error('Erro ao buscar contratos:', err)
        setError('Não foi possível carregar os contratos. Tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
    }
    fetchContratos()
  }, [])

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null
    return (
      <CIcon
        icon={sortConfig.direction === 'asc' ? cilArrowTop : cilArrowBottom}
        className="ms-1"
      />
    )
  }

  const sortedContratos = [...filteredContratos].sort((a, b) => {
    if (!sortConfig.key) return 0
    const getValue = (obj) => {
      switch (sortConfig.key) {
        case 'id':
          return obj.id
        case 'nomeFantasia':
          return obj.nomeFantasia?.toLowerCase() || ''
        case 'valor':
          return Number(obj.valor)
        case 'dataInicio':
          return new Date(obj.dataInicio).getTime()
        case 'statusContrato':
          return obj.statusContrato?.toLowerCase() || ''
        default:
          return ''
      }
    }
    const aValue = getValue(a)
    const bValue = getValue(b)
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const exportToPDF = () => {
    const doc = new jsPDF()
    const tableColumn = ["ID", "Empresa", "Valor", "Início - Fim", "Status"]
    const tableRows = sortedContratos.map(c => [
      c.id,
      c.nomeFantasia || '',
      `R$ ${Number(c.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `${formatarData(c.dataInicio)} - ${formatarData(c.dataFim)}`,
      c.statusContrato || ''
    ])

    doc.addImage(logo, 'PNG', 14, 10, 30, 25)
    doc.setFontSize(14)
    doc.text("Lista de Contratos", 50, 30)

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [33, 38, 49],
        textColor: [255, 255, 255],
        halign: 'left'
      }
    })

    doc.save("contratos.pdf")
  }

  return (
    <div className="p-4">
      <CCard className="mb-4">
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <CCardTitle className="h4 mb-0">Contratos</CCardTitle>
            <CButton color="secondary" onClick={exportToPDF}>Exportar PDF</CButton>
            <CFormInput
              type="search"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: '250px' }}
            />
          </div>

        <div className="mb-4">
        <CTooltip content="Adicionar novo contrato" placement="top">
          <CButton
            color="success"
            onClick={handleAdd}
            className='d-flex align-items-center justify-content-center text-white'
          >
            <CIcon icon={cilPlus} size="xl" className='text-white' />
            Cadastrar Novo Contrato
          </CButton>
        </CTooltip>
      </div>

      {loading ? (
                  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '150px' }}>
                    <CSpinner color="primary" />
                    <span className="ms-2">Carregando contratos...</span>
                  </div>
                ) : error ? (
                  <CAlert color="danger" className="mb-3">{error}</CAlert>
                ) : sortedContratos.length === 0 ? (
                  <CAlert color="info" className="mb-3">Nenhuma contrato encontrado.</CAlert>
                ) : (
          <CTable hover responsive>
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                  N° do Contrato {getSortIcon('id')}
                </CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSort('nomeFantasia')} style={{ cursor: 'pointer' }}>
                  Empresa {getSortIcon('nomeFantasia')}
                </CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSort('valor')} style={{ cursor: 'pointer' }}>
                  Valor {getSortIcon('valor')}
                </CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSort('dataInicio')} style={{ cursor: 'pointer' }}>
                  Período {getSortIcon('dataInicio')}
                </CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSort('statusContrato')} style={{ cursor: 'pointer' }}>
                  Status {getSortIcon('statusContrato')}
                </CTableHeaderCell>
                <CTableHeaderCell className="text-center">Ações</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            
            <CTableBody>
              {sortedContratos.map((contrato) => (
                <CTableRow key={contrato.id}>
                  <CTableDataCell onClick={() => handleRowClick(contrato.id)} style={{ cursor: 'pointer' }}>
                    {contrato.id}
                  </CTableDataCell>
                  <CTableDataCell onClick={() => handleRowClick(contrato.id)} style={{ cursor: 'pointer' }}>
                    {contrato.nomeFantasia || 'Empresa não encontrada'}
                  </CTableDataCell>
                  <CTableDataCell onClick={() => handleRowClick(contrato.id)} style={{ cursor: 'pointer' }}>
                    R$ {Number(contrato.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </CTableDataCell>
                  <CTableDataCell onClick={() => handleRowClick(contrato.id)} style={{ cursor: 'pointer' }}>
                    {formatarData(contrato.dataInicio)} → {formatarData(contrato.dataFim)}
                  </CTableDataCell>
                  <CTableDataCell onClick={() => handleRowClick(contrato.id)} style={{ cursor: 'pointer' }}>
                    <CBadge color={getStatusBadgeColor(contrato.statusContrato)}>
                      {contrato.statusContrato || 'Desconhecido'}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CTooltip content="Editar Contrato" placement="top">
                      <CButton
                        color="primary"
                        variant="outline"
                        size="sm"
                        className="me-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(contrato.id)
                        }}
                      >
                        <CIcon icon={cilPencil} />
                      </CButton>
                    </CTooltip>
                    <CTooltip content="Arquivar Contrato" placement="top">
                      <CButton
                        color="danger"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleArchive(contrato.id)
                        }}
                      >
                        <CIcon icon={cilInbox} />
                      </CButton>
                    </CTooltip>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
        </CCardBody>
      </CCard>

      
    </div>
  )
}
