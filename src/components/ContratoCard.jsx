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
  CCard, // Adicionado CCard para envolver a tabela
  CCardBody, // Adicionado CCardBody
  CCardTitle, // Adicionado CCardTitle
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
    // Implementar lógica de arquivamento (ex: chamar API, remover da lista local)
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

  // Função para formatar data (opcional, se não estiver globalmente disponível)
  const formatarData = (dataISO) => {
    if (!dataISO) return '';
    const data = new Date(dataISO);
    return new Intl.DateTimeFormat('pt-BR').format(data);
  };


  return (
    <div className="p-4"> {/* Removido position-relative aqui, pois o botão será fixo na viewport */}
      <CCard className="mb-4"> {/* Envolvendo o conteúdo em um CCard */}
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <CCardTitle className="h4 mb-0">Contratos</CCardTitle> {/* Usando CCardTitle */}
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
                <CTableHeaderCell className="text-center">Ações</CTableHeaderCell> {/* Centralizado as ações */}
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredContratos.map((contrato) => (
                <CTableRow key={contrato.id_contrato}>
                  <CTableDataCell onClick={() => handleRowClick(contrato.id_contrato)} style={{ cursor: 'pointer' }}>{contrato.id_contrato}</CTableDataCell>
                  <CTableDataCell onClick={() => handleRowClick(contrato.id_contrato)} style={{ cursor: 'pointer' }}>
                    {contrato.empresa?.nome_fantasia || 'Empresa não encontrada'}
                  </CTableDataCell>
                  <CTableDataCell onClick={() => handleRowClick(contrato.id_contrato)} style={{ cursor: 'pointer' }}>
                    R$ {Number(contrato.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </CTableDataCell>
                  <CTableDataCell onClick={() => handleRowClick(contrato.id_contrato)} style={{ cursor: 'pointer' }}>
                    {formatarData(contrato.data_inicio)} → {formatarData(contrato.data_final)}
                  </CTableDataCell>
                  <CTableDataCell onClick={() => handleRowClick(contrato.id_contrato)} style={{ cursor: 'pointer' }}>
                    <CBadge color={getStatusBadgeColor(contrato.status)}>
                      {contrato.status?.descricao || 'Desconhecido'}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-center"> {/* Centralizado as ações */}
                    <CTooltip content="Editar Contrato" placement="top">
                      <CButton
                        color="primary" // Alterado para primary
                        variant="outline"
                        size="sm"
                        className="me-2"
                        onClick={(e) => { e.stopPropagation(); handleEdit(contrato.id_contrato); }} // StopPropagation para evitar clique na linha
                      >
                        <CIcon icon={cilPencil} />
                      </CButton>
                    </CTooltip>
                    <CTooltip content="Arquivar Contrato" placement="top">
                      <CButton
                        color="danger"
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleArchive(contrato.id_contrato); }} // StopPropagation
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

      {/* Botão de Adicionar - Garante visibilidade com z-index alto */}
      <div
        className="position-fixed bottom-0 end-0 p-4" // Use p-4 para padding
        style={{ zIndex: 1050 }} // Z-index alto para ficar acima de outros elementos
      >
        <CTooltip content="Adicionar novo contrato" placement="top">
          <CButton
            color="success"
            shape="rounded-pill"
            style={{ borderRadius: '50%', width: '56px', height: '56px' }} // 50% para um círculo perfeito
            onClick={handleAdd}
            className='d-flex align-items-center justify-content-center' // Centraliza o ícone
          >
            <CIcon icon={cilPlus} size="xl" className='text-white' /> {/* Ícone maior */}
          </CButton>
        </CTooltip>
      </div>
    </div>
  )
}