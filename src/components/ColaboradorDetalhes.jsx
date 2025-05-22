import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CCard,
  CCardBody,
  CCardTitle,
  CButton,
  CRow,
  CCol,
  CSpinner,
} from "@coreui/react";
import { AppSidebar, AppHeader, AppFooter } from "../components";
import { getColaboradorById } from "../services/colaboradorService";

export default function ColaboradorDetalhes() {
  const { id } = useParams();
  const [colaborador, setColaborador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchColaborador() {
      try {
        const response = await getColaboradorById(id);
        setColaborador(response.data);
      } catch (error) {
        console.error("Erro ao buscar colaborador:", error);
        setErro("Colaborador não encontrado ou erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    }

    fetchColaborador();
  }, [id]);

  if (loading) {
    return (
      <div className="p-4">
        <CSpinner color="primary" />
        <span className="ms-2">Carregando colaborador...</span>
      </div>
    );
  }

  if (erro || !colaborador) {
    return <p className="p-4">{erro || "Colaborador não encontrado."}</p>;
  }

  const handleNavigateToEdit = () => {
    navigate(`/colaboradores/${id}/editar`);
  };

  return (
    
        <div className="body flex-grow-1">
          <div className="p-4 space-y-4">
            <CCard>
              <CCardBody>
                <CCardTitle className="text-xl mb-3">
                  {colaborador.nomeCompleto}
                </CCardTitle>
                <p>
                  <strong>CPF:</strong> {colaborador.cpf}
                </p>
                <p>
                  <strong>Email:</strong> {colaborador.email}
                </p>
                <p>
                  <strong>Telefone:</strong> {colaborador.telefone}
                </p>
                <p>
                  <strong>Cargo:</strong> {colaborador.cargo}
                </p>
                <p>
                  <strong>Status:</strong> {colaborador.status}
                </p>
                <CRow className="gap-2">
                  <CCol sm="auto">
                    <CButton color="warning" onClick={handleNavigateToEdit}>
                      Editar
                    </CButton>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </div>
        </div>
  );
}
