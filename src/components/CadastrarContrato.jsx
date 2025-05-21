import React, { useState } from 'react'
import {
  CForm,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CButton,
  CCol,
  CRow,
  CFormLabel,
  CCard,
  CCardBody,
  CCardTitle,
  CCardText,
} from '@coreui/react'
import { Link } from 'react-router-dom'
import $ from 'jquery';
import 'jquery-mask-plugin'

// Simulando CNPJs já cadastrados
const cnpjsCadastrados = ['12345678000190', '98765432000100', '11223344000155']

export default function CadastrarContratoStepper() {
  const [step, setStep] = useState(0)
  const [finish, setFinish] = useState(false)
  const [cnpjInvalido, setCnpjInvalido] = useState(false)

  const [formData, setFormData] = useState({
    cnpj: '',
    tipoContrato: '',
    valorContrato: '',
    funcionarioResponsavel: '',
    prazo: '',
    dataInicio: '',
    dataEntrega: '',
    descricao: '',
    entregaveis: '',
    anexo: null,
  })

  const requiredFieldsPerStep = [
    ['cnpj'],
    ['tipoContrato', 'valorContrato', 'prazo', 'funcionarioResponsavel'],
    ['dataInicio', 'dataEntrega'],
    ['descricao', 'entregaveis'],
  ]

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'anexo') {
      setFormData((prev) => ({ ...prev, [name]: files[0] }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
    if (name === 'cnpj') {
      setCnpjInvalido(false)
    }
  }

  const isStepValid = () => {
    const requiredFields = requiredFieldsPerStep[step]
    return requiredFields.every((field) => formData[field] && formData[field].trim() !== '')
  }

  const handleNext = () => {
    if (!isStepValid()) {
      alert('Preencha todos os campos obrigatórios desta etapa.')
      return
    }

    if (step === 0) {
      const cnpjLimpo = formData.cnpj.replace(/\D/g, '')
      if (!cnpjsCadastrados.includes(cnpjLimpo)) {
        setCnpjInvalido(true)
        return
      }
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
    console.log('Dados do contrato:', formData)
    alert('Contrato cadastrado com sucesso!')
    setFinish(true)
  }

  const handleReset = () => {
    setFormData({
      cnpj: '',
      tipoContrato: '',
      valorContrato: '',
      funcionarioResponsavel: '',
      prazo: '',
      dataInicio: '',
      dataEntrega: '',
      descricao: '',
      entregaveis: '',
      anexo: null,
    })
    setStep(0)
    setFinish(false)
    setCnpjInvalido(false)
  }

  $(document).ready(function () {
    // Máscara para CNPJ
    $('.cnpj').mask('00.000.000/0000-00')
  })

  const steps = [
    {
      title: 'CNPJ',
      content: (
        <CCol md={6}>
          <CFormLabel>CNPJ</CFormLabel>
          <CFormInput
            name="cnpj"
            className="cnpj"
            value={formData.cnpj}
            onChange={handleChange}
            required
            invalid={cnpjInvalido}
            placeholder='00.000.000/0000-00'
          />
          {cnpjInvalido && (
            <div className="text-danger mt-2">
              Este CNPJ não está cadastrado no sistema.
              <div>
                <Link to="/cadastrar-empresa" className="text-decoration-underline">
                  Gostaria de cadastrar essa empresa?
                </Link>
              </div>
            </div>
          )}
        </CCol>
      ),
    },
    {
      title: 'Detalhes do Contrato',
      content: (
        <>
          <CCol md={3}>
            <CFormLabel>Tipo de Contrato</CFormLabel>
            <CFormSelect name="tipoContrato" value={formData.tipoContrato} onChange={handleChange} required>
              <option value="">Selecione</option>
              <option value="servico">Serviço</option>
              <option value="comunicacao">Comunicação</option>
              <option value="infraestrutura">Infraestrutura</option>
              <option value="desenvolvimento">Desenvolvimento</option>
            </CFormSelect>
          </CCol>
          <CCol md={3}>
            <CFormLabel>Valor</CFormLabel>
            <CFormInput
              type="number"
              name="valorContrato"
              value={formData.valorContrato}
              onChange={handleChange}
              required
            />
          </CCol>
          <CCol md={3}>
            <CFormLabel>Prazo</CFormLabel>
            <CFormInput name="prazo" value={formData.prazo} onChange={handleChange} required />
          </CCol>
          <CCol md={3}>
            <CFormLabel>Responsável</CFormLabel>
            <CFormInput
              name="funcionarioResponsavel"
              value={formData.funcionarioResponsavel}
              onChange={handleChange}
              required
            />
          </CCol>
        </>
      ),
    },
    {
      title: 'Datas',
      content: (
        <>
          <CCol md={6}>
            <CFormLabel>Data de Início</CFormLabel>
            <CFormInput
              type="date"
              name="dataInicio"
              value={formData.dataInicio}
              onChange={handleChange}
              required
            />
          </CCol>
          <CCol md={6}>
            <CFormLabel>Data de Entrega</CFormLabel>
            <CFormInput
              type="date"
              name="dataEntrega"
              value={formData.dataEntrega}
              onChange={handleChange}
              required
            />
          </CCol>
        </>
      ),
    },
    {
      title: 'Descrição e Entregáveis',
      content: (
        <>
          <CCol md={12}>
            <CFormLabel>Descrição</CFormLabel>
            <CFormTextarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows={4}
              required
            />
          </CCol>
          <CCol md={12}>
            <CFormLabel>Entregáveis</CFormLabel>
            <CFormTextarea
              name="entregaveis"
              value={formData.entregaveis}
              onChange={handleChange}
              rows={3}
              required
            />
          </CCol>
          <CCol md={12}>
            <CFormLabel>Anexo</CFormLabel>
            <CFormInput
              type="file"
              name="anexo"
              onChange={handleChange}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            />
          </CCol>
        </>
      ),
    },
  ]

  return (
    <CCard className="p-4">
      <CCardBody>
        <CCardTitle className="h4 mb-3">Cadastro de Contrato</CCardTitle>
        {!finish ? (
          <>
            <div className="d-flex justify-content-between mb-4">
              {steps.map((s, index) => (
                <div key={index} className="text-center flex-fill px-2 position-relative" style={{ zIndex: 1 }}>
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
              {step > 0 && <CButton color="secondary" onClick={handleBack}>Voltar</CButton>}
              {step < steps.length - 1 && <CButton color="primary" onClick={handleNext}>Próximo</CButton>}
              {step === steps.length - 1 && <CButton color="success" onClick={handleFinish}>Finalizar</CButton>}
            </div>
          </>
        ) : (
          <>
            <CCardText className="text-success mt-3">Contrato cadastrado com sucesso!</CCardText>
            <CButton color="danger" className="mt-3" onClick={handleReset}>
              Cadastrar Novo Contrato
            </CButton>
          </>
        )}
      </CCardBody>
    </CCard>
  )
}
