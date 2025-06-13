import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmpresas, deleteEmpresa, updateEmpresa } from "../services/empresaService";
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CFormInput,
  CFormCheck,
  CTooltip,
  CBadge,
  CCard,
  CCardBody,
  CCardTitle,
  CSpinner,
  CAlert,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilPencil, cilInbox, cilArrowTop, cilArrowBottom, cilPlus } from "@coreui/icons";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from 'src/assets/brand/logo.png';

export default function CardClientes() {
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchingError, setFetchingError] = useState(null);
  const [error, setError] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showAtivos, setShowAtivos] = useState(true);
  const [showInativos, setShowInativos] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEmpresas() {
      setLoading(true);
      setFetchingError(null);
      try {
        const response = await getEmpresas();
        const data = Array.isArray(response.data) ? response.data : [];
        setClientes(data);
      } catch (err) {
        console.error("Erro ao buscar empresas:", err);
        setFetchingError("Não foi possível carregar as empresas. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    }
    fetchEmpresas();
  }, []);

  const handleToggleStatus = async (id) => {
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) return;
    const isInativo = !cliente.ativo;
    const action = isInativo ? 'reativar' : 'arquivar';
    if (!window.confirm(`Tem certeza que deseja ${action} esta empresa?`)) return;
    try {
      if (isInativo) {
        await updateEmpresa(id, { ativo: true });
        setClientes(prev => prev.map(c => c.id === id ? { ...c, ativo: true } : c));
        setAlertMessage("Empresa reativada com sucesso!");
      } else {
        await deleteEmpresa(id);
        setClientes(prev => prev.filter(c => c.id !== id));
        setAlertMessage("Empresa arquivada com sucesso!");
      }
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 2000);
    } catch (err) {
      console.error(`Erro ao ${action} empresa:`, err);
      setError(`Não foi possível ${action} a empresa. Verifique se ela possui contratos ativos ou se ela existe.`);
    }
  };

  const handleEdit = (id) => navigate(`/clientes/${id}/editar`);
  const handleAdd = () => navigate('/cadastrar-empresa');
  const handleRowClick = (id) => navigate(`/clientes/${id}`);

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

  const getStatusBadgeColor = (ativo) => (ativo ? 'success' : 'danger');

  // Filtragem por status e termo
  const filteredClientes = clientes.filter((cliente) => {
    if (!showAtivos && cliente.ativo) return false;
    if (!showInativos && !cliente.ativo) return false;
    const termo = searchTerm.toLowerCase();
    return (
      (cliente.razaoSocial?.toLowerCase() || '').includes(termo) ||
      (cliente.nomeFantasia?.toLowerCase() || '').includes(termo) ||
      (cliente.nomeResponsavel?.toLowerCase() || '').includes(termo) ||
      (cliente.ativo ? 'ativo' : 'inativo').includes(termo)
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

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ['Razão Social', 'Nome Fantasia', 'Responsável', 'Status'];
    const tableRows = sortedClientes.map(c => [
      c.razaoSocial,
      c.nomeFantasia,
      `${c.nomeResponsavel}`,
      c.ativo ? 'ATIVO' : 'INATIVO'
    ]);

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

  return (
    <div className="p-4">
      <CCard className="mb-4">
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
            <CCardTitle className="h4 mb-0">Clientes Cadastrados</CCardTitle>
            <CButton color="secondary" onClick={exportToPDF}>Exportar PDF</CButton>
            <div className="d-flex align-items-center">
              <CFormCheck
                type="checkbox"
                id="filtro-ativos"
                label="Ativos"
                checked={showAtivos}
                onChange={() => setShowAtivos(prev => !prev)}
                className="me-3"
              />
              <CFormCheck
                type="checkbox"
                id="filtro-inativos"
                label="Inativos"
                checked={showInativos}
                onChange={() => setShowInativos(prev => !prev)}
                className="me-3"
              />
              <CFormInput
                type="search"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ maxWidth: '250px' }}
              />
            </div>
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
              {alertMessage}
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
              <span className="ms-2">Carregando clientes...</span>
            </div>
          ) : fetchingError ? (
            <CAlert color="danger" className="mb-3">{fetchingError}</CAlert>
          ) : sortedClientes.length === 0 ? (
            <CAlert color="info" className="mb-3">Nenhum cliente encontrado.</CAlert>
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
                      <CTooltip content={cliente.ativo ? "Arquivar Empresa" : "Reativar Empresa"} placement="top">
                        <CButton
                          color={cliente.ativo ? 'danger' : 'success'}
                          variant="outline"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleToggleStatus(cliente.id); }}
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
