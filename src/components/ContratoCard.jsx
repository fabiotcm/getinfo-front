import React, { useEffect, useState } from 'react'
import contratos from '../data/contratos_detalhados.json'
import { listarContratos } from '../services/contratoService'
import { useNavigate } from 'react-router-dom'
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, CFormInput, CTooltip, CBadge, CCard, CCardBody, CCardTitle
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus, cilArrowTop, cilArrowBottom } from '@coreui/icons'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import logo from 'src/assets/brand/logo.png';

export default function ContratoCard() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [contratos,setContratos] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  const handleRowClick = (id) => navigate(`/contrato/${id}`)
  const handleEdit = (id) => navigate(`/contrato/${id}/editar`)
  const handleArchive = (id) => alert(`Contrato ${id} arquivado`)
  const handleAdd = () => navigate('/cadastrar-contrato')

  const getStatusBadgeColor = (status) => {
    const desc = status?.descricao?.toLowerCase()
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
    if (!dataISO) return '';
    const data = new Date(dataISO);
    return new Intl.DateTimeFormat('pt-BR').format(data);
  };

  useEffect(() => {
    const fetchContratos = async () => {
      try {
        const response = await listarContratos()
        setContratos(response.data)
      } catch (error) {
        console.error('Erro ao buscar contratos:', error)
      }
    }

    fetchContratos()
  }
  , [])
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
        case 'id_contrato':
          return obj.id_contrato
        case 'empresa':
          return obj.empresa?.nome_fantasia || ''
        case 'valor':
          return Number(obj.valor)
        case 'data':
          return new Date(obj.data_inicio).getTime()
        case 'status':
          return obj.status?.descricao || ''
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
      c.id_contrato,
      c.empresa?.nome_fantasia || '',
      `R$ ${Number(c.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `${formatarData(c.data_inicio)} - ${formatarData(c.data_final)}`,
      c.status?.descricao || ''
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

          <CTable hover responsive>
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell onClick={() => handleSort('id_contrato')} style={{ cursor: 'pointer' }}>
                  N° do Contrato {getSortIcon('id_contrato')}
                </CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSort('empresa')} style={{ cursor: 'pointer' }}>
                  Empresa {getSortIcon('empresa')}
                </CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSort('valor')} style={{ cursor: 'pointer' }}>
                  Valor {getSortIcon('valor')}
                </CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSort('data')} style={{ cursor: 'pointer' }}>
                  Período {getSortIcon('data')}
                </CTableHeaderCell>
                <CTableHeaderCell onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                  Status {getSortIcon('status')}
                </CTableHeaderCell>
                <CTableHeaderCell className="text-center">Ações</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            
            <CTableBody>
              {filteredContratos.map((contrato) => (
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
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTooltip>
                    </CTableDataCell>
                  </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      <div className="position-fixed bottom-0 end-0 p-4" style={{ zIndex: 1050 }}>
        <CTooltip content="Adicionar novo contrato" placement="top">
          <CButton
            color="success"
            shape="rounded-pill"
            style={{ borderRadius: '50%', width: '56px', height: '56px' }}
            onClick={handleAdd}
            className='d-flex align-items-center justify-content-center'
          >
            <CIcon icon={cilPlus} size="xl" className='text-white' />
          </CButton>
        </CTooltip>
      </div>
    </div>
  )
}