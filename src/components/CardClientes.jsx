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
  CCard,         // Adicionado CCard
  CCardBody,     // Adicionado CCardBody
  CCardTitle,    // Adicionado CCardTitle
  CSpinner,      // Adicionado CSpinner para carregamento
  CAlert,        // Adicionado CAlert para mensagens de erro/sucesso
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilPencil, cilTrash, cilPlus } from "@coreui/icons";

export default function CardClientes() {
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const [error, setError] = useState(null);     // Estado de erro
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEmpresas() {
      setLoading(true); // Inicia o carregamento
      setError(null);   // Limpa erros anteriores
      try {
        const response = await getEmpresas();
        // Garantir que response.data é um array antes de filtrar
        const data = Array.isArray(response.data) ? response.data : [];
        const data_filtered = data.filter((empresa) => empresa.ativo === true);
        setClientes(data_filtered);
      } catch (error) {
        console.error("Erro ao buscar empresas:", error);
        setError("Não foi possível carregar as empresas. Tente novamente mais tarde.");
        setClientes([]);
      } finally {
        setLoading(false); // Finaliza o carregamento
      }
    }

    fetchEmpresas();
  }, []);

  const handleEdit = (id) => {
    navigate(`/clientes/${id}/editar`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja arquivar esta empresa?")) {
      try {
        await deleteEmpresa(id);
        setClientes((prev) => prev.filter((cliente) => cliente.id !== id));
        alert("Empresa arquivada com sucesso!"); // Feedback de sucesso
      } catch (error) {
        console.error("Erro ao arquivar empresa:", error);
        alert("Erro ao arquivar empresa. Verifique se ela possui contratos ativos ou se ela existe.");
      }
    }
  };

  const handleAdd = () => {
    navigate("/cadastrar-empresa");
  };

  const handleRowClick = (id) => {
    navigate(`/clientes/${id}`);
  };

  const filteredClientes = clientes.filter((cliente) => {
    const termo = searchTerm.toLowerCase();
    return (
      (cliente.nomeFantasia?.toLowerCase() || "").includes(termo) ||
      (cliente.razaoSocial?.toLowerCase() || "").includes(termo) ||
      (cliente.nomeResponsavel?.toLowerCase() || "").includes(termo) ||
      (cliente.sobrenomeResponsavel?.toLowerCase() || "").includes(termo)
    );
  });

  return (
    <div className="p-4"> {/* Removido position-relative do div pai */}
      <CCard className="mb-4"> {/* Envolvendo o conteúdo em um CCard */}
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <CCardTitle className="h4 mb-0">Empresas Cadastradas</CCardTitle> {/* Usando CCardTitle */}
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
              <span className="ms-2">Carregando empresas...</span>
            </div>
          ) : error ? (
            <CAlert color="danger" className="mb-3">{error}</CAlert>
          ) : filteredClientes.length === 0 ? (
            <CAlert color="info" className="mb-3">Nenhuma empresa encontrada.</CAlert>
          ) : (
            <CTable hover responsive>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Razão Social</CTableHeaderCell>
                  <CTableHeaderCell>Nome Fantasia</CTableHeaderCell>
                  <CTableHeaderCell>Responsável</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Ações</CTableHeaderCell> {/* Centralizado */}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredClientes.map((cliente) => (
                  <CTableRow key={cliente.id}>
                    <CTableDataCell onClick={() => handleRowClick(cliente.id)} style={{ cursor: 'pointer' }}>{cliente.razaoSocial}</CTableDataCell>
                    <CTableDataCell onClick={() => handleRowClick(cliente.id)} style={{ cursor: 'pointer' }}>{cliente.nomeFantasia}</CTableDataCell>
                    <CTableDataCell onClick={() => handleRowClick(cliente.id)} style={{ cursor: 'pointer' }}>
                      {cliente.nomeResponsavel} {cliente.sobrenomeResponsavel}
                    </CTableDataCell>
                    <CTableDataCell className="text-center"> {/* Centralizado */}
                      <CTooltip content="Editar Empresa" placement="top">
                        <CButton
                          color="primary" // Alterado para primary
                          variant="outline"
                          size="sm"
                          className="me-2"
                          onClick={(e) => { e.stopPropagation(); handleEdit(cliente.id); }} // StopPropagation
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                      </CTooltip>
                      <CTooltip content="Arquivar Empresa" placement="top">
                        <CButton
                          color="danger"
                          variant="outline"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleDelete(cliente.id); }} // StopPropagation
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

      {/* Botão de Adicionar - Garante visibilidade com z-index alto */}
      <div
        className="position-fixed bottom-0 end-0 p-4" // p-4 para padding
        style={{ zIndex: 1050 }} // Z-index alto para ficar acima de outros elementos
      >
        <CTooltip content="Adicionar nova empresa" placement="top">
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