import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmpresas, deleteEmpresa } from "../services/empresaService";
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
  CCard,
  CCardBody,
  CCardTitle,
  CSpinner,
  CAlert,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilPencil, cilInbox, cilPlus, cilArrowTop, cilArrowBottom } from "@coreui/icons";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from 'src/assets/brand/logo.png';

export default function CardClientes() {
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchingError, setFetchingError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const navigate = useNavigate();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEmpresas() {
      setLoading(true);
      setFetchingError(null);
      try {
        const response = await getEmpresas();
        const data = Array.isArray(response.data) ? response.data : [];
        setClientes(data.filter((empresa) => empresa.ativo));
      } catch (err) {
        console.error("Erro ao buscar empresas:", err);
        setFetchingError("Não foi possível carregar as empresas. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    }
    fetchEmpresas();
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return (
      <CIcon
        icon={sortConfig.direction === 'asc' ? cilArrowTop : cilArrowBottom}
        className="ms-1"
      />
    );
  };

  const filteredClientes = clientes.filter((cliente) => {
    const termo = searchTerm.toLowerCase();
    return (
      (cliente.razaoSocial?.toLowerCase() || '').includes(termo) ||
      (cliente.nomeFantasia?.toLowerCase() || '').includes(termo) ||
      (cliente.nomeResponsavel?.toLowerCase() || '').includes(termo) ||
      (cliente.ativo?.toLowerCase() || '').includes(termo)
    );
  });

  const sortedClientes = [...filteredClientes].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = (a[sortConfig.key] || '').toString().toLowerCase();
    const bVal = (b[sortConfig.key] || '').toString().toLowerCase();
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleEdit = (id) => navigate(`/clientes/${id}/editar`);
  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja arquivar esta empresa?")) {
      try {
        await deleteEmpresa(id);
        setClientes((prev) => prev.filter((c) => c.id !== id));
        setShowSuccessAlert(true);
        setTimeout(() => {
          setShowSuccessAlert(false);
        }, 2000);
      } catch (err) {
        console.error("Erro ao arquivar empresa:", err);
        setError("Erro ao arquivar empresa. Verifique se ela possui contratos ativos ou se ela existe.");
      }
    }
  };
  const handleAdd = () => navigate('/cadastrar-empresa');
  const handleRowClick = (id) => navigate(`/clientes/${id}`);

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ['Razão Social', 'Nome Fantasia', 'Responsável', 'Status'];
    const tableRows = sortedClientes.map(c => [
      c.razaoSocial,
      c.nomeFantasia,
      `${c.nomeResponsavel}`,
      c.ativo ? 'Ativo' : 'Inativo'
    ]);

    // Logo e título
    doc.addImage(logo, 'PNG', 14, 10, 30, 25);
    doc.setFontSize(14);
    doc.text('Lista de Clientes', 50, 30);

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
    });

    doc.save('clientes.pdf');
  };

  const getStatusBadgeColor = (status) => {
    const desc = status
    if (desc === true) return 'success'
    if (desc === false) return 'danger'
    return 'dark'
  }

  return (
    <div className="p-4">
      <CCard className="mb-4">
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <CCardTitle className="h4 mb-0">Empresas Cadastradas</CCardTitle>
            <CButton color="secondary" onClick={exportToPDF}>Exportar PDF</CButton>
            <CFormInput
              type="search"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: '250px' }}
            />
          </div>
          <div className="d-flex justify-content-start mb-3">
            <CTooltip content="Adicionar nova empresa" placement="top">
              <CButton
                color="success"
                onClick={handleAdd}
                className='d-flex align-items-center justify-content-center text-white'
              >
                <CIcon icon={cilPlus} size="xl" className='text-white me-1' />
                Nova Empresa
              </CButton>
            </CTooltip>
          </div>
          {showSuccessAlert && (
            <CAlert color="success" dismissible className="mb-3">
              Empresa arquivada com sucesso!
            </CAlert>
          )}
          {error && (
            <CAlert color="danger" dismissible className="mb-3">
              {error}
            </CAlert>
          )}
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '150px' }}>
              <CSpinner color="primary" />
              <span className="ms-2">Carregando empresas...</span>
            </div>
          ) : fetchingError ? (
            <CAlert color="danger" className="mb-3">{fetchingError}</CAlert>
          ) : sortedClientes.length === 0 ? (
            <CAlert color="info" className="mb-3">Nenhuma empresa encontrada.</CAlert>
          ) : (
            <CTable hover responsive>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell onClick={() => handleSort('razaoSocial')} style={{ cursor: 'pointer' }}>
                    Razão Social {getSortIcon('razaoSocial')}
                  </CTableHeaderCell>
                  <CTableHeaderCell onClick={() => handleSort('nomeFantasia')} style={{ cursor: 'pointer' }}>
                    Nome Fantasia {getSortIcon('nomeFantasia')}
                  </CTableHeaderCell>
                  <CTableHeaderCell onClick={() => handleSort('nomeResponsavel')} style={{ cursor: 'pointer' }}>
                    Responsável {getSortIcon('nomeResponsavel')}
                  </CTableHeaderCell>
                  <CTableHeaderCell onClick={() => handleSort('ativo')} style={{ cursor: 'pointer' }}>
                    Status {getSortIcon('ativo')}
                  </CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Ações</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {sortedClientes.map((cliente) => (
                  <CTableRow key={cliente.id}>
                    <CTableDataCell onClick={() => handleRowClick(cliente.id)} style={{ cursor: 'pointer' }}>
                      {cliente.razaoSocial}
                    </CTableDataCell>
                    <CTableDataCell onClick={() => handleRowClick(cliente.id)} style={{ cursor: 'pointer' }}>
                      {cliente.nomeFantasia}
                    </CTableDataCell>
                    <CTableDataCell onClick={() => handleRowClick(cliente.id)} style={{ cursor: 'pointer' }}>
                      {cliente.nomeResponsavel}
                    </CTableDataCell>
                    <CTableDataCell onClick={() => handleRowClick(cliente.id)} style={{ cursor: 'pointer' }}>
                      <CBadge color={getStatusBadgeColor(cliente.ativo)}>
                        {cliente.ativo ? 'ATIVO' : 'INATIVO'}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CTooltip content="Editar Empresa" placement="top">
                        <CButton
                          color="primary"
                          variant="outline"
                          size="sm"
                          className="me-2"
                          onClick={(e) => { e.stopPropagation(); handleEdit(cliente.id); }}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                      </CTooltip>
                      <CTooltip content="Arquivar Empresa" placement="top">
                        <CButton
                          color="danger"
                          variant="outline"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleDelete(cliente.id); }}
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
  );
}
