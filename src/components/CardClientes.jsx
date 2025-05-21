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
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilPencil, cilTrash, cilPlus } from "@coreui/icons";

export default function CardClientes() {
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEmpresas() {
      try {
        const response = await getEmpresas();
        const data = Array.isArray(response) ? response : response.data || [];
        setClientes(data);
      } catch (error) {
        console.error("Erro ao buscar empresas:", error);
        setClientes([]);
      }
    }

    fetchEmpresas();
  }, []);

  const handleEdit = (id) => {
    navigate(`/clientes/${id}/editar`);
    console.log(`Editar cliente ${id}`);
  };

  const handleDelete = async (id) => {
  if (window.confirm("Tem certeza que deseja excluir esta empresa?")) {
    try {
      await deleteEmpresa(id);
      setClientes((prev) => prev.filter((cliente) => cliente.id !== id));
    } catch (error) {
      console.error("Erro ao excluir empresa:", error);
      alert("Erro ao excluir empresa. Verifique se ela existe.");
    }
  }
  };

  const handleAdd = () => {
    navigate("/cadastrar-cliente");
  };

  const handleRowClick = (id) => {
    navigate(`/clientes/${id}`);
  };

  const filteredClientes = clientes.filter((cliente) => {
  const termo = searchTerm.toLowerCase()
  return (
    (cliente.nomeFantasia?.toLowerCase() || "").includes(termo) ||
    (cliente.razaoSocial?.toLowerCase() || "").includes(termo) ||
    (cliente.nomeResponsavel?.toLowerCase() || "").includes(termo) ||
    (cliente.sobrenomeResponsavel?.toLowerCase() || "").includes(termo)
  )
})


  return (
    <div className="p-4 position-relative">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Empresas Cadastradas</h2>
        <CFormInput
          type="search"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: "250px" }}
        />
      </div>

      <CTable hover responsive>
        <CTableHead color="light">
          <CTableRow>
            <CTableHeaderCell>Razão Social</CTableHeaderCell>
            <CTableHeaderCell>Nome Fantasia</CTableHeaderCell>
            <CTableHeaderCell>Responsável</CTableHeaderCell>
            <CTableHeaderCell className="text-end">Ações</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {filteredClientes.map((cliente) => (
            <CTableRow key={cliente.id}>
              <CTableDataCell onClick={() => handleRowClick(cliente.id)}>{cliente.razaoSocial}</CTableDataCell>
              <CTableDataCell onClick={() => handleRowClick(cliente.id)}>{cliente.nomeFantasia}</CTableDataCell>
              <CTableDataCell onClick={() => handleRowClick(cliente.id)}>
                {cliente.nomeResponsavel} {cliente.sobrenomeResponsavel}
              </CTableDataCell>
              <CTableDataCell className="text-end">
                <CButton
                  color="success"
                  variant="outline"
                  size="sm"
                  className="me-2"
                  onClick={() => handleEdit(cliente.id)}
                >
                  <CIcon icon={cilPencil} />
                </CButton>
                <CButton
                  color="danger"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(cliente.id)}
                >
                  <CIcon icon={cilTrash} />
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <div className="position-fixed bottom-4 end-4">
        <CTooltip content="Adicionar nova empresa" placement="top">
          <CButton
            color="success"
            shape="rounded-pill"
            style={{ borderRadius: "12px", width: "56px", height: "56px" }}
            onClick={handleAdd}
          >
            <CIcon icon={cilPlus} size="lg" />
          </CButton>
        </CTooltip>
      </div>
    </div>
  );
}
