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
  CTooltip,
  CCard, // Adicionado CCard
  CCardBody, // Adicionado CCardBody
  CCardTitle, // Adicionado CCardTitle
  CSpinner, // Adicionado CSpinner para carregamento
  CAlert, // Adicionado CAlert para mensagens de erro/sucesso
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilPencil, cilTrash, cilPlus, cilArrowTop, cilArrowBottom } from "@coreui/icons";
import { getColaboradores, deleteColaborador } from "../services/colaboradorService";
import { useNavigate } from "react-router-dom";

export default function ExibirColaboradores() {
  const [colaboradores, setColaboradores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const [error, setError] = useState(null);     // Estado de erro
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchColaboradores = async () => {
      setLoading(true); // Inicia o carregamento
      setError(null);   // Limpa erros anteriores
      try {
        const response = await getColaboradores();

        // Verifica se a resposta é um array ou se precisa extrair de uma chave
        const data = Array.isArray(response.data) ? response.data : [];
        // Filtra por status "ATIVO"
        const data_filtered = data.filter((colaborador) => colaborador.status === "ATIVO");
        setColaboradores(data_filtered);
      } catch (error) {
        console.error("Erro ao buscar colaboradores:", error);
        setError("Não foi possível carregar os colaboradores. Tente novamente mais tarde.");
        setColaboradores([]); // fallback seguro
      } finally {
        setLoading(false); // Finaliza o carregamento
      }
    };

    fetchColaboradores();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja arquivar este colaborador?")) return;
    try {
      await deleteColaborador(id);
      setColaboradores(prev => prev.filter(colab => colab.id !== id));
      alert("Colaborador arquivado com sucesso!"); // Feedback de sucesso
    } catch (error) {
      console.error("Erro ao arquivar colaborador:", error);
      alert("Erro ao arquivar colaborador. Verifique se ele está vinculado a contratos ou se ele existe.");
    }
  };

  const handleAdd = () => navigate("/cadastrar-colaborador");

  const handleRowClick = (id) => {
    navigate(`/colaboradores/${id}`);
  };

  const filteredColaboradores = colaboradores.filter((colab) => {
    const fullName = `${colab.nome || ''} ${colab.sobrenome || ''}`.toLowerCase();
    const cargo = (colab.cargo || '').toLowerCase(); // Garante que cargo existe
    const email = (colab.email || '').toLowerCase(); // Garante que email existe
    const status = (colab.status || '').toLowerCase(); // Garante que status existe
    const termo = searchTerm.toLowerCase();

    return (
      fullName.includes(termo) ||
      cargo.includes(termo) ||
      email.includes(termo) ||
      status.includes(termo)
    );
  });

  const sortedColaboradores = [...filteredColaboradores].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = (a[sortConfig.key] || '').toString().toLowerCase();
    const bValue = (b[sortConfig.key] || '').toString().toLowerCase();

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
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

  return (
    <div className="p-4"> {/* Removido position-relative do div pai */}
      <CCard className="mb-4"> {/* Envolvendo o conteúdo em um CCard */}
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <CCardTitle className="h4 mb-0">Colaboradores</CCardTitle> {/* Usando CCardTitle */}
            <CFormInput
              type="search"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: "250px" }}
            />
          </div>

          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '150px' }}>
              <CSpinner color="primary" />
              <span className="ms-2">Carregando colaboradores...</span>
            </div>
          ) : error ? (
            <CAlert color="danger" className="mb-3">{error}</CAlert>
          ) : filteredColaboradores.length === 0 ? (
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
                {sortedColaboradores.map((colab) => (
                  <CTableRow key={colab.id}>
                    <CTableDataCell onClick={(e) => { e.stopPropagation(); handleRowClick(colab.id); }} style={{ cursor: 'pointer' }}>{colab.nome} {colab.sobrenome}</CTableDataCell>
                    <CTableDataCell onClick={(e) => { e.stopPropagation(); handleRowClick(colab.id); }} style={{ cursor: 'pointer' }}>{colab.cargo}</CTableDataCell>
                    <CTableDataCell onClick={(e) => { e.stopPropagation(); handleRowClick(colab.id); }} style={{ cursor: 'pointer' }}>{colab.email}</CTableDataCell>
                    <CTableDataCell onClick={(e) => { e.stopPropagation(); handleRowClick(colab.id); }} style={{ cursor: 'pointer' }}>{colab.status}</CTableDataCell>
                    <CTableDataCell className="text-center"> {/* Centralizado */}
                      <CTooltip content="Editar Colaborador" placement="top">
                        <CButton
                          color="primary" // Alterado para primary
                          variant="outline"
                          size="sm"
                          className="me-2"
                          onClick={(e) => { e.stopPropagation(); navigate(`/colaboradores/${colab.id}/editar`); }} // StopPropagation
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                      </CTooltip>
                      <CTooltip content="Arquivar Colaborador" placement="top">
                        <CButton
                          color="danger"
                          variant="outline"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleDelete(colab.id); }} // StopPropagation
                        >
                          <CIcon icon={cilTrash} />
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

      {/* Botão flutuante para adicionar novo colaborador */}
      <div
        className="position-fixed bottom-0 end-0 p-4" // p-4 para padding
        style={{ zIndex: 1050 }} // Z-index alto para ficar acima de outros elementos
      >
        <CTooltip content="Adicionar novo colaborador" placement="top">
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
  );
}