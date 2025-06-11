import React, { useState, useEffect } from 'react'
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
  CAlert,
  CSpinner
} from '@coreui/react'
import { Link, useNavigate } from 'react-router-dom'
import $, { data } from 'jquery'
import 'jquery-mask-plugin'
import { color, fontString } from 'chart.js/helpers'
import { criarContrato, uploadAnexo, adicionarAgregadoAoContrato } from '../services/contratoService' // ALTEARADO: Importe 'adicionarAgregadoAoContrato'
import { getEmpresas } from '../services/empresaService'
import { getColaboradores } from '../services/colaboradorService'
import { criarEntregavel } from '../services/entregavelService'

export default function CadastrarContratoStepper() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const [finish, setFinish] = useState(false)
  const [cnpjInvalido, setCnpjInvalido] = useState(false)
  const [dataEntregaInvalida, setDataEntregaInvalida] = useState(false)
  const [cnpjsValidos, setCnpjsValidos] = useState([])
  const [colaboradores, setColaboradores] = useState([])
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    cnpj: '',
    tipoContrato: '',
    valorContrato: '',
    funcionarioResponsavel: '',
    dataInicio: '',
    dataEntrega: '',
    descricao: '',
    entregaveis: [{ descricao: '', observacao: '', dataFinal: '' }],
    anexo: null,
    agregados: [], // Adicionado agregados ao formData com um array vazio inicial
  })

  // Função para adicionar um novo agregado ao estado
  const adicionarAgregado = () => {
    setFormData((prev) => ({
      ...prev,
      agregados: [...prev.agregados, { colaboradorId: '', funcao: '' }], // Mantido 'funcao' aqui para o formulário
    }))
  }

  // Função para lidar com a mudança nos campos de um agregado
  const handleAgregadoChange = (index, e) => {
    const { name, value } = e.target
    const novosAgregados = [...formData.agregados]
    novosAgregados[index][name] = value
    setFormData((prev) => ({ ...prev, agregados: novosAgregados }))
    setShowSuccessAlert(false);
    setError(null);
  }

  // Função para remover um agregado do estado
  const removerAgregado = (index) => {
    const novosAgregados = formData.agregados.filter((_, i) => i !== index)
    setFormData((prev) => ({ ...prev, agregados: novosAgregados }))
  }

  const carregarColaboradores = async () => {
    try {
      const response = await getColaboradores()
      const ativos = response.data.filter((colab) => colab.status !== 'INATIVO')
      setColaboradores(ativos)
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error)
    }
  }

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
      setDataEntregaInvalida(false)
    }
    setShowSuccessAlert(false);
    setError(null);
  }

  const handleEntregavelChange = (index, e) => {
    const { name, value } = e.target
    const novosEntregaveis = [...formData.entregaveis]
    novosEntregaveis[index][name] = value
    setFormData((prev) => ({ ...prev, entregaveis: novosEntregaveis }))
    setShowSuccessAlert(false);
    setError(null);
  }

  const adicionarEntregavel = () => {
    setFormData((prev) => ({
      ...prev,
      entregaveis: [...prev.entregaveis, { descricao: '', observacao: '', dataFinal: '' }],
    }))
  }

  const removerEntregavel = (index) => {
    if (formData.entregaveis.length === 1) return // Impede remover o último entregável
    const novosEntregaveis = formData.entregaveis.filter((_, i) => i !== index)
    setFormData((prev) => ({ ...prev, entregaveis: novosEntregaveis }))
  }

  // UseEffect para aplicar as máscaras jQuery e carregar dados iniciais
  useEffect(() => {
    $('.cnpj').mask('00.000.000/0000-00')

    const carregarEmpresas = async () => {
      try {
        const response = await getEmpresas()
        const empresas = response.data
        const cnpjs = empresas.map((emp) => emp.cnpj.replace(/\D/g, ''))
        setCnpjsValidos(cnpjs)
      } catch (error) {
        console.error('Erro ao carregar empresas:', error)
      }
    }

    carregarEmpresas()
    carregarColaboradores()
  }, [])

  const isStepValid = () => {
    const requiredFields = requiredFieldsPerStep[step]
    return requiredFields.every((field) => {
      const value = formData[field]
      if (typeof value === 'string') {
        return value.trim() !== ''
      } else if (Array.isArray(value)) {
        // Para entregaveis, verifica se todos os entregáveis têm descrição e dataFinal preenchidos
        if (field === 'entregaveis') {
          return value.every((ent) => ent.descricao.trim() !== '' && ent.dataFinal.trim() !== '')
        }
        // Para agregados, verifica se todos os agregados têm colaboradorId e funcao preenchidos
        if (field === 'agregados') {
          return value.every((ag) => ag.colaboradorId !== '' && ag.funcao.trim() !== '')
        }
      }
      return !!value // fallback para campos como arquivos (anexo) ou outros tipos
    })
  }

  const handleNext = () => {
    if (!isStepValid()) {
      setError('Preencha todos os campos obrigatórios desta etapa.')
      return
    }

    if (step === 0) {
      const cnpjLimpo = formData.cnpj.replace(/\D/g, '')
      if (!cnpjsValidos.includes(cnpjLimpo)) {
        setCnpjInvalido(true)
        return
      }
    }

    if (step === 1) {
      if (formData.dataInicio && formData.dataEntrega) {
        const dataInicio = new Date(formData.dataInicio)
        const dataEntrega = new Date(formData.dataEntrega)

        dataInicio.setHours(0, 0, 0, 0)
        dataEntrega.setHours(0, 0, 0, 0)

        if (dataEntrega < dataInicio) {
          setDataEntregaInvalida(true)
          setError('A Data de Entrega não pode ser anterior à Data de Início.')
          return
        }

        const hoje = new Date()
        hoje.setDate(hoje.getDate() - 1)
        hoje.setHours(0, 0, 0, 0)

        const dInicio = dataInicio.toISOString();
        const dHoje = hoje.toISOString();
        if (dInicio !== dHoje) {
          setError('A Data de Início não pode ser diferente de hoje.')
          return
        }
      }
    }
    setShowSuccessAlert(false);
    setError(null);
    setStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setStep((prev) => prev - 1)
  }

  const handleFinish = async () => {
    setIsSaving(true);
    setShowSuccessAlert(false);
    setError(null);
    if (!isStepValid()) {
      setError('Preencha todos os campos obrigatórios desta etapa.')
      return
    }
    // Repete a validação de data para o caso do usuário ir e voltar no formulário
    const dataInicio = new Date(formData.dataInicio)
    const dataEntrega = new Date(formData.dataEntrega)

    dataInicio.setHours(0, 0, 0, 0)
    dataEntrega.setHours(0, 0, 0, 0)

    if (dataEntrega < dataInicio) {
      setDataEntregaInvalida(true)
      setError('A Data de Entrega não pode ser anterior à Data de Início.')
      return
    }

    const hoje = new Date()
    hoje.setDate(hoje.getDate() - 1)
    hoje.setHours(0, 0, 0, 0)

    const dInicio = dataInicio.toISOString();
    const dHoje = hoje.toISOString();
    if (dInicio !== dHoje) {
      setError('A Data de Início não pode ser diferente de hoje.')
      return
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
      const response = await criarContrato(contratoDTO);
      const contratoId = response.data.id;
      console.log('Contrato criado com ID:', contratoId);

      // --- ALTERAÇÃO AQUI: ENVIANDO CADA AGREGADO INDIVIDUALMENTE ---
      if (formData.agregados.length > 0) {
        for (const agregado of formData.agregados) {
          const agregadoParaEnviar = {
            idColaborador: parseInt(agregado.colaboradorId),
            cargoContrato: agregado.funcao.trim(), // Ajustado para 'cargoContrato' conforme esperado pelo backend
            idContrato: contratoId, // O backend precisa do contratoId aqui, já que não está na URL
          };
          console.log('Enviando agregado:', agregadoParaEnviar);
          await adicionarAgregadoAoContrato(agregadoParaEnviar); // Chama a nova função do service
        }
        console.log('Todos os colaboradores agregados foram enviados.');
      }

      // Se houver anexo, faz o upload
      if (formData.anexo && contratoId) {
        await uploadAnexo(contratoId, formData.anexo)
        console.log('Anexo enviado com sucesso.')
      }

      // Envia os entregáveis
      if (formData.entregaveis.length > 0 && contratoId) {
        for (const ent of formData.entregaveis) {
          console.log('Criando entregável:', ent)
          await criarEntregavel({
            contratoId,
            descricao: ent.descricao,
            observacao: ent.observacao,
            dataFinal: ent.dataFinal,
          })
        }
        console.log('Todos os entregáveis foram criados.')
      }

      console.log('Contrato cadastrado:', response.data);
      setShowSuccessAlert(true);
      setFinish(true);

      setTimeout(() => {
        setShowSuccessAlert(false);
        navigate("/contrato");
      }, 1000);
    } catch (error) {
      setShowSuccessAlert(false);
      console.error('Erro ao cadastrar contrato:', error)
      // TODO: Melhorar a mensagem de erro para o usuário, se possível
      setError('Ocorreu um erro ao cadastrar o contrato. Verifique o console para mais detalhes.')
    }
  }

  const steps = [
    {
      title: 'CNPJ',
      content: (
        <CRow>
          <CCol md={6}>
            <CFormLabel>CNPJ (*)</CFormLabel>
            <CFormInput
              name="cnpj"
              className="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              onBlur={async () => {
                const response = await getEmpresas()
                const empresas = response.data
                const empresaSelecionada = empresas.find(emp => emp.cnpj.replace(/\D/g, '') === formData.cnpj.replace(/\D/g, ''))
                if (empresaSelecionada) {
                  document.querySelector('input[name="nomeEmpresa"]').value = empresaSelecionada.nomeFantasia;
                  setEmpresa(empresaSelecionada);
                }  
              }}
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
          <CCol md={6}>
            <CFormLabel>Nome da Empresa</CFormLabel>
            <CFormInput
              name="nomeEmpresa"
              onChange={handleChange}
              placeholder="Nome da Empresa"
              disabled
            />
          </CCol>
        </CRow>
      ),
    },
    {
      title: 'Detalhes do Contrato',
      content: (
        <>
          <CCol md={4}>
            <CFormLabel>Tipo de Contrato (*)</CFormLabel>
            <CFormSelect name="tipoContrato" value={formData.tipoContrato} onChange={handleChange} required>
              <option value="">Selecione</option>
              <option value="servico">Serviço</option>
              <option value="comunicacao">Comunicação</option>
              <option value="infraestrutura">Infraestrutura</option>
              <option value="desenvolvimento">Desenvolvimento</option>
            </CFormSelect>
          </CCol>

          <CCol md={4}>
            <CFormLabel>Valor (*)</CFormLabel>
            <CFormInput
              type="number"
              name="valorContrato"
              value={formData.valorContrato}
              onChange={handleChange}
              required
            />
          </CCol>

          <CCol md={4}>
            <CFormLabel>Responsável pelo Contrato (*)</CFormLabel>
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
          <CCol md={6}>
            <CFormLabel>Data de Início (*)</CFormLabel>
            <CFormInput
              type="date"
              name="dataInicio"
              value={formData.dataInicio}
              onChange={handleChange}
              required
            />
          </CCol>
          <CCol md={6}>
            <CFormLabel>Data de Entrega (*)</CFormLabel>
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
      title: 'Agregados',
      content: (
        <>
          <CCol md={12} className="mt-4">
            <CFormLabel>Agregados do Contrato</CFormLabel>
            {formData.agregados.map((agregado, index) => (
              <div key={index} className="border rounded p-3 mb-2">
                <CFormLabel>Colaborador</CFormLabel>
                <CFormSelect
                  className="mb-2"
                  name="colaboradorId"
                  value={agregado.colaboradorId}
                  onChange={(e) => handleAgregadoChange(index, e)}
                >
                  <option value="">Selecione um colaborador</option>
                  {colaboradores.map((colab) => (
                    <option key={colab.id} value={colab.id}>
                      {colab.nome} {colab.sobrenome}
                    </option>
                  ))}
                </CFormSelect>
                <CFormLabel>Função</CFormLabel>
                <CFormInput
                  className="mb-2"
                  name="funcao" // Mantido 'funcao' no frontend para o estado e formulário
                  placeholder="Função no contrato"
                  value={agregado.funcao}
                  onChange={(e) => handleAgregadoChange(index, e)}
                />
                <CButton color="danger" className="btn-sm text-white" onClick={() => removerAgregado(index)}>
                  Remover
                </CButton>
              </div>
            ))}
            <div>
            <CButton color="success" className="mt-1 text-white" onClick={adicionarAgregado}>
              + Novo Agregado
            </CButton>
              
            </div>
          </CCol>
        </>
      ),
    },
    {
      title: 'Descrição e Anexos',
      content: (
        <>
          <CCol md={12}>
            <CFormLabel>Descrição do Contrato (*)</CFormLabel>
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
                    <CFormLabel>Descrição do Entregável (*)</CFormLabel>
                    <CFormInput
                      type="text"
                      name="descricao"
                      value={entregavel.descricao}
                      onChange={(e) => handleEntregavelChange(index, e)}
                      required
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>Data Final do Entregável (*)</CFormLabel>
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
                      <CButton className="text-white" color="danger" onClick={() => removerEntregavel(index)}>
                        Remover
                      </CButton>
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
              Novo Entregável
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
        
        {showSuccessAlert && (
          <CAlert color="success" dismissible className="mb-3">
            Contrato cadastrado com sucesso!
          </CAlert>
        )}
        {error && (
          <CAlert color="danger" dismissible className="mb-3">
            {error}
          </CAlert>
        )}

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
        {step !== 0 &&
          <div>
            <CRow className='mb-3'>
              <CCol md={6}>
                {/* CNPJ em itálico */}
                <CFormLabel className='italic'>CNPJ</CFormLabel>
                <CFormInput
                  name="cnpj-show"
                  className="cnpj italic"
                  value={formData.cnpj}
                  placeholder='00.000.000/0000-00'
                  disabled
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel className='italic'>Nome da Empresa</CFormLabel>
                <CFormInput
                  className='italic'
                  name="nomeEmpresa-show"
                  value={empresa ? empresa.nomeFantasia : ''}
                  onChange={handleChange}
                  placeholder="Nome da Empresa"
                  disabled
                />
              </CCol>
            </CRow>
          </div>
        }

        <h5>{steps[step].title}</h5>
        <CForm className="row g-3 mt-2">{steps[step].content}</CForm>

        <div className="mt-4 d-flex justify-content-between">
          <div className="d-flex gap-2">
            {step > 0 && <CButton color="secondary" onClick={handleBack}>Voltar</CButton>}
          </div>
          <div className="d-flex gap-2">
            {step >= 0 && (
              <CButton color="secondary" href="/contrato">
                Cancelar
              </CButton>
            )}
            {step < steps.length - 1 && (
              <CButton color="primary" onClick={handleNext} className={step === 0 ? 'ms-auto' : ''}>
                Próximo
              </CButton>
            )}
            {step === steps.length - 1 && (
              <CButton color="success" style={{ color: '#FFFFFF' }} onClick={handleFinish} className={step === 0 ? 'ms-auto' : ''}>
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
  )
}