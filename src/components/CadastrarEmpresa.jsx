import React, { useState } from 'react'
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
  CCardText,
} from '@coreui/react'
import clientes from '../data/clientes.json'

export default function CadastrarEmpresaManualStepper() {
  const [step, setStep] = useState(0)
  const [finish, setFinish] = useState(false)
  const [cnpjError, setCnpjError] = useState(false)

  const [formData, setFormData] = useState({
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    tipoEmpresa: '',
    cep: '',
    logradouro: '',
    bairro: '',
    numero: '',
    cidade: '',
    complemento: '',
    emailEmpresa: '',
    telefoneEmpresa: '',
    nomeResponsavel: '',
    emailResponsavel: '',
    telefoneResponsavel: '',
    cpfResponsavel: '',
  })

  const requiredFieldsPerStep = [
    ['cnpj', 'razaoSocial', 'nomeFantasia', 'tipoEmpresa'],
    ['cep', 'logradouro', 'bairro', 'numero', 'cidade'],
    ['emailEmpresa', 'telefoneEmpresa'],
    ['nomeResponsavel', 'emailResponsavel', 'telefoneResponsavel', 'cpfResponsavel'],
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const verificarCNPJ = () => {
    const exists = clientes.some((cliente) => cliente.cnpj === formData.cnpj)
    setCnpjError(exists)
    return !exists
  }

  const isStepValid = () => {
    const requiredFields = requiredFieldsPerStep[step]
    return requiredFields.every((field) => formData[field] && formData[field].trim() !== '')
  }

  const handleNext = () => {
    if (step === 0 && !verificarCNPJ()) return
    if (!isStepValid()) {
      alert('Preencha todos os campos obrigatórios desta etapa.')
      return
    }
    setStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setStep((prev) => prev - 1)
  }

  const handleFinish = () => {
    if (!isStepValid()) {
      alert('Preencha todos os campos obrigatórios desta etapa.')
      return
    }
    console.log('Dados cadastrados:', formData)
    alert('Empresa cadastrada com sucesso!')
    setFinish(true)
  }

  const handleReset = () => {
    setFormData({
      cnpj: '',
      razaoSocial: '',
      nomeFantasia: '',
      tipoEmpresa: '',
      cep: '',
      logradouro: '',
      bairro: '',
      numero: '',
      cidade: '',
      complemento: '',
      emailEmpresa: '',
      telefoneEmpresa: '',
      nomeResponsavel: '',
      emailResponsavel: '',
      telefoneResponsavel: '',
      cpfResponsavel: '',
    })
    setCnpjError(false)
    setFinish(false)
    setStep(0)
}

  const steps = [
    {
      title: 'Informações Básicas',
      content: (
        <>
          <CCol md={4}>
            <CFormLabel>CNPJ</CFormLabel>
            <CFormInput
              mask="99.999.999/9999-99"
              id="cnpj"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              className="form-control"
              required
            />
            {cnpjError && (
              <CFormFeedback invalid className="d-block">
                CNPJ já cadastrado
              </CFormFeedback>
            )}
          </CCol>
          <CCol md={4}>
            <CFormLabel>Razão Social</CFormLabel>
            <CFormInput name="razaoSocial" value={formData.razaoSocial} onChange={handleChange} required />
          </CCol>
          <CCol md={4}>
            <CFormLabel>Nome Fantasia</CFormLabel>
            <CFormInput name="nomeFantasia" value={formData.nomeFantasia} onChange={handleChange} required />
          </CCol>
          <CCol md={4}>
            <CFormLabel>Tipo de Empresa</CFormLabel>
            <CFormSelect name="tipoEmpresa" value={formData.tipoEmpresa} onChange={handleChange} required>
              <option value="">Selecione...</option>
              <option value="publica">Pública</option>
              <option value="privada">Privada</option>
            </CFormSelect>
          </CCol>
        </>
      ),
    },
    {
      title: 'Endereço',
      content: (
        <>
          <CCol md={4}>
            <CFormLabel>CEP</CFormLabel>
            <CFormInput name="cep" value={formData.cep} onChange={handleChange} required />
          </CCol>
          <CCol md={4}>
            <CFormLabel>Logradouro</CFormLabel>
            <CFormInput name="logradouro" value={formData.logradouro} onChange={handleChange} required />
          </CCol>
          <CCol md={4}>
            <CFormLabel>Bairro</CFormLabel>
            <CFormInput name="bairro" value={formData.bairro} onChange={handleChange} required />
          </CCol>
          <CCol md={2}>
            <CFormLabel>Número</CFormLabel>
            <CFormInput name="numero" value={formData.numero} onChange={handleChange} required />
          </CCol>
          <CCol md={3}>
            <CFormLabel>Cidade</CFormLabel>
            <CFormInput name="cidade" value={formData.cidade} onChange={handleChange} required />
          </CCol>
          <CCol md={3}>
            <CFormLabel>Complemento</CFormLabel>
            <CFormInput name="complemento" value={formData.complemento} onChange={handleChange} />
          </CCol>
        </>
      ),
    },
    {
      title: 'Contato da Empresa',
      content: (
        <>
          <CCol md={6}>
            <CFormLabel>Email</CFormLabel>
            <CFormInput type="email" name="emailEmpresa" value={formData.emailEmpresa} onChange={handleChange} required />
          </CCol>
          <CCol md={6}>
            <CFormLabel>Telefone</CFormLabel>
            <CFormInput type="tel" name="telefoneEmpresa" value={formData.telefoneEmpresa} onChange={handleChange} required />
          </CCol>
        </>
      ),
    },
    {
      title: 'Responsável',
      content: (
        <>
          <CCol md={6}>
            <CFormLabel>Nome</CFormLabel>
            <CFormInput name="nomeResponsavel" value={formData.nomeResponsavel} onChange={handleChange} required />
          </CCol>
          <CCol md={6}>
            <CFormLabel>Email</CFormLabel>
            <CFormInput type="email" name="emailResponsavel" value={formData.emailResponsavel} onChange={handleChange} required />
          </CCol>
          <CCol md={6}>
            <CFormLabel>Telefone</CFormLabel>
            <CFormInput type="tel" name="telefoneResponsavel" value={formData.telefoneResponsavel} onChange={handleChange} required />
          </CCol>
          <CCol md={6}>
            <CFormLabel>CPF</CFormLabel>
            <CFormInput name="cpfResponsavel" value={formData.cpfResponsavel} onChange={handleChange} required />
          </CCol>
        </>
      ),
    },
  ]

  return (
    <CCard className="p-4">
      <CCardBody>
        <CCardTitle className="h4 mb-3">Cadastro de Empresa</CCardTitle>
        {!finish ? (
          <>
            <div className="d-flex justify-content-between mb-4">
              {steps.map((s, index) => (
                <div
                  key={index}
                  className={`text-center flex-fill px-2 position-relative`}
                  style={{
                    zIndex: 1,
                  }}
                >
                  <div
                    className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center ${
                      index === step
                        ? 'bg-primary text-white'
                        : index < step
                        ? 'bg-success text-white'
                        : 'bg-light text-muted'
                    }`}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '2px solid #ccc',
                    }}
                  >
                    {index + 1}
                  </div>
                  <small
                    className={`d-block ${
                      index === step
                        ? 'fw-bold text-primary'
                        : index < step
                        ? 'text-success'
                        : 'text-muted'
                    }`}
                  >
                    {s.title}
                  </small>

                </div>
              ))}
            </div>

            <h5>{steps[step].title}</h5>
            <CForm className="row g-3 mt-2">{steps[step].content}</CForm>

            <div className="mt-4 d-flex justify-content-between">
              {step > 0 && (
                <CButton color="secondary" onClick={handleBack}>
                  Voltar
                </CButton>
              )}
              {step < steps.length - 1 && (
                <CButton color="primary" onClick={handleNext}>
                  Próximo
                </CButton>
              )}
              {step === steps.length - 1 && (
                <CButton color="success" onClick={handleFinish}>
                  Finalizar
                </CButton>
              )}
            </div>
          </>
        ) : (
          <>
            <CCardText className="text-success mt-3">
              Empresa cadastrada com sucesso!
            </CCardText>
            <CButton color="danger" className="mt-3" onClick={handleReset}>
              Cadastrar Nova Empresa
            </CButton>
          </>
        )}
      </CCardBody>
    </CCard>
  )
}
