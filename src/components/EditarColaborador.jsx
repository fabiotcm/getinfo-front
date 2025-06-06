import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getColaboradorById,
  patchColaborador,
} from "../services/colaboradorService";
import {
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CFormSelect,
  CCard,
  CCardBody,
  CCardTitle,
  CSpinner,
  CAlert,
} from "@coreui/react";

export default function EditarColaborador() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Loading para buscar dados iniciais
  const [isSaving, setIsSaving] = useState(false); // Novo estado para o botão Salvar
  const [formData, setFormData] = useState({
    nome: "",         // Adicionado nome
    sobrenome: "",    // Adicionado sobrenome
    status: "",
    email: "",
    telefone: "",
    cargo: "",
  });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchColaborador = async () => {
      try {
        const response = await getColaboradorById(id);
        const data = response.data;
        setFormData({
          nome: data.nome || "",       // Popula o campo nome
          sobrenome: data.sobrenome || "", // Popula o campo sobrenome
          status: data.status || "",
          email: data.email || "",
          telefone: data.telefone || "",
          cargo: data.cargo || "",
        });
      } catch (error) {
        console.error("Erro ao buscar colaborador:", error);
        setError("Não foi possível carregar os dados do colaborador.");
      } finally {
        setLoading(false);
      }
    };
    fetchColaborador();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpa alerts e erros ao começar a digitar/alterar
    setShowSuccessAlert(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true); // Ativa o estado de salvando
    setShowSuccessAlert(false); // Esconde alert de sucesso anterior
    setError(null); // Limpa erro anterior

    try {
      await patchColaborador(id, formData); // Envia formData com nome e sobrenome
      setShowSuccessAlert(true);

      // Não redireciona imediatamente, espera o alert desaparecer
      setTimeout(() => {
        setShowSuccessAlert(false);
        navigate("/colaboradores");
      }, 1000); // Exibe o alert por 1 segundos
    } catch (error) {
      console.error("Erro ao atualizar colaborador:", error);
      setError("Erro ao atualizar colaborador. Verifique os campos.");
    } finally {
      setIsSaving(false); // Desativa o estado de salvando
    }
  };

  const handleCancel = () => {
    navigate("/colaboradores"); // Redireciona de volta para a lista de colaboradores
  };

  if (loading) {
    return (
      <CCard className="p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <CSpinner color="primary" />
      </CCard>
    );
  }

  return (
    <CCard className="p-4"> {/* O Card principal */}
      <CCardBody>
        <CCardTitle className="h4 mb-3">Editar Colaborador</CCardTitle> {/* Título usando CCardTitle */}

        {/* Alertas de sucesso/erro */}
        {showSuccessAlert && (
          <CAlert color="success" dismissible className="mb-3">
            Colaborador atualizado com sucesso!
          </CAlert>
        )}
        {error && (
          <CAlert color="danger" dismissible className="mb-3">
            {error}
          </CAlert>
        )}

        <CForm onSubmit={handleSubmit} className="row g-3"> {/* row g-3 para espaçamento Bootstrap */}
          {/* Nome */}
          <CCol md={6}>
            <CFormLabel htmlFor="nome">Nome (*)</CFormLabel>
            <CFormInput
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </CCol>

          {/* Sobrenome */}
          <CCol md={6}>
            <CFormLabel htmlFor="sobrenome">Sobrenome (*)</CFormLabel>
            <CFormInput
              id="sobrenome"
              name="sobrenome"
              value={formData.sobrenome}
              onChange={handleChange}
              required
            />
          </CCol>

          {/* Email */}
          <CCol md={6}>
            <CFormLabel htmlFor="email">Email (*)</CFormLabel>
            <CFormInput
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </CCol>

          {/* Telefone */}
          <CCol md={6}>
            <CFormLabel htmlFor="telefone">Telefone (*)</CFormLabel>
            <CFormInput
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              required
            />
          </CCol>

          {/* Cargo */}
          <CCol md={6}>
            <CFormLabel htmlFor="cargo">Cargo (*)</CFormLabel>
            <CFormInput
              id="cargo"
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              required
            />
          </CCol>

          {/* Status */}
          <CCol md={6}>
            <CFormLabel htmlFor="status">Status (*)</CFormLabel>
            <CFormSelect
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { label: "Selecione...", value: "" },
                { label: "Ativo", value: "ATIVO" },
                { label: "Inativo", value: "INATIVO" },
              ]}
              required
            />
          </CCol>

          {/* Botões de Ação */}
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