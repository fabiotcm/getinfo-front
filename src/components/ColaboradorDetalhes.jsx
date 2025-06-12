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
  CListGroup,      // Adicionado para listas de detalhes
  CListGroupItem,  // Adicionado para itens de lista
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

  // Função para formatar o CPF
  const formatarCpf = (cpf) => {
    if (!cpf) return '';
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  };

  // Função para formatar o Telefone
  const formatarTelefone = (telefone) => {
    if (!telefone) return '';
    const cleaned = telefone.replace(/\D/g, '');
    if (cleaned.length === 11) { // Celular com DDD
      return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (cleaned.length === 10) { // Fixo com DDD
      return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }
    return telefone; // Retorna como está se não corresponder
  };

  const handleNavigateToEdit = () => {
    navigate(`/colaboradores/${id}/editar`);
  };

  // Mensagem de carregamento
  if (loading) {
    return (
      <div className="p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <CSpinner color="primary" />
        <span className="ms-2">Carregando detalhes do colaborador...</span>
      </div>
    );
  }

  // Mensagem de erro ou colaborador não encontrado
  if (erro || !colaborador) {
    return (
      <div className="p-4">
        <CCard className="mb-4">
          <CCardBody>
            <CCardTitle className="h4">Erro</CCardTitle>
            <p>{erro || "Colaborador não encontrado."}</p>
            <CButton color="secondary" onClick={() => navigate('/colaboradores')}>
              Voltar para a lista de Colaboradores
            </CButton>
          </CCardBody>
        </CCard>
      </div>
    );
  }

  // Combinar nome e sobrenome para exibição
  const nomeCompleto = `${colaborador.nome} ${colaborador.sobrenome}`;

  return (
        <div className="body flex-grow-1">
          <div className="p-4">
            {/* Card Principal: Informações Gerais do Colaborador */}
            <CCard className="mb-4">
              <CCardBody>
                <CCardTitle className="h4">{nomeCompleto}</CCardTitle>
                <CRow>
                  <CCol md={6}>
                    <p><strong>CPF:</strong> {formatarCpf(colaborador.cpf)}</p>
                    <p><strong>Status:</strong> {colaborador.status}</p>
                  </CCol>
                  <CCol md={6}>
                    <p><strong>Email:</strong> {colaborador.email}</p>
                    <p><strong>Telefone:</strong> {formatarTelefone(colaborador.telefone)}</p>
                  </CCol>
                </CRow>
                <CRow>
                  <CCol>
                    <p><strong>Cargo:</strong> {colaborador.cargo}</p>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>

            {/* Botões de Ação */}
            <div className="d-flex gap-2 mt-3">
              <CButton color="primary" onClick={handleNavigateToEdit}>
                Editar Colaborador
              </CButton>
              {/* Adicione outros botões de ação se necessário, seguindo o padrão */}
              {/* Exemplo: <CButton color="info" onClick={() => alert('Ver contratos do colaborador')}>Ver Contratos</CButton> */}
            </div>
          </div>
        </div>
      
  );
}