// src/pages/ClienteDetalhes.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CCard,
  CCardBody,
  CCardTitle,
  CButton,
  CRow,
  CCol,
  CSpinner,
} from "@coreui/react";
import { AppSidebar, AppHeader, AppFooter } from "../../components";
import { getEmpresaById } from "../../services/empresaService";

export default function ClienteDetalhes() {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function fetchCliente() {
      try {
        const response = await getEmpresaById(id);
        setCliente(response.data);
      } catch (error) {
        console.error("Erro ao buscar cliente:", error);
        setErro("Cliente não encontrado ou erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    }

    fetchCliente();
  }, [id]);

  if (loading) {
    return (
      <div className="p-4">
        <CSpinner color="primary" />
        <span className="ms-2">Carregando cliente...</span>
      </div>
    );
  }

  if (erro || !cliente) {
    return <p className="p-4">{erro || "Cliente não encontrado."}</p>;
  }

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <div className="p-4 space-y-4">
            <CCard>
              <CCardBody>
                <CCardTitle className="text-xl mb-3">
                  {cliente.nomeFantasia}
                </CCardTitle>
                <p>
                  <strong>Razão Social:</strong> {cliente.razaoSocial}
                </p>
                <p>
                  <strong>Responsável:</strong> {cliente.nomeResponsavel}
                </p>
                <p>
                  <strong>Email:</strong> {cliente.emailResponsavel}
                </p>
                <p>
                  <strong>Telefone:</strong> {cliente.telefoneResponsavel}
                </p>
                <p>
                  <strong>CNPJ:</strong> {cliente.cnpj}
                </p>
                <CRow className="gap-2">
                  <CCol sm="auto">
                    <CButton color="warning">Editar</CButton>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </div>
        </div>
        <AppFooter />
      </div>
    </div>
  );
}
