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
  cilInbox,
  cilPlus,
  cilArrowTop,
  cilArrowBottom,
} from "@coreui/icons";
import { getColaboradores, deleteColaborador } from "../services/colaboradorService";
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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showAtivos, setShowAtivos] = useState(true);
  const [showInativos, setShowInativos] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchColaboradores = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getColaboradores();
        const data = Array.isArray(response.data) ? response.data : [];
        setColaboradores(data);
      } catch (err) {
        console.error("Erro ao buscar colaboradores:", err);
        setError("Não foi possível carregar os colaboradores. Tente novamente mais tarde.");
        setColaboradores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchColaboradores();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja arquivar este colaborador?")) return;
    try {
      await deleteColaborador(id);
      setColaboradores(prev => prev.filter(colab => colab.id !== id));
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 2000);
    } catch (err) {
      console.error("Erro ao arquivar colaborador:", err);
      setError("Erro ao arquivar colaborador. Verifique se ele está vinculado a contratos ou se ele existe.");
    }
  };

  const handleAdd = () => navigate("/cadastrar-colaborador");
  const handleRowClick = (id) => navigate(`/colaboradores/${id}`);

  // Filtragem por status e termo
  const filteredColaboradores = colaboradores.filter((colab) => {
    // filtro de status
    if (!showAtivos && colab.status === 'ATIVO') return false;
    if (!showInativos && colab.status === 'INATIVO') return false;
    // filtro de busca
    const fullName = `${colab.nome || ''} ${colab.sobrenome || ''}`.toLowerCase();
    const termo = searchTerm.toLowerCase();
    return (
      fullName.includes(termo) ||
      (colab.cargo || '').toLowerCase().includes(termo) ||
      (colab.email || '').toLowerCase().includes(termo) ||
      (colab.status || '').toLowerCase().includes(termo)
    );
  });

  // Ordenação
  const sortedColaboradores = [...filteredColaboradores].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = (a[sortConfig.key] || '').toString().toLowerCase();
    const bVal = (b[sortConfig.key] || '').toString().toLowerCase();
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return <CIcon icon={sortConfig.direction === 'asc' ? cilArrowTop : cilArrowBottom} className="ms-1" />;
  };

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

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [33, 38, 49],
        textColor: [255, 255, 255],
        halign: 'left'
      },
      margin: { top: 10 }
    });

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
                onChange={e => setSearchTerm(e.target.value)}
                style={{ maxWidth: "250px" }}
              />
            </div>
          </div>
          <div className="d-flex justify-content-start mb-3">
            <CTooltip content="Adicionar novo colaborador" placement="top">
              <CButton color="success" onClick={handleAdd} className="d-flex align-items-center justify-content-center text-white">
                <CIcon icon={cilPlus} size="xl" className="text-white me-1" />
                Novo Colaborador
              </CButton>
            </CTooltip>
          </div>

          {showSuccessAlert && (
            <CAlert color="success" dismissible className="mb-3">
              Colaborador arquivado com sucesso!
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
              <span className="ms-2">Carregando colaboradores...</span>
            </div>
          ) : sortedColaboradores.length === 0 ? (
            <CAlert color="info" className="mb-3">Nenhum colaborador encontrado.</CAlert>
          ) : (
            <CTable hover responsive>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell onClick={() => handleSort('nome')} style={{ cursor: 'pointer' }}>
                    Nome Completo {getSortIcon('nome')}
                  </CTableHeaderCell>
                  <CTableHeaderCell onClick={() => handleSort('cargo')} style={{ cursor: 'pointer' }}>
                    Cargo {getSortIcon('cargo')}
                  </CTableHeaderCell>
                  <CTableHeaderCell onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                    Email {getSortIcon('email')}
                  </CTableHeaderCell>
                  <CTableHeaderCell onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                    Status {getSortIcon('status')}
                  </CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Ações</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {sortedColaboradores.map(colab => (
                  <CTableRow key={colab.id}>
                    <CTableDataCell onClick={e => { e.stopPropagation(); handleRowClick(colab.id); }} style={{ cursor: 'pointer' }}>
                      {colab.nome} {colab.sobrenome}
                    </CTableDataCell>
                    <CTableDataCell onClick={e => { e.stopPropagation(); handleRowClick(colab.id); }} style={{ cursor: 'pointer' }}>
                      {colab.cargo}
                    </CTableDataCell>
                    <CTableDataCell onClick={e => { e.stopPropagation(); handleRowClick(colab.id); }} style={{ cursor: 'pointer' }}>
                      {colab.email}
                    </CTableDataCell>
                    <CTableDataCell onClick={e => { e.stopPropagation(); handleRowClick(colab.id); }} style={{ cursor: 'pointer' }}>
                      <CBadge color={colab.status === 'ATIVO' ? 'success' : 'secondary'}>
                        {colab.status}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CTooltip content="Editar Colaborador" placement="top">
                        <CButton color="primary" variant="outline" size="sm" className="me-2" onClick={e => { e.stopPropagation(); navigate(`/colaboradores/${colab.id}/editar`); }}>
                          <CIcon icon={cilPencil} />
                        </CButton>
                      </CTooltip>
                      <CTooltip content="Arquivar Colaborador" placement="top">
                        <CButton color="danger" variant="outline" size="sm" onClick={e => { e.stopPropagation(); handleDelete(colab.id); }}>
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
