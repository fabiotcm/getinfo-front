import React, { useEffect, useState } from "react";
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
  CAlert
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cilPencil,
  cilPlus,
  cilArrowTop,
  cilArrowBottom,
  cilEnvelopeClosed,
  cilEnvelopeLetter
} from "@coreui/icons";
import { getColaboradores, deleteColaborador, patchColaborador } from "../services/colaboradorService";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "src/assets/brand/logo.png";

export default function ExibirColaboradores() {
  const [colaboradores, setColaboradores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showAtivos, setShowAtivos] = useState(true);
  const [showInativos, setShowInativos] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchColaboradores = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getColaboradores();
        setColaboradores(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Erro ao buscar colaboradores:", err);
        setError("Não foi possível carregar os colaboradores. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };
    fetchColaboradores();
  }, []);

  const handleToggleStatus = async (id) => {
    const colab = colaboradores.find(c => c.id === id);
    if (!colab) return;
    const isInativo = colab.status === 'INATIVO';
    const action = isInativo ? 'reativar' : 'arquivar';
    if (!window.confirm(`Tem certeza que deseja ${action} este colaborador?`)) return;
    try {
      if (isInativo) {
        await patchColaborador(id, { status: 'ATIVO' });
        setColaboradores(prev => prev.map(c => c.id === id ? { ...c, status: 'ATIVO' } : c));
        setAlertMessage("Colaborador reativado com sucesso!");
      } else {
        await deleteColaborador(id);
        setColaboradores(prev => prev.filter(c => c.id !== id));
        setAlertMessage("Colaborador arquivado com sucesso!");
      }
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 2000);
    } catch (err) {
      console.error(`Erro ao ${action} colaborador:`, err);
      setError(`Não foi possível ${action} o colaborador. Tente novamente mais tarde.`);
    }
  };

  const handleAdd = () => navigate("/cadastrar-colaborador");
  const handleRowClick = (id) => navigate(`/colaboradores/${id}`);

  const filteredColaboradores = colaboradores.filter(colab => {
    if (colab.status === 'ATIVO' && !showAtivos) return false;
    if (colab.status === 'INATIVO' && !showInativos) return false;
    const fullName = `${colab.nome || ''} ${colab.sobrenome || ''}`.toLowerCase();
    const termo = searchTerm.toLowerCase();
    return (
      fullName.includes(termo) ||
      (colab.cargo || '').toLowerCase().includes(termo) ||
      (colab.email || '').toLowerCase().includes(termo) ||
      (colab.status || '').toLowerCase().includes(termo)
    );
  });

  const sortedColaboradores = [...filteredColaboradores].sort((a, b) => {
    const { key, direction } = sortConfig;
    if (!key) return 0;
    const aVal = (a[key] || '').toString().toLowerCase();
    const bVal = (b[key] || '').toString().toLowerCase();
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  const getSortIcon = key => sortConfig.key !== key ? null : <CIcon icon={sortConfig.direction === 'asc' ? cilArrowTop : cilArrowBottom} className="ms-1" />;

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Nome", "Cargo", "Email", "Status"];
    const tableRows = sortedColaboradores.map(colab => [
      `${colab.nome} ${colab.sobrenome}`,
      colab.cargo,
      colab.email,
      colab.status,
    ]);
    doc.addImage(logo, 'PNG', 14, 10, 30, 25);
    doc.setFontSize(14);
    doc.text("Lista de Colaboradores", 50, 30);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 40, styles: { fontSize: 10 }, headStyles: { fillColor: [33,38,49], textColor: [255,255,255], halign: 'left' } });
    doc.save("colaboradores.pdf");
  };

  return (
    <div className="p-4">
      <CCard className="mb-4">
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
            <CCardTitle className="h4 mb-0">Colaboradores</CCardTitle>
            <CButton color="secondary" onClick={exportToPDF}>Exportar PDF</CButton>
            <div className="d-flex align-items-center">
              <CFormCheck type="checkbox" id="filtro-ativos" label="Ativos" checked={showAtivos} onChange={() => setShowAtivos(prev => !prev)} className="me-3" />
              <CFormCheck type="checkbox" id="filtro-inativos" label="Inativos" checked={showInativos} onChange={() => setShowInativos(prev => !prev)} className="me-3" />
              <CFormInput type="search" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ maxWidth: "250px" }} />
            </div>
          </div>
          <div className="d-flex mb-3">
            <CTooltip content="Adicionar novo colaborador" placement="top">
              <CButton color="success" onClick={handleAdd} className="d-flex align-items-center text-white">
                <CIcon icon={cilPlus} size="xl" className="text-white me-1" />Novo Colaborador
              </CButton>
            </CTooltip>
          </div>

          {showSuccessAlert && <CAlert color="success" dismissible className="mb-3">{alertMessage}</CAlert>}
          {error && <CAlert color="danger" dismissible className="mb-3">{error}</CAlert>}

          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '150px' }}>
              <CSpinner color="primary" /><span className="ms-2">Carregando colaboradores...</span>
            </div>
          ) : sortedColaboradores.length === 0 ? (
            <CAlert color="info" className="mb-3">Nenhum colaborador encontrado.</CAlert>
          ) : (
            <CTable hover responsive>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell onClick={() => handleSort('nome')} style={{ cursor: 'pointer' }}>Nome Completo {getSortIcon('nome')}</CTableHeaderCell>
                  <CTableHeaderCell onClick={() => handleSort('cargo')} style={{ cursor: 'pointer' }}>Cargo {getSortIcon('cargo')}</CTableHeaderCell>
                  <CTableHeaderCell onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>Email {getSortIcon('email')}</CTableHeaderCell>
                  <CTableHeaderCell onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Status {getSortIcon('status')}</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Ações</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {sortedColaboradores.map(colab => (
                  <CTableRow key={colab.id}>
                    <CTableDataCell onClick={() => handleRowClick(colab.id)} style={{ cursor: 'pointer' }}>{colab.nome} {colab.sobrenome}</CTableDataCell>
                    <CTableDataCell onClick={() => handleRowClick(colab.id)} style={{ cursor: 'pointer' }}>{colab.cargo}</CTableDataCell>
                    <CTableDataCell onClick={() => handleRowClick(colab.id)} style={{ cursor: 'pointer' }}>{colab.email}</CTableDataCell>
                    <CTableDataCell onClick={() => handleRowClick(colab.id)} style={{ cursor: 'pointer' }}><CBadge color={colab.status === 'ATIVO' ? 'success' : 'secondary'}>{colab.status}</CBadge></CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CTooltip content="Editar Colaborador" placement="top">
                        <CButton color="primary" variant="outline" size="sm" className="me-2" onClick={e => { e.stopPropagation(); navigate(`/colaboradores/${colab.id}/editar`); }}><CIcon icon={cilPencil} /></CButton>
                      </CTooltip>
                      <CTooltip content={colab.status === 'INATIVO' ? "Reativar Colaborador" : "Arquivar Colaborador"} placement="top">
                        <CButton color={colab.status === 'INATIVO' ? 'success' : 'danger'} variant="outline" size="sm" onClick={e => { e.stopPropagation(); handleToggleStatus(colab.id); }}>
                          <CIcon icon={colab.status === 'INATIVO' ? cilEnvelopeLetter : cilEnvelopeClosed} />
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
