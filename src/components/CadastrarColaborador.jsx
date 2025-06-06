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
  CCardText,
  CFormFeedback,
} from "@coreui/react";
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
    status: "ATIVO", // Status definido como ATIVO por padrão
  });

  const [cpfInvalido, setCpfInvalido] = useState(false);
  const [emailInvalido, setEmailInvalido] = useState(false);
  const [telefoneInvalido, setTelefoneInvalido] = useState(false);
  const [finish, setFinish] = useState(false);


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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = true;
    let errors = [];

    // Limpa o CPF e Telefone para validação e envio
    const cleanedCpf = formData.cpf.replace(/\D/g, '');
    const cleanedTelefone = formData.telefone.replace(/\D/g, '');

    // Validação de CPF
    if (!cpf.isValid(cleanedCpf)) {
      setCpfInvalido(true);
      isValid = false;
      errors.push("CPF inválido.");
    } else {
      setCpfInvalido(false);
    }

    // Validação de Email
    if (!validateEmail(formData.email)) {
      setEmailInvalido(true);
      isValid = false;
      errors.push("Email inválido.");
    } else {
      setEmailInvalido(false);
    }

    // Validação de Telefone
    if (!validatePhone(cleanedTelefone)) {
      setTelefoneInvalido(true);
      isValid = false;
      errors.push("Telefone inválido.");
    } else {
      setTelefoneInvalido(false);
    }

    try {
      // Cria uma cópia do formData e atualiza cpf e telefone com os valores limpos
      const dataToSubmit = {
        ...formData,
        cpf: cleanedCpf,
      };
      console.log("Dados a serem enviados:", dataToSubmit);
      await createColaborador(dataToSubmit);
      alert("Colaborador cadastrado com sucesso!");
      setFinish(true);
    } catch (error) {
      console.error("Erro ao cadastrar colaborador:", error);
      console.error("Detalhes do backend:", error.response?.data);
      
    }
  };

  const handleReset = () => {
    setFormData({
      nome: "",
      sobrenome: "",
      cpf: "",
      email: "",
      telefone: "",
      cargo: "",
      status: "ATIVO",
    });
    setFinish(false);
    setCpfInvalido(false);
    setEmailInvalido(false);
    setTelefoneInvalido(false);
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
        {!finish ? (
          <CForm onSubmit={handleSubmit} className="row g-3 mt-2">
            <CRow>
              <CCol md={6}>
                <CFormLabel htmlFor="nome">Nome</CFormLabel>
                <CFormInput
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="sobrenome">Sobrenome</CFormLabel>
                <CFormInput
                  id="sobrenome"
                  name="sobrenome"
                  value={formData.sobrenome}
                  onChange={handleChange}
                  required
                />
              </CCol>
            </CRow>

            <CRow>
              <CCol md={4}>
                <CFormLabel htmlFor="cpf">CPF</CFormLabel>
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
                <CFormLabel htmlFor="email">Email</CFormLabel>
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
                <CFormLabel htmlFor="telefone">Telefone</CFormLabel>
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

            <CRow>
              <CCol md={6}>
                <CFormLabel htmlFor="cargo">Cargo</CFormLabel>
                <CFormInput
                  id="cargo"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleChange}
                  required
                />
              </CCol>
            </CRow>

            <div className="mt-4 d-flex justify-content-end gap-2">
              <CButton type="reset" color="secondary" href="/colaboradores">
                Cancelar
              </CButton>
              <CButton type="submit" color="primary">
                Salvar Colaborador
              </CButton>
            </div>
          </CForm>
        ) : (
          <>
            <CCardText className="text-success mt-3">
              Colaborador cadastrado com sucesso!
            </CCardText>
            <CButton color="success" className="mt-3" onClick={handleReset}>
              Cadastrar Novo Colaborador
            </CButton>
          </>
        )}
      </CCardBody>
    </CCard>
  );
}
