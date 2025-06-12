import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  buscarContratoPorId,
  editarContrato,
} from "../services/contratoService";

import { getColaboradores } from "../services/colaboradorService";

// Importando componentes do CoreUI
import {
  CForm,
  CFormInput,
  CFormTextarea,
  CButton,
  CFormSelect,
  CCol,
  CFormLabel,
  CCard,
  CCardBody,
  CCardTitle,
  CSpinner,
  CAlert,
} from '@coreui/react';

export default function EditarContrato() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nomeFantasia: '',
    cnpj: '',
    valor: '',
    dataInicio: '',
    dataFim: '',
    statusContrato: '',
    descricao: '',
    tipo: '',
    nomeResponsavel: '', // Este armazenará o nome completo do colaborador
  });
  const [colaboradores, setColaboradores] = useState([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contratoResponse = await buscarContratoPorId(id);
        const contratoData = contratoResponse.data;

        const colaboradoresResponse = await getColaboradores();
        // Assume que colaboradoresResponse.data é um array de objetos colaborador
        // E que cada objeto colaborador tem uma propriedade 'nomeCompleto' (ou similar)
        const colaboradoresAtivos = colaboradoresResponse.data.filter(
          (colaborador) => colaborador.status == 'ATIVO'
        );
        setColaboradores(colaboradoresAtivos);

        setFormData({
          nomeFantasia: contratoData.nomeFantasia || '',
          cnpj: contratoData.cnpj || '',
          valor: contratoData.valor || '',
          dataInicio: contratoData.dataInicio || '',
          dataFim: contratoData.dataFim || '',
          statusContrato: contratoData.statusContrato || '',
          descricao: contratoData.descricao || '',
          tipo: contratoData.tipo || '',
          // Definir o nomeResponsavel do formData com o valor exato que vem do contrato original
          nomeResponsavel: contratoData.nomeResponsavel || '',
        });

      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Não foi possível carregar os dados do contrato ou dos colaboradores.');
      'Erro ao buscar dados: Não foi possível carregar os dados do contrato ou dos colaboradores.'
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setShowSuccessAlert(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setShowSuccessAlert(false);
    setError(null);

    const contratoParaAtualizar = {
      descricao: formData.descricao,
      tipo: formData.tipo,
      status: formData.statusContrato,
      // Envia o nome completo do responsável, conforme selecionado no dropdown
      nomeResponsavel: formData.nomeResponsavel, 
    };

    try {
      await editarContrato(id, contratoParaAtualizar);
      setShowSuccessAlert(true);

      setTimeout(() => {
        setShowSuccessAlert(false);
        navigate("/contrato");
      }, 1000);
    } catch (error) {
      console.error("Erro ao atualizar contrato:", error);
      const errorMessage = error.response?.data?.message || "Erro ao atualizar contrato. Verifique os campos.";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/contrato");
  };

  if (loading) {
    return (
      <CCard
        className="p-4 d-flex justify-content-center align-items-center"
        style={{ minHeight: '200px' }}
      >
        <CSpinner color="primary" />
      </CCard>
    );
  }

  return (
    <CCard className="p-4">
      <CCardBody>
        <CCardTitle className="h4 mb-3">Editar Contrato</CCardTitle>

        {showSuccessAlert && (
          <CAlert color="success" dismissible className="mb-3">
            Contrato atualizado com sucesso!
          </CAlert>
        )}
        {error && (
          <CAlert color="danger" dismissible className="mb-3">
            {error}
          </CAlert>
        )}

        <CForm onSubmit={handleSubmit} className="row g-3">
          {/* Campos que não são editáveis e são exibidos como 'disabled' */}
          <CCol md={6}>
            <CFormLabel htmlFor="nomeFantasia">Nome Fantasia</CFormLabel>
            <CFormInput
              id="nomeFantasia"
              name="nomeFantasia"
              value={formData.nomeFantasia}
              onChange={handleChange}
              disabled
            />
          </CCol>

          <CCol md={6}>
            <CFormLabel htmlFor="cnpj">CNPJ</CFormLabel>
            <CFormInput
              id="cnpj"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              disabled
            />
          </CCol>

          <CCol md={4}>
            <CFormLabel htmlFor="statusContrato">Status do Contrato (*)</CFormLabel>
            <CFormSelect
              id="statusContrato"
              name="statusContrato"
              value={formData.statusContrato}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              <option value="PENDENTE">Pendente</option>
              <option value="ATIVO">Ativo</option>
              <option value="CANCELADO">Cancelado</option>
              <option value="ARQUIVADO">Arquivado</option>
            </CFormSelect>
          </CCol>

          <CCol md={4}>
            <CFormLabel htmlFor="valor">Valor</CFormLabel>
            <CFormInput
              id="valor"
              name="valor"
              value={`R$ ${Number(formData.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              onChange={handleChange}
              disabled
            />
          </CCol>

          <CCol md={4}>
            <CFormLabel htmlFor="tipo">Tipo (*)</CFormLabel>
            <CFormSelect
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              <option value="POSTO_DE_SERVICO">POSTO DE SERVIÇO</option>
              <option value="SERVICO">SERVIÇO</option>
              <option value="COMUNICACAO">COMUNICAÇÃO</option>
              <option value="INFRAESTRUTURA">INFRAESTRUTURA</option>
              <option value="DESENVOLVIMENTO">DESENVOLVIMENTO</option>
            </CFormSelect>
          </CCol>

          <CCol md={6}>
            <CFormLabel htmlFor="dataInicio">Data Início</CFormLabel>
            <CFormInput
              id="dataInicio"
              name="dataInicio"
              type="date"
              value={formData.dataInicio}
              onChange={handleChange}
              disabled
            />
          </CCol>

          <CCol md={6}>
            <CFormLabel htmlFor="dataFim">Data Fim</CFormLabel>
            <CFormInput
              id="dataFim"
              name="dataFim"
              type="date"
              value={formData.dataFim}
              onChange={handleChange}
              disabled
            />
          </CCol>

          <CCol xs={12}>
            <CFormTextarea
              id="descricao"
              label="Descrição (*)"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows={4}
              placeholder='Descreva o contrato aqui...'
              required
            />
          </CCol>

          {/* Campo 'nomeResponsavel' agora é um CFormSelect */}
          <CCol md={6}>
            <CFormLabel htmlFor="nomeResponsavel">Nome do Responsável (*)</CFormLabel>
            <CFormSelect
              id="nomeResponsavel"
              name="nomeResponsavel"
              value={formData.nomeResponsavel}
              onChange={handleChange}
              required
            >
              
              {/* Renderiza as opções do dropdown */}
              {colaboradores.map((colaborador) => (
                <option 
                  key={colaborador.id} // Chave única para cada opção
                  value={colaborador.nome + ' ' + colaborador.sobrenome || ''} // Usar 'nomeCompleto' ou a propriedade correta
                >
                  {colaborador.nome + ' ' + colaborador.sobrenome || 'Nome Indisponível'} {/* Exibir 'nomeCompleto' ou a propriedade correta */}
                </option>
              ))}
            </CFormSelect>
          </CCol>

          <CCol xs={12} className="mt-4 text-end">
            <CButton color="secondary" onClick={handleCancel} className="me-2">
              Cancelar
            </CButton>
            <CButton type="submit" color="success" disabled={isSaving} className="text-white">
              {isSaving ? (
                <>
                  <CSpinner component="span" size="sm" aria-hidden="true" className="me-2" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </CButton>
          </CCol>
        </CForm>
      </CCardBody>
    </CCard>
  );
}