import React, { useState, useEffect } from 'react' // Importe useEffect
import {
  CForm,
  CFormInput,
  CFormSelect,
  CButton,
  CCol,
  CRow,
  CFormLabel,
  CFormFeedback,
  CCard,
  CCardBody,
  CCardTitle,
  CAlert,
  CSpinner
} from "@coreui/react";
import { useNavigate } from 'react-router-dom'
import { createEmpresa, getEmpresas } from "../services/empresaService";
import $ from 'jquery';
import 'jquery-mask-plugin';
import { cpf, cnpj } from 'cpf-cnpj-validator'; // Importa as funções de validação

export default function CadastrarEmpresa() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const [cnpjInvalido, setCnpjInvalido] = useState(false);
  const [cpfResponsavelInvalido, setCpfResponsavelInvalido] = useState(false);
  const [emailInvalido, setEmailInvalido] = useState(false);
  const [telefoneInvalido, setTelefoneInvalido] = useState(false);
  const [emailResponsavelInvalido, setEmailResponsavelInvalido] = useState(false);
  const [telefoneResponsavelInvalido, setTelefoneResponsavelInvalido] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    cnpj: "",
    razaoSocial: "",
    nomeFantasia: "",
    tipo: "",
    cep: "",
    logradouro: "",
    bairro: "",
    numero: "",
    cidade: "",
    estado: "",
    complemento: "",
    email: "",
    telefone: "",
    nomeResponsavel: "",
    emailResponsavel: "",
    telefoneResponsavel: "",
    cpfResponsavel: "",
  });

  const [cidades, setCidades] = useState([]);

  const requiredFieldsPerStep = [
    ["cnpj", "razaoSocial", "nomeFantasia", "tipo"],
    ["cep", "logradouro", "bairro", "numero", "cidade", "estado"],
    ["email", "telefone"],
    ["nomeResponsavel", "emailResponsavel", "telefoneResponsavel", "cpfResponsavel"],
  ];

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Resetar validações ao digitar
    if (name === "cnpj") setCnpjInvalido(false);
    if (name === "cpfResponsavel") setCpfResponsavelInvalido(false);
    if (name === "email") setEmailInvalido(false);
    if (name === "telefone") setTelefoneInvalido(false);
    if (name === "emailResponsavel") setEmailResponsavelInvalido(false);
    if (name === "telefoneResponsavel") setTelefoneResponsavelInvalido(false);
    setShowSuccessAlert(false);
    setError(null);
  }

  const isStepValid = () => {
    const requiredFields = requiredFieldsPerStep[step];
    return requiredFields.every((field) => formData[field] && formData[field].trim() !== "");
  };

  // Função de validação de e-mail
  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // Função de validação de telefone (considerando o formato (XX) XXXXX-XXXX)
  const validatePhone = (phone) => {
    const cleanedPhone = phone.replace(/\D/g, ''); // Remove caracteres não numéricos
    return cleanedPhone.length === 10 || cleanedPhone.length === 11; // 10 ou 11 dígitos para telefone/celular
  };

  const handleNext = async () => {
    if (!isStepValid()) {
      setError('Preencha todos os campos obrigatórios desta etapa.');
      const requiredFields = requiredFieldsPerStep[step];
      requiredFields.map((field) => {
        if (!formData[field]) {
          document.getElementsByName(field)[0].style.borderColor = "red"; // Destaca o campo não preenchido
          setTimeout(function () {
            document.getElementsByName(field)[0].style.borderColor = ""; // Remove o destaque após 3 segundos
          }, 3000);
        }
      });
      return
    }

    // Validação de CNPJ e CPF
    if (step === 0) {
      const cnpjValue = formData.cnpj.replace(/\D/g, ''); // Remove caracteres não numéricos
      if (!cnpj.isValid(cnpjValue)) {
        setCnpjInvalido(true);
        setError("CNPJ inválido.");
        return;
      } else {
        setCnpjInvalido(false);
      }

      try {
        const existe = await getEmpresas();
        const cnpjExistente = existe.data.some((empresa) => empresa.cnpj === cnpjValue);
        if (cnpjExistente) {
          setCnpjInvalido(true);
          setError("CNPJ já cadastrado.");
          return;
        } else {
          setCnpjInvalido(false);
        }
      } catch (error) {
        console.error("Erro ao verificar CNPJ:", error);
        setError("Erro ao verificar se o CNPJ já está cadastrado.");
        return;
      }
    }

    // Validação de e-mail e telefone da empresa
    if (step === 2) {
      if (!validateEmail(formData.email)) {
        setEmailInvalido(true);
        setError("Email inválido.");
        return;
      } else {
        setEmailInvalido(false);
      }
      if (!validatePhone(formData.telefone)) {
        setTelefoneInvalido(true);
        setError("Telefone inválido.");
        return;
      } else {
        setTelefoneInvalido(false);
      }
    }

    // Validação de CPF e e-mail/telefone do responsável
    if (step === 3) {
      const cpfResponsavelValue = formData.cpfResponsavel.replace(/\D/g, ''); // Remove caracteres não numéricos
      if (!cpf.isValid(cpfResponsavelValue)) {
        setCpfResponsavelInvalido(true);
        setError("CPF do responsável inválido.");
        return;
      } else {
        setCpfResponsavelInvalido(false);
      }
      if (!validateEmail(formData.emailResponsavel)) {
        setEmailResponsavelInvalido(true);
        setError("Email do responsável inválido.");
        return;
      } else {
        setEmailResponsavelInvalido(false);
      }
      if (!validatePhone(formData.telefoneResponsavel)) {
        setTelefoneResponsavelInvalido(true);
        setError("Telefone do responsável inválido.");
        return;
      } else {
        setTelefoneResponsavelInvalido(false);
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleFinish = async () => {
    setShowSuccessAlert(false);
    setError(null);
    if (!isStepValid()) {
      setError("Preencha todos os campos desta etapa.");
      return;
    }

    // Validação de CPF final antes de enviar
    const cpfValue = formData.cpfResponsavel.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (!cpf.isValid(cpfValue)) {
      setCpfResponsavelInvalido(true);
      setError("CPF do responsável inválido.");
      return;
    }
    // Validação de e-mail e telefone do responsável antes de enviar
    if (!validateEmail(formData.emailResponsavel)) {
      setEmailResponsavelInvalido(true);
      setError("Email do responsável inválido.");
      return;
    }
    if (!validatePhone(formData.telefoneResponsavel)) {
      setTelefoneResponsavelInvalido(true);
      setError("Telefone do responsável inválido.");
      return;
    }
    setIsSaving(true);

    try {
      await createEmpresa(formData);
      setShowSuccessAlert(true);
      setIsSaving(false);

      setTimeout(() => {
        setShowSuccessAlert(false);
        navigate("/clientes");
      }, 2000);
    } catch (error) {
      console.error("Erro ao cadastrar cliente", error);
      console.error("Detalhes do backend:", error.response?.data);
      setError("Ocorreu um erro ao cadastrar a empresa. Verifique o console para mais detalhes.");
    }
  };

  // useEffect para aplicar máscaras e lógica do CEP após a renderização
  useEffect(() => {
    // Máscaras (aplicadas no carregamento do componente)
    $('.cnpj').mask('00.000.000/0000-00');
    $('.cep').mask('00000-000');
    $('.email').unmask(); // Descomente se o email tiver máscara que precisa ser removida
    $('.tel').mask('(00) 00000-0000');
    $('.cpfResponsavel').mask('000.000.000-00');

    // Removendo a função buscarCep que estava global dentro do useEffect e duplicada
    // A lógica de busca de CEP será chamada diretamente no onClick do botão "Buscar"
  }, [formData.cep, step]); // Dependência adicionada para re-aplicar máscaras e lógica se o CEP mudar ou o passo mudar

  useEffect(() => {
    const carregarCidades = async () => {
      if (formData.estado) {
        try {
          const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.estado}/municipios`);
          const data = await response.json();
          const nomesCidades = data.map(cidade => cidade.nome);
          setCidades(nomesCidades);
        } catch (error) {
          console.error("Erro ao carregar cidades:", error);
          setCidades([]);
        }
      } else {
        setCidades([]);
      }
    };

    carregarCidades();
  }, [formData.estado]);

  const steps = [
    {
      title: 'Informações Básicas',
      content: (
        <>
          <CCol md={4}>
            <CFormLabel>CNPJ (*)</CFormLabel>
            <CFormInput
              name="cnpj"
              className="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              required
              placeholder="00.000.000/0000-00"
              invalid={cnpjInvalido}
            />
            {cnpjInvalido && (
              <CFormFeedback invalid>
                CNPJ inválido ou já cadastrado.
              </CFormFeedback>
            )}
          </CCol>
          <CCol md={4}>
            <CFormLabel>Razão Social (*)</CFormLabel>
            <CFormInput
              name="razaoSocial"
              value={formData.razaoSocial}
              onChange={handleChange}
              placeholder='Razão Social da Empresa'
              required
            />
          </CCol>
          <CCol md={4}>
            <CFormLabel>Nome Fantasia (*)</CFormLabel>
            <CFormInput name="nomeFantasia"
              value={formData.nomeFantasia}
              onChange={handleChange}
              placeholder='Nome Fantasia da Empresa'
              required
            />
          </CCol>
          <CCol md={4}>
            <CFormLabel>Tipo de Empresa (*)</CFormLabel>
            <CFormSelect name="tipo"
              value={formData.tipo}
              onChange={handleChange}
            >
              <option value="">Selecione...</option>
              <option value="PUBLICA">Pública</option>
              <option value="PRIVADA">Privada</option>
            </CFormSelect>
          </CCol>
        </>
      ),
    },
    {
      title: "Endereço",
      content: (
        <>
          <CCol md={4}>
            <CFormLabel>CEP (*)</CFormLabel>
            <div className="d-flex align-items-center"> {/* Container flex para input e botão */}
              <CFormInput
                id='cep'
                name="cep"
                className='cep me-2' // Margem à direita para espaçar do botão
                value={formData.cep}
                onChange={handleChange}
                placeholder='00000-000'
                required
              />
              <CButton
                id='buscar'
                color="primary"
                onClick={async () => {
                  const cepValue = formData.cep.replace(/\D/g, '');
                  if (cepValue !== "" && /^[0-9]{8}$/.test(cepValue)) {
                    setFormData(prev => ({
                      ...prev,
                      logradouro: "...",
                      bairro: "...",
                      cidade: "...",
                      complemento: "...",
                      estado: "...",
                    }));
                    try {
                      const response = await $.getJSON(`https://viacep.com.br/ws/${cepValue}/json/?callback=?`);
                      if (!("erro" in response)) {
                        setFormData(prev => ({
                          ...prev,
                          logradouro: response.logradouro,
                          bairro: response.bairro,
                          cidade: response.localidade,
                          complemento: response.complemento,
                          estado: response.uf,
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          cep: "", // Limpa o CEP no estado
                          logradouro: "",
                          bairro: "",
                          cidade: "",
                          complemento: "",
                          estado: "",
                        }));
                        setError("CEP não encontrado.");
                      }
                    } catch (error) {
                      console.error("Erro ao buscar CEP:", error);
                      setFormData(prev => ({
                        ...prev,
                        cep: "", // Limpa o CEP no estado
                        logradouro: "",
                        bairro: "",
                        cidade: "",
                        complemento: "",
                        estado: "",
                      }));
                      setError("Erro ao buscar CEP. Tente novamente.");
                    }
                  } else if (cepValue !== "") {
                    setFormData(prev => ({
                      ...prev,
                      cep: "", // Limpa o CEP no estado
                      logradouro: "",
                      bairro: "",
                      cidade: "",
                      complemento: "",
                      estado: "",
                    }));
                    setError("Formato de CEP inválido.");
                  }
                }}
              >
                Buscar
              </CButton>
            </div>
          </CCol>
          <CCol md={4}>
            <CFormLabel>Logradouro (*)</CFormLabel>
            <CFormInput
              id='rua'
              name="logradouro"
              value={formData.logradouro}
              onChange={handleChange}
              placeholder='Rua, Avenida, etc.'
              required
            />
          </CCol>
          <CCol md={4}>
            <CFormLabel>Bairro (*)</CFormLabel>
            <CFormInput
              id='bairro'
              name="bairro"
              value={formData.bairro}
              onChange={handleChange}
              placeholder='Bairro'
              required
            />
          </CCol>
          <CCol md={2}>
            <CFormLabel>Número (*)</CFormLabel>
            <CFormInput
              id='numero'
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              placeholder='Número'
              required
            />
          </CCol>
          <CCol md={3}>
            <CFormLabel>Estado (*)</CFormLabel>
            <CFormSelect
              id='uf'
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              {["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"].map(uf => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol md={3}>
            <CFormLabel>Cidade (*)</CFormLabel>
            <CFormSelect
              id='cidade'
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              {cidades.map((cidade, index) => (
                <option key={index} value={cidade}>{cidade}</option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol md={3}>
            <CFormLabel>Complemento</CFormLabel>
            <CFormInput
              id='complemento'
              name="complemento"
              value={formData.complemento}
              onChange={handleChange}
              placeholder='Apto, Bloco, etc.'
            />
          </CCol>
        </>
      ),
    },
    {
      title: "Contato da Empresa",
      content: (
        <>
          <CCol md={6}>
            <CFormLabel>Email (*)</CFormLabel>
            <CFormInput
              type="email"
              className="email"
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
          <CCol md={6}>
            <CFormLabel>Telefone (*)</CFormLabel>
            <CFormInput
              type="tel"
              className="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              required
              placeholder='(00) 00000-0000'
              invalid={telefoneInvalido}
            />
            {telefoneInvalido && (
              <CFormFeedback invalid>
                Telefone inválido.
              </CFormFeedback>
            )}
          </CCol>
        </>
      ),
    },
    {
      title: "Responsável da Empresa",
      content: (
        <>
          <CCol md={6}>
            <CFormLabel>Nome (*)</CFormLabel>
            <CFormInput
              name="nomeResponsavel"
              value={formData.nomeResponsavel}
              onChange={handleChange}
              placeholder='Nome do Responsável'
              required />
          </CCol>
          <CCol md={6}>
            <CFormLabel>Email (*)</CFormLabel>
            <CFormInput
              type="email"
              className='email'
              name="emailResponsavel"
              value={formData.emailResponsavel}
              onChange={handleChange}
              required
              placeholder="seu@email.com"
              invalid={emailResponsavelInvalido}
            />
            {emailResponsavelInvalido && (
              <CFormFeedback invalid>
                Email do responsável inválido.
              </CFormFeedback>
            )}
          </CCol>
          <CCol md={6}>
            <CFormLabel>Telefone (*)</CFormLabel>
            <CFormInput
              type="tel"
              className='tel'
              name="telefoneResponsavel"
              value={formData.telefoneResponsavel}
              onChange={handleChange}
              required
              placeholder='(00) 00000-0000'
              invalid={telefoneResponsavelInvalido}
            />
            {telefoneResponsavelInvalido && (
              <CFormFeedback invalid>
                Telefone do responsável inválido.
              </CFormFeedback>
            )}
          </CCol>
          <CCol md={6}>
            <CFormLabel>CPF (*)</CFormLabel>
            <CFormInput
              name="cpfResponsavel"
              className="cpfResponsavel"
              value={formData.cpfResponsavel}
              onChange={handleChange}
              required
              invalid={cpfResponsavelInvalido}
              placeholder="000.000.000-00"
            />
            {cpfResponsavelInvalido && (
              <CFormFeedback invalid>
                CPF inválido.
              </CFormFeedback>
            )}
          </CCol>
        </>
      ),
    },
  ];

  return (
    <CCard className="p-4">
      <CCardBody>
        <CCardTitle className="h4 mb-3">Cadastro de Empresa</CCardTitle>
        
        {showSuccessAlert && (
          <CAlert color="success" dismissible className="mb-3">
            Empresa cadastrada com sucesso!
          </CAlert>
        )}
        {error && (
          <CAlert color="danger" dismissible className="mb-3">
            {error}
          </CAlert>
        )}
        
        {/* Indicadores de Passo */}
        <div className="d-flex justify-content-between mb-4 position-relative">
          {steps.map((s, index) => (
            <div key={index} className="text-center flex-fill px-2 position-relative" style={{ zIndex: 1 }}>
              <div
                className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center ${
                  index === step
                    ? "bg-primary text-white"
                    : index < step
                      ? "bg-success text-white"
                      : "bg-light text-muted"
                  }`}
                style={{ width: "40px", height: "40px", border: "2px solid #ccc" }}
              >
                {index + 1}
              </div>
              <small
                className={`d-block ${
                  index === step
                    ? "fw-bold text-primary"
                    : index < step
                      ? "text-success"
                      : "text-muted"
                  }`}
              >
                {s.title}
              </small>
            </div>
          ))}
        </div>
        {/* Conteúdo do Passo Atual */}
        <h5>{steps[step].title}</h5>
        <CForm className="row g-3 mt-2">{steps[step].content}</CForm>
        {/* Botões de Navegação */}
        <div className="mt-4 d-flex justify-content-between">
          <div className="d-flex gap-2"> {/* Flex para alinhar os botões à esquerda */}
            {step > 0 && (
              <CButton color="secondary" onClick={handleBack}>
                Voltar
              </CButton>
            )}
          </div>
          <div className="d-flex gap-2 end-0"> {/* Flex para alinhar os botões à direita */}
            {step >= 0 && (
              <CButton color='secondary' href='/clientes'>
                Cancelar
              </CButton>
            )}
            {step < steps.length - 1 && (
              <CButton color="primary" onClick={handleNext} className={step === 0 ? 'ms-auto' : ''}> {/* Adiciona ms-auto no primeiro passo se não houver botão "Voltar" */}
                Próximo
              </CButton>
            )}
            {step === steps.length - 1 && (
              <CButton style={{ color: '#FFFFFF' }} color="success" onClick={handleFinish} className={step === 0 ? 'ms-auto' : ''}> {/* Adiciona ms-auto se for o único botão */}
                {isSaving ? (
                  <>
                    <CSpinner component="span" size="sm" aria-hidden="true" className="me-2" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </CButton>
            )}
          </div>
        </div>
      </CCardBody>
    </CCard>
  );
}