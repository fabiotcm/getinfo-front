import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getColaboradorById,
  patchColaborador,
} from "../services/colaboradorService";
import {
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CFormSelect,
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CAlert,
} from "@coreui/react";

export default function EditarColaborador() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    status: "",
    email: "",
    telefone: "",
    cargo: "",
  });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  useEffect(() => {
    const fetchColaborador = async () => {
      try {
        const response = await getColaboradorById(id);
        const data = response.data;
        setFormData({
          status: data.status || "",
          email: data.email || "",
          telefone: data.telefone || "",
          cargo: data.cargo || "",
        });
      } catch (error) {
        console.error("Erro ao buscar colaborador:", error);
        alert("Não foi possível carregar os dados do colaborador.");
      } finally {
        setLoading(false);
      }
    };
    fetchColaborador();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await patchColaborador(id, formData);
      setShowSuccessAlert(true);

      // Esconde alerta após 3 segundos e redireciona
      setTimeout(() => {
        setShowSuccessAlert(false);
        navigate("/colaboradores");
      }, 3000);
    } catch (error) {
      console.error("Erro ao atualizar colaborador:", error);
      alert("Erro ao atualizar colaborador.");
    }
  };

  if (loading) return <CSpinner color="primary" />;

  return (
    <CCard className="p-4">
      <CCardHeader>
        <h4>Editar Colaborador</h4>
      </CCardHeader>
      <CCardBody>
        {showSuccessAlert && (
          <CAlert color="success" dismissible>
            Colaborador atualizado com sucesso!
          </CAlert>
        )}
        <CForm onSubmit={handleSubmit}>
          <div className="mb-3">
            <CFormLabel>Status</CFormLabel>
            <CFormSelect
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { label: "Selecione...", value: "" },
                { label: "Ativo", value: "ATIVO" },
                { label: "Desligado", value: "DESLIGADO" },
              ]}
              required
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Email</CFormLabel>
            <CFormInput
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Telefone</CFormLabel>
            <CFormInput
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Cargo</CFormLabel>
            <CFormInput
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              required
            />
          </div>
          <div className="text-end">
            <CButton type="submit" color="primary">
              Salvar Alterações
            </CButton>
          </div>
        </CForm>
      </CCardBody>
    </CCard>
  );
}
