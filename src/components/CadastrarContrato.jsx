import React, { useState, useEffect } from 'react' // Importe useEffect
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
import { color } from 'chart.js/helpers';
import { criarContrato, uploadAnexo } from '../services/contratoService' // Importa o serviço de criação de contrato
import { getEmpresas } from '../services/empresaService' // ajuste o caminho conforme necessário
import { getColaboradores } from '../services/colaboradorService' // Importa o serviço de colaboradores
import { criarEntregavel } from '../services/entregavelService' // Importa o serviço de entregáveis

export default function CadastrarContratoStepper() {
  const [step, setStep] = useState(0)
  const [finish, setFinish] = useState(false)
  const [cnpjInvalido, setCnpjInvalido] = useState(false)
  const [dataEntregaInvalida, setDataEntregaInvalida] = useState(false); // Novo estado para validação de data
  const [cnpjsValidos, setCnpjsValidos] = useState([])
  const [colaboradores, setColaboradores] = useState([])

const carregarColaboradores = async () => {
  try {
    const response = await getColaboradores()
    // Supondo que você quer apenas os ativos (verifique se sua API já filtra ou use um filtro aqui)
    const ativos = response.data.filter(colab => colab.status !== 'INATIVO')
    setColaboradores(ativos)
  } catch (error) {
    console.error('Erro ao carregar colaboradores:', error)
  }
}



  const [formData, setFormData] = useState({
    cnpj: '',
    tipoContrato: '',
    valorContrato: '',
    funcionarioResponsavel: '',
    dataInicio: '',
    dataEntrega: '',
    descricao: '',
    entregaveis: [
      { descricao: '', observacao: '', dataFinal: '' },
    ],
    anexo: null,
  })

  const requiredFieldsPerStep = [
    ['cnpj'],
    ['tipoContrato', 'valorContrato', 'funcionarioResponsavel'],
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
    // Limpa estados de validação ao digitar novamente
    if (name === 'cnpj') {
      setCnpjInvalido(false)
    }
    if (name === 'dataInicio' || name === 'dataEntrega') {
      setDataEntregaInvalida(false);
    }
  }

  const handleEntregavelChange = (index, e) => {
  const { name, value } = e.target
  const novosEntregaveis = [...formData.entregaveis]
  novosEntregaveis[index][name] = value
  setFormData(prev => ({ ...prev, entregaveis: novosEntregaveis }))
}

const adicionarEntregavel = () => {
  setFormData(prev => ({
    ...prev,
    entregaveis: [...prev.entregaveis, { descricao: '', observacao: '', dataFinal: '' }],
  }))
}

const removerEntregavel = (index) => {
  if (formData.entregaveis.length === 1) return
  const novosEntregaveis = formData.entregaveis.filter((_, i) => i !== index)
  setFormData(prev => ({ ...prev, entregaveis: novosEntregaveis }))
}


  // UseEffect para aplicar as máscaras jQuery
  useEffect(() => {
    $('.cnpj').mask('00.000.000/0000-00');

    // Carrega os CNPJs válidos da API
  const carregarEmpresas = async () => {
    try {
      const response = await getEmpresas()
      const empresas = response.data
      const cnpjs = empresas.map(emp => emp.cnpj.replace(/\D/g, '')) // remove a máscara, igual ao input limpo
      setCnpjsValidos(cnpjs)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    }
  }

  carregarEmpresas()
  carregarColaboradores()
  }, []); // Array de dependências vazio para rodar apenas uma vez

  


  const isStepValid = () => {
  const requiredFields = requiredFieldsPerStep[step]
  return requiredFields.every((field) => {
    const value = formData[field]
    if (typeof value === 'string') {
      return value.trim() !== ''
    } else if (Array.isArray(value)) {
      // No caso de entregaveis, verifique se todos os entregáveis têm descrição e dataFinal preenchidos
      return value.every((ent) => ent.descricao.trim() !== '' && ent.dataFinal.trim() !== '')
    }
    return !!value // fallback para campos como arquivos (anexo) ou outros tipos
  })
  }


  const handleNext = () => {
    // 1. Validação de campos obrigatórios
    if (!isStepValid()) {
      alert('Preencha todos os campos obrigatórios desta etapa.')
      return
    }

    // 2. Validação específica para o CNPJ (passo 0)
    if (step === 0) {
      const cnpjLimpo = formData.cnpj.replace(/\D/g, '')
      if (!cnpjsValidos.includes(cnpjLimpo)) {
        setCnpjInvalido(true)
        return
      }
    }

    // 3. Validação específica para as datas (passo 2)
    if (step === 2) {
      if (formData.dataInicio && formData.dataEntrega) {
        const dataInicio = new Date(formData.dataInicio);
        const dataEntrega = new Date(formData.dataEntrega);

        // Ajusta para comparar apenas as datas, ignorando a hora, caso contrário pode dar erro devido ao fuso horário
        dataInicio.setHours(0, 0, 0, 0);
        dataEntrega.setHours(0, 0, 0, 0);

        if (dataEntrega < dataInicio) {
          setDataEntregaInvalida(true);
          alert('A Data de Entrega não pode ser anterior à Data de Início.');
          return;
        }
      }
    }

    // Se todas as validações passarem, avança para o próximo passo
    setStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setStep((prev) => prev - 1)
  }

  const handleFinish = async () => {
    if (!isStepValid()) {
      alert('Preencha todos os campos obrigatórios desta etapa.')
      return
    }
    // Repete a validação de data para o caso do usuário ir e voltar no formulário
    if (formData.dataInicio && formData.dataEntrega) {
        const dataInicio = new Date(formData.dataInicio);
        const dataEntrega = new Date(formData.dataEntrega);

        dataInicio.setHours(0, 0, 0, 0);
        dataEntrega.setHours(0, 0, 0, 0);

        if (dataEntrega < dataInicio) {
          setDataEntregaInvalida(true);
          alert('A Data de Entrega não pode ser anterior à Data de Início.');
          return;
        }
    }


    try {
    const contratoDTO = {
      cnpj: formData.cnpj.replace(/\D/g, ''),
      valor: parseFloat(formData.valorContrato),
      descricao: formData.descricao,
      tipo: formData.tipoContrato.toUpperCase(),
      dataInicio: formData.dataInicio,
      dataFim: formData.dataEntrega,
      nomeResponsavel: formData.funcionarioResponsavel,
    }

    // Cria o contrato
    const response = await criarContrato(contratoDTO)
    const contratoId = response.data.id
    console.log('Contrato criado com ID:', contratoId)
    // Se houver anexo, faz o upload
    if (formData.anexo && contratoId) {
      await uploadAnexo(contratoId, formData.anexo)
    }

    if (formData.entregaveis.length > 0 && contratoId) {
      for (const ent of formData.entregaveis) {
        console.log('Criando entregável:', ent)
        // Cria cada entregável associado ao contrato 
        await criarEntregavel({
          contratoId,
          descricao: ent.descricao,
          observacao: ent.observacao,
          dataFinal: ent.dataFinal,
        })
      }
    }

    alert('Contrato cadastrado com sucesso!')
    console.log('Contrato cadastrado:', response.data)
    setFinish(true)
  } catch (error) {
    console.error('Erro ao cadastrar contrato:', error)
    alert('Ocorreu um erro ao cadastrar o contrato.')
    } 
  }

  const handleReset = () => {
    setFormData({
      cnpj: '',
      tipoContrato: '',
      valorContrato: '',
      funcionarioResponsavel: '',
      dataInicio: '',
      dataEntrega: '',
      descricao: '',
      entregaveis: '',
      anexo: null,
    })
    setStep(0)
    setFinish(false)
    setCnpjInvalido(false)
    setDataEntregaInvalida(false); // Reseta o estado de validação de data
  }

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
          <CCol md={4}>
            <CFormLabel>Tipo de Contrato</CFormLabel>
            <CFormSelect name="tipoContrato" value={formData.tipoContrato} onChange={handleChange} required>
              <option value="">Selecione</option>
              <option value="servico">Serviço</option>
              <option value="comunicacao">Comunicação</option>
              <option value="infraestrutura">Infraestrutura</option>
              <option value="desenvolvimento">Desenvolvimento</option>
            </CFormSelect>
          </CCol>
          <CCol md={4}>
            <CFormLabel>Valor</CFormLabel>
            <CFormInput
              type="number"
              name="valorContrato"
              value={formData.valorContrato}
              onChange={handleChange}
              required
            />
          </CCol>
          <CCol md={4}>
            <CFormLabel>Responsável</CFormLabel>
            <CFormSelect
              name="funcionarioResponsavel"
              value={formData.funcionarioResponsavel}
              onChange={handleChange}
              required
            >
              <option value="">Selecione um colaborador</option>
              {colaboradores.map((colab) => (
                <option key={colab.id} value={colab.nome + ' ' + colab.sobrenome}>
                  {colab.nome + ' ' + colab.sobrenome}
                </option>
              ))}
            </CFormSelect>
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
              invalid={dataEntregaInvalida} // Adiciona estilo de inválido se a data de entrega for anterior
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
              invalid={dataEntregaInvalida} // Adiciona estilo de inválido se a data de entrega for anterior
            />
            {dataEntregaInvalida && ( // Exibe mensagem de erro se a data for inválida
              <div className="text-danger mt-2">
                A Data de Entrega não pode ser anterior à Data de Início.
              </div>
            )}
          </CCol>
        </>
      ),
    },
    {
      title: 'Descrição e Anexos', // Renomeado o título para refletir o anexo
      content: (
        <>
          <CCol md={12}>
            <CFormLabel>Descrição do Contrato</CFormLabel>
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
            {formData.entregaveis.map((entregavel, index) => (
              <div key={index} className="border p-3 mb-3 rounded">
                <CRow className="mb-2">
                  <CCol md={6}>
                    <CFormLabel>Descrição do Entregável</CFormLabel>
                    <CFormInput
                      type="text"
                      name="descricao"
                      value={entregavel.descricao}
                      onChange={(e) => handleEntregavelChange(index, e)}
                      required
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>Data Final do Entregável</CFormLabel>
                    <CFormInput
                      type="date"
                      name="dataFinal"
                      value={entregavel.dataFinal}
                      onChange={(e) => handleEntregavelChange(index, e)}
                      required
                    />
                  </CCol>
                  <CCol md={2} className="d-flex align-items-end">
                    {formData.entregaveis.length > 1 && (
                      <CButton className="text-white" color="danger" onClick={() => removerEntregavel(index)}>Remover</CButton>
                    )}
                  </CCol>
                </CRow>
                <CRow>
                  <CCol md={12}>
                    <CFormLabel>Observações</CFormLabel>
                    <CFormTextarea
                      name="observacao"
                      value={entregavel.observacao}
                      onChange={(e) => handleEntregavelChange(index, e)}
                      rows={2}
                    />
                  </CCol>
                </CRow>
              </div>
            ))}
            <CButton color="secondary" onClick={adicionarEntregavel}>
              Adicionar Entregável
            </CButton>
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
            <div className="d-flex justify-content-between mb-4 position-relative">
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
              <div className='d-flex gap-2'>
                {step > 0 && <CButton color="secondary" onClick={handleBack}>Voltar</CButton>}
              </div>
              <div className='d-flex gap-2'>
                {step >= 0 && (
                  <CButton color="secondary" href='/contrato'>
                    Cancelar
                  </CButton>
                )}
                {step < steps.length - 1 && (
                  <CButton color="primary" onClick={handleNext} className={step === 0 ? 'ms-auto' : ''}>
                    Próximo
                  </CButton>
                )}
                {step === steps.length - 1 && (
                  <CButton color="success" style={{color: '#FFFFFF'}} onClick={handleFinish} className={step === 0 ? 'ms-auto' : ''}>
                    Finalizar
                  </CButton>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <CCardText className="text-success mt-3">Contrato cadastrado com sucesso!</CCardText>
            <CButton color="success" className="mt-3 text-white" onClick={handleReset}>
              Cadastrar Novo Contrato
            </CButton>
            <Link to="/contrato" className="btn btn-secondary mt-3 ms-2">
              Ver Contratos
            </Link>
          </>
        )}
      </CCardBody>
    </CCard>
  )
}