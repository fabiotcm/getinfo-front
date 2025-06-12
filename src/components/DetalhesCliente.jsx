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
import { getEmpresaById } from "src/services/empresaService.js";

export default function ClienteDetalhes() {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();

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

  // Função para formatar o CNPJ
  const formatarCnpj = (cnpj) => {
    if (!cnpj) return '';
    const cleaned = cnpj.replace(/\D/g, '');
    return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

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
    navigate(`/clientes/${id}/editar`);
  };

  const handleNavigateToContratos = () => {
    navigate(`/clientes/${id}/contratos`); // Exemplo: navegar para contratos associados
  };

  // Mensagem de carregamento
  if (loading) {
    return (
      <div className="p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <CSpinner color="primary" />
        <span className="ms-2">Carregando detalhes do cliente...</span>
      </div>
    );
  }

  // Mensagem de erro ou cliente não encontrado
  if (erro || !cliente) {
    return (
      <div className="p-4">
        <CCard className="mb-4">
          <CCardBody>
            <CCardTitle className="h4">Erro</CCardTitle>
            <p>{erro || "Cliente não encontrado."}</p>
            <CButton color="secondary" onClick={() => navigate('/clientes')}>
              Voltar para a lista de Clientes
            </CButton>
          </CCardBody>
        </CCard>
      </div>
    );
  }

  return (
    <div className="body flex-grow-1">
        <div className="p-4">
        {/* Card Principal: Informações Gerais da Empresa */}
        <CCard className="mb-4">
            <CCardBody>
            <CCardTitle className="h4">{cliente.nomeFantasia}</CCardTitle>
            <CRow>
                <CCol md={6}>
                <p><strong>Razão Social:</strong> {cliente.razaoSocial}</p>
                <p><strong>CNPJ:</strong> {formatarCnpj(cliente.cnpj)}</p>
                <p><strong>Tipo:</strong> {cliente.tipo}</p>
                <p><strong>Status:</strong> {cliente.ativo ? 'Ativo' : 'Inativo'}</p>
                </CCol>
                <CCol md={6}>
                <p><strong>Email da Empresa:</strong> {cliente.email}</p>
                <p><strong>Telefone da Empresa:</strong> {formatarTelefone(cliente.telefone)}</p>
                </CCol>
            </CRow>
            </CCardBody>
        </CCard>

        <CRow>
            {/* Card de Endereço */}
            <CCol md={6}>
            <CCard className="mb-4">
                <CCardBody>
                <CCardTitle className="h5">Endereço</CCardTitle>
                <CListGroup flush>
                    <CListGroupItem><strong>CEP:</strong> {cliente.cep}</CListGroupItem>
                    <CListGroupItem><strong>Logradouro:</strong> {cliente.logradouro}</CListGroupItem>
                    <CListGroupItem><strong>Número:</strong> {cliente.numero}</CListGroupItem>
                    <CListGroupItem><strong>Bairro:</strong> {cliente.bairro}</CListGroupItem>
                    <CListGroupItem><strong>Cidade:</strong> {cliente.cidade}</CListGroupItem>
                    <CListGroupItem><strong>Estado:</strong> {cliente.estado}</CListGroupItem>
                    {cliente.complemento && <CListGroupItem><strong>Complemento:</strong> {cliente.complemento}</CListGroupItem>}
                </CListGroup>
                </CCardBody>
            </CCard>
            </CCol>

            {/* Card do Responsável */}
            <CCol md={6}>
            <CCard className="mb-4">
                <CCardBody>
                <CCardTitle className="h5">Responsável</CCardTitle>
                <CListGroup flush>
                    <CListGroupItem><strong>Nome:</strong> {cliente.nomeResponsavel}</CListGroupItem>
                    <CListGroupItem><strong>CPF:</strong> {formatarCpf(cliente.cpfResponsavel)}</CListGroupItem>
                    <CListGroupItem><strong>Email:</strong> {cliente.emailResponsavel}</CListGroupItem>
                    <CListGroupItem><strong>Telefone:</strong> {formatarTelefone(cliente.telefoneResponsavel)}</CListGroupItem>
                </CListGroup>
                </CCardBody>
            </CCard>
            </CCol>
        </CRow>

        {/* Botões de Ação */}
        <div className="d-flex gap-2 mt-3">
            <CButton color="primary" onClick={handleNavigateToEdit}>
            Editar Empresa
            </CButton>
            {/* Exemplo de outro botão, se aplicável, como em ContratoDetalhes */}
            <CButton onClick={handleNavigateToContratos} color="success" className="text-white"> 
            Ver Contratos
            </CButton>
        </div>
        </div>
    </div>
  );
}