import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import contratos from '../../data/contratos_detalhados.json'
import { CButton, CCard, CCardBody, CCardTitle, CCardText, CListGroup, CListGroupItem, CRow, CContainer, CCol } from '@coreui/react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'

export default function ContratoDetalhes() {
  const { id } = useParams()
  const navigate = useNavigate()

  const contrato = contratos.find(c => c.id_contrato === parseInt(id))

  if (!contrato) {
    return <p>Contrato não encontrado.</p>
  }

  const handleNavigate = (path) => {
    navigate(`/contrato/${id}/${path}`)
  }

  const calcularDiasRestantes = (dataFinal) => {
    const hoje = new Date()
    const final = new Date(dataFinal)
    const diffMs = final - hoje

    if (diffMs <= 0) return 'Contrato encerrado'

    const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    return `Faltam ${dias} dias`
  }

  const formatarData = (dataISO) => {
    const data = new Date(dataISO)
    return new Intl.DateTimeFormat('pt-BR').format(data)
  }

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <div className="p-4">
            <CCard className="mb-4">
              <CCardBody>
                <CCardTitle className="h4">{contrato.tipo_contrato}</CCardTitle>
                <CCardText>
                  <strong>Empresa:</strong> {contrato.empresa.nome_fantasia} <br />
                  <strong>Valor:</strong> R$ {contrato.valor.toLocaleString()} <br />
                  <strong>Data Início:</strong> {formatarData(contrato.data_inicio)} <br />
                  <strong>Data Fim:</strong> {formatarData(contrato.data_final)} <br />
                  <strong>Tempo Restante:</strong> {calcularDiasRestantes(contrato.data_final)} <br />
                  <strong>Status:</strong> {contrato.status.descricao} <br />
                  <strong>Descrição:</strong> {contrato.descricao}
                </CCardText>
              </CCardBody>
            </CCard>
            <CRow>
              <CCol>
                <CCard className="mb-4">
                  <CCardBody>
                    <CCardTitle className="h5">Responsável pelo Contrato</CCardTitle>
                    <CListGroup flush>
                      <CListGroupItem><strong>Nome:</strong> {contrato.responsavel.nome} {contrato.responsavel.sobrenome}</CListGroupItem>
                      <CListGroupItem><strong>Email:</strong> {contrato.responsavel.email}</CListGroupItem>
                      <CListGroupItem><strong>Telefone:</strong> {contrato.responsavel.telefone}</CListGroupItem>
                    </CListGroup>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol>
                <CCard className="mb-4">
                  <CCardBody>
                    <CCardTitle className="h5">Funcionário Responsável</CCardTitle>
                    <CListGroup flush>
                      <CListGroupItem><strong>Nome:</strong> {contrato.funcionarioResponsavel.nome}</CListGroupItem>
                      <CListGroupItem><strong>Contato:</strong> {contrato.funcionarioResponsavel.contato}</CListGroupItem>
                      <CListGroupItem><strong>Cargo:</strong> {contrato.funcionarioResponsavel.cargo.descricao}</CListGroupItem>
                    </CListGroup>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
            <CCard className="mb-4">
              <CCardBody>
                <CCardTitle className="h5">Colaboradores</CCardTitle>
                {contrato.colaboradores.length === 0 ? (
                  <p>Nenhum colaborador registrado.</p>
                ) : (
                  <CListGroup flush>
                    {contrato.colaboradores.map(colab => (
                      <CListGroupItem key={colab.id_funcionario}>
                        <strong>{colab.nome}</strong> - {colab.cargo.descricao} <br />
                        Contato: {colab.contato}
                      </CListGroupItem>
                    ))}
                  </CListGroup>
                )}
              </CCardBody>
            </CCard>

            <CCard className="mb-4">
              <CCardBody>
                <CCardTitle className="h5">Entregáveis</CCardTitle>
                {contrato.entregaveis.length === 0 ? (
                  <p>Nenhum entregável registrado.</p>
                ) : (
                  <CListGroup flush>
                    {contrato.entregaveis.map(e => (
                      <CListGroupItem key={e.id_entregavel}>
                        <strong>{e.descricao}</strong> <br />
                        Status: {e.status.descricao} <br />
                        {e.data_entrega && <>Data Entrega: {formatarData(e.data_entrega)} <br /></>}
                        {e.data_canc && <>Data Cancelamento: {formatarData(e.data_canc)} <br /></>}
                      </CListGroupItem>
                    ))}
                  </CListGroup>
                )}
              </CCardBody>
            </CCard>

            <CCard className="mb-4">
              <CCardBody>
                <CCardTitle className="h5">Anexos</CCardTitle>
                {contrato.anexos.length === 0 ? (
                  <p>Nenhum anexo disponível.</p>
                ) : (
                  <CListGroup flush>
                    {contrato.anexos.map(a => (
                      <CListGroupItem key={a.id_anexo}>{a.nome_arquivo}</CListGroupItem>
                    ))}
                  </CListGroup>
                )}
                <p>(Tentar fazer que nem anexo do Gmail)</p>
              </CCardBody>
            </CCard>

            <div className="d-flex gap-2 mt-3">
              <CButton color="primary" onClick={() => handleNavigate('editar')}>
                Editar
              </CButton>
              <CButton color="warning" onClick={() => handleNavigate('aditivo')}>
                Inserir Aditivo
              </CButton>
              <CButton color="info" onClick={() => handleNavigate('repactuacao')}>
                Inserir Repactuação
              </CButton>
            </div>
          </div>
        </div>
        <AppFooter />
      </div>
    </div>
  )
}
