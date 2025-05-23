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
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilPencil, cilTrash, cilPlus } from "@coreui/icons";
import { getColaboradores, deleteColaborador } from "../services/colaboradorService";
import { useNavigate } from "react-router-dom";

export default function ExibirColaboradores() {
  const [colaboradores, setColaboradores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchColaboradores = async () => {
      try {
        const response = await getColaboradores();

        // Verifica se a resposta é um array ou se precisa extrair de uma chave
        if (Array.isArray(response)) {
          setColaboradores(response);
        } else if (Array.isArray(response.data)) {
          const data_filtered = response.data.filter((colaborador) => colaborador.status == "ATIVO");
          setColaboradores(data_filtered);
          console.log(data_filtered);
        } else {
          console.error("Formato de dados inesperado:", response);
          setColaboradores([]); // fallback seguro
        }
      } catch (error) {
        console.error("Erro ao buscar colaboradores:", error);
        setColaboradores([]); // fallback seguro
      }
    };

    fetchColaboradores();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este colaborador?")) return;
    try {
      await deleteColaborador(id);
      setColaboradores(prev => prev.filter(colab => colab.id !== id));
    } catch (error) {
      console.error("Erro ao excluir colaborador:", error);
    }
  };

  const handleAdd = () => navigate("/cadastrar-colaborador");

  const handleRowClick = (id) => {
    navigate(`/colaboradores/${id}`);
  };

  const filteredColaboradores = colaboradores.filter((colab) => {
    const fullName = `${colab.nome} ${colab.sobrenome}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      colab.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      colab.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-4 position-relative">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Colaboradores</h2>
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
            <CTableHeaderCell>Nome Completo</CTableHeaderCell>
            <CTableHeaderCell>Cargo</CTableHeaderCell>
            <CTableHeaderCell>Email</CTableHeaderCell>
            <CTableHeaderCell className="text-end">Ações</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {filteredColaboradores.map((colab) => (
            <CTableRow key={colab.id}>
              <CTableDataCell onClick={() => {handleRowClick(colab.id)}}>{colab.nome} {colab.sobrenome}</CTableDataCell>
              <CTableDataCell onClick={() => {handleRowClick(colab.id)}}>{colab.cargo}</CTableDataCell>
              <CTableDataCell onClick={() => {handleRowClick(colab.id)}}>{colab.email}</CTableDataCell>
              <CTableDataCell className="text-end">
                <CButton
                  color="success"
                  variant="outline"
                  size="sm"
                  className="me-2"
                  onClick={() => navigate(`/colaboradores/${colab.id}/editar`)}

                >
                  <CIcon icon={cilPencil} />
                </CButton>
                <CButton
                  color="danger"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(colab.id)}
                >
                  <CIcon icon={cilTrash} />
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      {/* Botão flutuante para adicionar novo colaborador */}
      <div className="position-fixed bottom-4 end-4">
        <CTooltip content="Adicionar novo colaborador" placement="top">
          <CButton
            color="success"
            shape="rounded-pill"
            style={{ borderRadius: "12px", width: "56px", height: "56px" }}
            onClick={handleAdd}
          >
            <CIcon icon={cilPlus} size="lg" style={{color: "#FFFFFF"}}/>
          </CButton>
        </CTooltip>
      </div>
    </div>
  );
}
