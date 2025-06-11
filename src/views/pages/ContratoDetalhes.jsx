import React, { useEffect, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CButton, CCard, CCardBody, CCardTitle, CCardText, CListGroup,
  CListGroupItem, CRow, CCol, CProgress
} from '@coreui/react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'
import { cilDataTransferDown, cilFile } from '@coreui/icons' // cilDataTransferDown será para download
import CIcon from '@coreui/icons-react'
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css';

import {
  buscarContratoPorId,
  buscarAgregados,
  buscarEntregaveis,
  viewAnexo,
  downloadAnexo // Importe o novo endpoint de download
} from '../../services/contratoService'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function ContratoDetalhes() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [contrato, setContrato] = useState(null)
  const [colaboradores, setColaboradores] = useState([])
  const [entregaveis, setEntregaveis] = useState([])
  const [anexoUrl, setAnexoUrl] = useState(null)
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);


  useEffect(() => {
    const fetchContratoData = async () => {
      try {
        const [contratoRes, agregadosRes, entregaveisRes] = await Promise.all([
          buscarContratoPorId(id),
          buscarAgregados(id),
          buscarEntregaveis(id)
        ])

        setContrato(contratoRes.data)
        setColaboradores(agregadosRes.data)
        setEntregaveis(entregaveisRes.data)

        try {
          const anexoRes = await viewAnexo(id)
          if (anexoRes.data && anexoRes.data.type === 'application/pdf') {
            const url = URL.createObjectURL(anexoRes.data)
            setAnexoUrl(url)
            console.log('Anexo PDF URL para visualização:', url)
          } else {
            console.warn('O anexo não é um PDF ou está vazio para visualização.')
            setAnexoUrl(null)
          }
        } catch (anexoError) {
          console.warn('Contrato não possui anexo ou erro ao buscar anexo para visualização:', anexoError)
          setAnexoUrl(null)
        }

        console.log('Contrato:', contratoRes.data)
        console.log('Colaboradores:', agregadosRes.data)
        console.log('Entregáveis:', entregaveisRes.data)

      } catch (error) {
        console.error('Erro ao buscar dados do contrato:', error)
      }
    }

    fetchContratoData()

    return () => {
      if (anexoUrl) {
        URL.revokeObjectURL(anexoUrl)
      }
    }
  }, [id, anexoUrl])

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const formatarData = (data) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(data))
  }

  const calcularDiasRestantes = (dataFinal) => {
    const hoje = new Date()
    const final = new Date(dataFinal)
    const diffMs = final - hoje
    if (diffMs < 0) return 'Contrato encerrado'
    const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    if (dias === 0) return 'Último dia'
    if (dias === 1) return '1 dia'
    return `${dias} dias`
  }

  const calcularPorcentagemRestante = (inicio, fim) => {
    const dInicio = new Date(inicio)
    const dFim = new Date(fim)
    const hoje = new Date()
    const total = dFim - dInicio
    const restante = dFim - hoje
    if (restante < 0) return 0
    if (hoje < dInicio) return 100
    return Math.round((restante / total) * 100)
  }

  const getCorProgresso = (porcentagem) => {
    if (porcentagem > 60) return 'success'
    if (porcentagem > 30) return 'warning'
    return 'danger'
  }

  const handleNavigate = (path) => {
    navigate(`/contrato/${id}/${path}`)
  }

  const goToNextPage = () => setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages));
  const goToPrevPage = () => setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));

  // NOVA FUNÇÃO: Para fazer o download do anexo
  const handleDownloadAnexo = async () => {
    try {
      const response = await downloadAnexo(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      // Define um nome de arquivo padrão, você pode tentar pegar do header 'Content-Disposition' do backend se disponível
      link.setAttribute('download', `anexo_contrato_${id}.pdf`); 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Limpa a URL do objeto
    } catch (error) {
      console.error('Erro ao fazer download do anexo:', error);
      alert('Não foi possível fazer o download do anexo.');
    }
  };


  if (!contrato) return <p>Carregando contrato...</p>

  const porcentagemRestante = calcularPorcentagemRestante(contrato.dataInicio, contrato.dataFim)

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1 p-4">
          {/* Card de Informações Gerais do Contrato */}
          <CCard className="mb-4">
            <CCardBody>
              <CCardTitle className="h4">{contrato.tipo}</CCardTitle>
              <CRow>
                <CCol>
                  <strong>Empresa:</strong> {contrato.nomeFantasia} <br />
                  <strong>Descrição:</strong> {contrato.descricao}
                </CCol>
                <CCol>
                  <strong>Valor:</strong> R$ {parseFloat(contrato.valor).toLocaleString()} <br />
                  <strong>Status:</strong> {contrato.statusContrato}
                </CCol>
              </CRow>
              <CRow className='mt-3'>
                <CCol>
                  <CProgress
                    thin
                    color={getCorProgresso(porcentagemRestante)}
                    value={porcentagemRestante}
                  />
                </CCol>
              </CRow>
              <CRow className='mt-1'>
                <CCol><strong>Data Início:</strong> {formatarData(contrato.dataInicio)}</CCol>
                <CCol><strong>Tempo Restante:</strong> {calcularDiasRestantes(contrato.dataFim)}</CCol>
                <CCol><strong>Data Fim:</strong> {formatarData(contrato.dataFim)}</CCol>
              </CRow>
            </CCardBody>
          </CCard>

          {/* Card de Responsável pelo Contrato */}
          <CCard className="mb-4">
            <CCardBody>
              <CCardTitle className="h5">Responsável pelo Contrato</CCardTitle>
              <CListGroup flush>
                <CListGroupItem><strong>Nome:</strong> {contrato.nomeResponsavel}</CListGroupItem>
              </CListGroup>
            </CCardBody>
          </CCard>

          {/* Card de Agregados */}
          <CCard className="mb-4">
            <CCardBody>
              <CCardTitle className="h5">Agregados</CCardTitle>
              {colaboradores.length === 0 ? (
                <p>Nenhum colaborador registrado.</p>
              ) : (
                <CListGroup flush>
                  {colaboradores.map(colab => (
                    <CListGroupItem key={colab.id}>
                      <strong>{colab.nome} {colab.sobrenome}</strong> - {colab.cargo} <br />
                      Contato: {colab.telefone}
                    </CListGroupItem>
                  ))}
                </CListGroup>
              )}
            </CCardBody>
          </CCard>

          {/* Card de Entregáveis */}
          <CCard className="mb-4">
            <CCardBody>
              <CCardTitle className="h5">Entregáveis</CCardTitle>
              {entregaveis.length === 0 ? (
                <p>Nenhum entregável registrado.</p>
              ) : (
                <CListGroup flush>
                  {entregaveis.map((e, idx) => (
                    <CListGroupItem key={idx}>
                      <strong>{e.descricao}</strong><br />
                      Status: {e.status} <br />
                      {e.dataEntrega && <>Data Entrega: {formatarData(e.dataEntrega)}<br /></>}
                      {e.dataCancelamento && <>Data Cancelamento: {formatarData(e.dataCancelamento)}<br /></>}
                    </CListGroupItem>
                  ))}
                </CListGroup>
              )}
            </CCardBody>
          </CCard>

          {/* --- NOVO CARD: Anexo do Contrato --- */}
          <CCard className="mb-4">
            <CCardBody>
              <CCardTitle className="h5">Anexos do Contrato <CIcon icon={cilFile} size="lg" /></CCardTitle>
              {anexoUrl ? (
                <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
                  <p>Visualização da Página {pageNumber} de {numPages || '...'}</p>
                  <div style={{ maxHeight: '600px', overflowY: 'auto', textAlign: 'center' }}>
                    <Document
                      file={anexoUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={(error) => console.error('Erro ao carregar PDF para visualização:', error)}
                    >
                      <Page
                        pageNumber={pageNumber}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        width={Math.min(window.innerWidth * 0.75, 600)}
                      />
                    </Document>
                  </div>
                  <div className="d-flex justify-content-center gap-2 mt-3">
                    <CButton color="secondary" onClick={goToPrevPage} disabled={pageNumber <= 1}>
                      Anterior
                    </CButton>
                    <CButton color="secondary" onClick={goToNextPage} disabled={pageNumber >= numPages}>
                      Próxima
                    </CButton>
                  </div>
                  <div className="mt-3 text-center">
                      <p>Opções para o anexo:</p>
                      <CButton color="info" className="text-white me-2" onClick={() => window.open(anexoUrl, '_blank')}>
                         <CIcon icon={cilFile} className="me-2" /> Visualizar em Nova Aba
                      </CButton>
                      <CButton color="success" className="text-white" onClick={handleDownloadAnexo}>
                         <CIcon icon={cilDataTransferDown} className="me-2" /> Fazer Download
                      </CButton>
                  </div>
                </div>
              ) : (
                <p>Nenhum anexo em formato PDF disponível para este contrato ou erro ao carregá-lo.</p>
              )}
            </CCardBody>
          </CCard>
          {/* --- FIM DO NOVO CARD --- */}

          <div className="d-flex gap-2 mt-3">
            <CButton color="primary" onClick={() => handleNavigate('editar')}>Editar</CButton>
            <CButton className="text-white" color="danger" onClick={() => handleNavigate('aditivo')}>Aditivo</CButton>
            <CButton className="text-white" color="warning" onClick={() => handleNavigate('repactuacao')}>Repactuação</CButton>
          </div>
        </div>
        <AppFooter />
      </div>
    </div>
  )
}