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
import { cilPencil, cilTrash, cilPlus } from "@coreui/icons";
import { getColaboradores, deleteColaborador } from "../services/colaboradorService";
import { useNavigate } from "react-router-dom";

export default function ExibirColaboradores() {
  const [colaboradores, setColaboradores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const [error, setError] = useState(null);     // Estado de erro
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
    if (!window.confirm("Tem certeza que deseja excluir este colaborador?")) return;
    try {
      await deleteColaborador(id);
      setColaboradores(prev => prev.filter(colab => colab.id !== id));
      alert("Colaborador excluído com sucesso!"); // Feedback de sucesso
    } catch (error) {
      console.error("Erro ao excluir colaborador:", error);
      alert("Erro ao excluir colaborador. Verifique se ele está vinculado a contratos ou se ele existe.");
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
    const termo = searchTerm.toLowerCase();

    return (
      fullName.includes(termo) ||
      cargo.includes(termo) ||
      email.includes(termo)
    );
  });

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
                  <CTableHeaderCell>Nome Completo</CTableHeaderCell>
                  <CTableHeaderCell>Cargo</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Ações</CTableHeaderCell> {/* Centralizado */}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredColaboradores.map((colab) => (
                  <CTableRow key={colab.id}>
                    <CTableDataCell onClick={(e) => { e.stopPropagation(); handleRowClick(colab.id); }} style={{ cursor: 'pointer' }}>{colab.nome} {colab.sobrenome}</CTableDataCell>
                    <CTableDataCell onClick={(e) => { e.stopPropagation(); handleRowClick(colab.id); }} style={{ cursor: 'pointer' }}>{colab.cargo}</CTableDataCell>
                    <CTableDataCell onClick={(e) => { e.stopPropagation(); handleRowClick(colab.id); }} style={{ cursor: 'pointer' }}>{colab.email}</CTableDataCell>
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
                      <CTooltip content="Excluir Colaborador" placement="top">
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