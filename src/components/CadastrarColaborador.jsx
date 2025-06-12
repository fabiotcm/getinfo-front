import React, { useState, useEffect } from "react";
import {
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardTitle,
  CFormFeedback,
  CAlert,
  CSpinner
} from "@coreui/react";
import { useNavigate } from 'react-router-dom'
import { createColaborador } from "../services/colaboradorService";
import $ from 'jquery';
import 'jquery-mask-plugin';
import { cpf } from 'cpf-cnpj-validator';

export default function CadastrarColaborador() {
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    cpf: "",
    email: "",
    telefone: "",
    cargo: "",
    status: "ATIVO",
  });
  const navigate = useNavigate();
  const [cpfInvalido, setCpfInvalido] = useState(false);
  const [emailInvalido, setEmailInvalido] = useState(false);
  const [telefoneInvalido, setTelefoneInvalido] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [error, setError] = useState(null);

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const validatePhone = (phone) => {
    const cleanedPhone = phone.replace(/\D/g, '');
    return cleanedPhone.length == 11;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // O valor com a máscara é armazenado diretamente no formData
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Resetar validações ao digitar
    if (name === "cpf") setCpfInvalido(false);
    if (name === "email") setEmailInvalido(false);
    if (name === "telefone") setTelefoneInvalido(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setShowSuccessAlert(false);
    setError(null);

    let isValid = true;
    
    // Pode apagar essa array?
    let errors = [];

    // Limpa o CPF e Telefone para validação e envio
    const cleanedCpf = formData.cpf.replace(/\D/g, '');
    const cleanedTelefone = formData.telefone.replace(/\D/g, '');

    // Validação de CPF
    if (!cpf.isValid(cleanedCpf)) {
      setCpfInvalido(true);
      isValid = false;
      setError("CPF inválido.");
      errors.push("CPF inválido.");
    } else {
      setCpfInvalido(false);
    }

    // Validação de Email
    if (!validateEmail(formData.email)) {
      setEmailInvalido(true);
      isValid = false;
      setError("Email inválido.");
      errors.push("Email inválido.");
    } else {
      setEmailInvalido(false);
    }

    // Validação de Telefone
    if (!validatePhone(cleanedTelefone)) {
      setTelefoneInvalido(true);
      isValid = false;
      setError("Telefone inválido.");
      errors.push("Telefone inválido.");
    } else {
      setTelefoneInvalido(false);
    }
    // Se houver erros, não prossegue com o envio
    if (isValid) {
      try {
        // Cria uma cópia do formData e atualiza cpf e telefone com os valores limpos
        const dataToSubmit = {
          ...formData,
          cpf: cleanedCpf,
        };
        console.log("Dados a serem enviados:", dataToSubmit);
        await createColaborador(dataToSubmit);
        setIsSaving(false);
        setShowSuccessAlert(true);

        setTimeout(() => {
          setShowSuccessAlert(false);
          navigate("/colaboradores");
        }, 2000);
      } catch (error) {
        setShowSuccessAlert(false);
        console.error("Erro ao cadastrar colaborador:", error);
        console.error("Detalhes do backend:", error.response?.data);
        setError("Erro ao cadastrar colaborador. Verifique os dados e tente novamente.");
      }
    }
    else {
      setIsSaving(false);
    }
  };

  // useEffect para aplicar máscaras após a renderização
  useEffect(() => {
    $('.tel').mask('(00) 00000-0000');
    $('.cpf').mask('000.000.000-00');
  }, []); // O array vazio garante que o efeito só rode uma vez


  return (
    <CCard className="p-4">
      <CCardBody>
        <CCardTitle className="h4 mb-3">Cadastro de Colaborador</CCardTitle>
                
        {showSuccessAlert && (
          <CAlert color="success" dismissible className="mb-3">
            Colaborador cadastrado com sucesso!
          </CAlert>
        )}
        {error && (
          <CAlert color="danger" dismissible className="mb-3">
            {error}
          </CAlert>
        )}

        <CForm onSubmit={handleSubmit} className="row g-3 mt-2">
          <CRow className="mt-3">
            <CCol md={6}>
              <CFormLabel htmlFor="nome">Nome (*)</CFormLabel>
              <CFormInput
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Nome do Colaborador"
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel htmlFor="sobrenome">Sobrenome (*)</CFormLabel>
              <CFormInput
                id="sobrenome"
                name="sobrenome"
                value={formData.sobrenome}
                onChange={handleChange}
                placeholder="Sobrenome do Colaborador"
                required
              />
            </CCol>
          </CRow>
          <CRow className="mt-3">
            <CCol md={4}>
              <CFormLabel htmlFor="cpf">CPF (*)</CFormLabel>
              <CFormInput
                id="cpf"
                className="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                required
                placeholder="000.000.000-00"
                invalid={cpfInvalido}
              />
              {cpfInvalido && (
                <CFormFeedback invalid>
                  CPF inválido.
                </CFormFeedback>
              )}
            </CCol>
            <CCol md={4}>
              <CFormLabel htmlFor="email">Email (*)</CFormLabel>
              <CFormInput
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="seu@email.com"
                invalid={emailInvalido}
              />
              {emailInvalido && (
                <CFormFeedback invalid>
                  Email inválido.
                </CFormFeedback>
              )}
            </CCol>
            <CCol md={4}>
              <CFormLabel htmlFor="telefone">Telefone (*)</CFormLabel>
              <CFormInput
                type="tel"
                id="telefone"
                className="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                required
                placeholder="(00) 00000-0000"
                invalid={telefoneInvalido}
              />
              {telefoneInvalido && (
                <CFormFeedback invalid>
                  Telefone inválido.
                </CFormFeedback>
              )}
            </CCol>
          </CRow>
          <CRow className="mt-3">
            <CCol md={6}>
              <CFormLabel htmlFor="cargo">Cargo (*)</CFormLabel>
              <CFormInput
                id="cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                placeholder="Cargo do Colaborador"
                required
              />
            </CCol>
          </CRow>
          <div className="mt-4 d-flex justify-content-end gap-2">
            <CButton type="reset" color="secondary" href="/colaboradores">
              Cancelar
            </CButton>
            <CButton type="submit" color="primary">
              {isSaving ? (
                <>
                  <CSpinner component="span" size="sm" aria-hidden="true" className="me-2" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </CButton>
          </div>
        </CForm>
      </CCardBody>
    </CCard>
  );
}
