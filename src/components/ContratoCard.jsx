import React, { useEffect, useState } from 'react'
import { listarContratos, arquivarContrato, editarContrato } from '../services/contratoService'
import { useNavigate } from 'react-router-dom'
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CButton, CFormInput, CFormCheck, CTooltip, CBadge, CCard, CCardBody, CCardTitle,
  CSpinner, CAlert
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilEnvelopeClosed, cilPlus, cilArrowTop, cilArrowBottom, cilEnvelopeLetter } from '@coreui/icons'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import logo from 'src/assets/brand/logo.png'

export default function ContratoCard() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [contratos, setContratos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  const [showAtivo, setShowAtivo] = useState(true)
  const [showArquivado, setShowArquivado] = useState(false)
  const [showCancelado, setShowCancelado] = useState(false)
  const [showConcluido, setShowConcluido] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const fetchContratos = async () => {
      try {
        const response = await listarContratos()
        setContratos(Array.isArray(response.data) ? response.data : [])
      } catch (err) {
        console.error('Erro ao buscar contratos:', err)
        setError('Não foi possível carregar os contratos. Tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
    }
    fetchContratos()
  }, [])

  const handleRowClick = (id) => navigate(`/contrato/${id}`)
  const handleEdit = (id) => navigate(`/contrato/${id}/editar`)

  const handleArchive = async (id) => {
    const contrato = contratos.find(c => c.id === id)
    if (!contrato) return
    if (contrato.statusContrato?.toUpperCase() === 'ARQUIVADO') {
      if (!window.confirm('Tem certeza que deseja reativar este contrato?')) return
      try {
        await editarContrato(id, { status: 'ATIVO' })
        setContratos(prev => prev.map(c => c.id === id ? { ...c, statusContrato: 'ATIVO' } : c))
        setAlertMessage('Contrato reativado com sucesso!')
        setShowSuccessAlert(true)
        setTimeout(() => setShowSuccessAlert(false), 2000)
      } catch (err) {
        console.error('Erro ao reativar contrato:', err)
        setError('Não foi possível reativar o contrato. Tente novamente mais tarde.')
      }
    } else {
      if (!window.confirm('Tem certeza que deseja arquivar este contrato?')) return
      try {
        await arquivarContrato(id)
        setContratos(prev => prev.filter(c => c.id !== id))
        setAlertMessage('Contrato arquivado com sucesso!')
        setShowSuccessAlert(true)
        setTimeout(() => setShowSuccessAlert(false), 2000)
      } catch (err) {
        console.error('Erro ao arquivar contrato:', err)
        setError('Não foi possível arquivar o contrato. Tente novamente mais tarde.')
      }
    }
  }

  const handleAdd = () => navigate('/cadastrar-contrato')

  const getStatusBadgeColor = (status) => {
    const desc = status?.toLowerCase()
    if (desc === 'ativo') return 'success'
    if (desc === 'arquivado') return 'secondary'
    if (desc === 'cancelado') return 'danger'
    if (desc === 'concluído' || desc === 'concluido') return 'info'
    return 'dark'
  }

  const formatarData = (dataISO) => {
    if (!dataISO) return ''
    const data = new Date(dataISO)
    return new Intl.DateTimeFormat('pt-BR').format(data)
  }

  const filteredContratos = contratos.filter((contrato) => {
    const status = contrato.statusContrato?.toUpperCase() || ''
    if (status === 'ATIVO' && !showAtivo) return false
    if (status === 'ARQUIVADO' && !showArquivado) return false
    if (status === 'CANCELADO' && !showCancelado) return false
    if (status === 'CONCLUÍDO' && !showConcluido) return false
    const search = searchTerm.toLowerCase()
    return (
      contrato.descricao?.toLowerCase().includes(search) ||
      contrato.nomeFantasia?.toLowerCase().includes(search) ||
      contrato.valor?.toString().includes(search) ||
      status.toLowerCase().includes(search)
    )
  })

  const handleSort = (key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }))
  }
  const getSortIcon = (key) => sortConfig.key !== key ? null : <CIcon icon={sortConfig.direction === 'asc' ? cilArrowTop : cilArrowBottom} className="ms-1" />

  const sortedContratos = [...filteredContratos].sort((a, b) => {
    const { key, direction } = sortConfig
    if (!key) return 0
    const getValue = obj => {
      switch (key) {
        case 'id': return obj.id
        case 'nomeFantasia': return obj.nomeFantasia?.toLowerCase() || ''
        case 'valor': return Number(obj.valor)
        case 'dataInicio': return new Date(obj.dataInicio).getTime()
        case 'statusContrato': return obj.statusContrato?.toLowerCase() || ''
        default: return ''
      }
    }
    const aValue = getValue(a)
    const bValue = getValue(b)
    if (aValue < bValue) return direction === 'asc' ? -1 : 1
    if (aValue > bValue) return direction === 'asc' ? 1 : -1
    return 0
  })

  const exportToPDF = () => {
    const doc = new jsPDF()
    const tableColumn = ["N° Contrato", "Empresa", "Valor", "Período", "Status"]
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
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 40, styles: { fontSize: 10 }, headStyles: { fillColor: [33,38,49], textColor: [255,255,255], halign: 'left' } })
    doc.save("contratos.pdf")
  }

  return (
    <div className="p-4">
      <CCard className="mb-4">
        <CCardBody>
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <CCardTitle className="h4 mb-0">Contratos</CCardTitle>
            <CButton color="secondary" onClick={exportToPDF}>Exportar PDF</CButton>
            <div className="d-flex align-items-center">
              <CFormCheck className="me-2" type="checkbox" id="filtro-ativo" label="Ativo" checked={showAtivo} onChange={() => setShowAtivo(prev => !prev)} />
              <CFormCheck className="me-2" type="checkbox" id="filtro-arquivado" label="Arquivado" checked={showArquivado} onChange={() => setShowArquivado(prev => !prev)} />
              <CFormCheck className="me-2" type="checkbox" id="filtro-cancelado" label="Cancelado" checked={showCancelado} onChange={() => setShowCancelado(prev => !prev)} />
              <CFormCheck className="me-2" type="checkbox" id="filtro-concluido" label="Concluído" checked={showConcluido} onChange={() => setShowConcluido(prev => !prev)} />
              <CFormInput type="search" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ maxWidth: '200px' }} className="me-3" />
            </div>
          </div>
          <div className="d-flex mb-3">
            <CTooltip content="Adicionar novo contrato" placement="top">
              <CButton color="success" onClick={handleAdd} className="d-flex align-items-center text-white"><CIcon icon={cilPlus} size="xl" className="text-white me-1" />Novo Contrato</CButton>
            </CTooltip>
          </div>
          {showSuccessAlert && <CAlert color="success" dismissible className="mb-3">{alertMessage}</CAlert>}
          {error && <CAlert color="danger" dismissible className="mb-3">{error}</CAlert>}
          {loading ? <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '150px' }}><CSpinner color="primary" /><span className="ms-2">Carregando contratos...</span></div>
          : sortedContratos.length === 0 ? <CAlert color="info" className="mb-3">Nenhum contrato encontrado.</CAlert>
          : <CTable hover responsive>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>N° Contrato {getSortIcon('id')}</CTableHeaderCell>
                  <CTableHeaderCell onClick={() => handleSort('nomeFantasia')} style={{ cursor: 'pointer' }}>Empresa {getSortIcon('nomeFantasia')}</CTableHeaderCell>
                  <CTableHeaderCell onClick={() => handleSort('valor')} style={{ cursor: 'pointer' }}>Valor {getSortIcon('valor')}</CTableHeaderCell>
                  <CTableHeaderCell onClick={() => handleSort('dataInicio')} style={{ cursor: 'pointer' }}>Período {getSortIcon('dataInicio')}</CTableHeaderCell>
                  <CTableHeaderCell onClick={() => handleSort('statusContrato')} style={{cursor: 'pointer'}}>Status {getSortIcon('statusContrato')}</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Ações</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {sortedContratos.map(contrato => (
                  <CTableRow key={contrato.id}>
                    <CTableDataCell onClick={() => handleRowClick(contrato.id)} style={{ cursor: 'pointer' }}>{contrato.id}</CTableDataCell>
                    <CTableDataCell onClick={() => handleRowClick(contrato.id)} style={{ cursor: 'pointer' }}>{contrato.nomeFantasia}</CTableDataCell>
                    <CTableDataCell onClick={() => handleRowClick(contrato.id)} style={{ cursor: 'pointer' }}>{`R$ ${Number(contrato.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</CTableDataCell>
                    <CTableDataCell onClick={() => handleRowClick(contrato.id)} style={{ cursor: 'pointer' }}>{`${formatarData(contrato.dataInicio)} → ${formatarData(contrato.dataFim)}`}</CTableDataCell>
                    <CTableDataCell onClick={() => handleRowClick(contrato.id)} style={{ cursor: 'pointer' }}><CBadge color={getStatusBadgeColor(contrato.statusContrato)}>{contrato.statusContrato}</CBadge></CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CTooltip content="Editar Contrato" placement="top"><CButton color="primary" variant="outline" size="sm" className="me-2" onClick={e => { e.stopPropagation(); handleEdit(contrato.id); }}><CIcon icon={cilPencil} /></CButton></CTooltip>
                      <CTooltip content={contrato.statusContrato?.toUpperCase() === 'ARQUIVADO' ? "Reativar Contrato" : "Arquivar Contrato"} placement="top">
                        <CButton color={contrato.statusContrato?.toUpperCase() === 'ARQUIVADO' ? "success" : "danger"} variant="outline" size="sm" className="ms-2" onClick={e => { e.stopPropagation(); handleArchive(contrato.id); }}>
                          <CIcon icon={contrato.statusContrato?.toUpperCase() === 'ARQUIVADO' ? cilEnvelopeLetter : cilEnvelopeClosed} />
                        </CButton>
                      </CTooltip>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>}
        </CCardBody>
      </CCard>
    </div>
  )
}
