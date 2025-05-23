import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { CForm, CFormInput, CFormTextarea, CButton } from '@coreui/react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'

export default function Repactuacao() {
  const { id } = useParams()
  const [formData, setFormData] = useState({
    novaDataFim: '',
    novoValor: '',
    descricaoRepactuacao: '',
    documentos: null
  })

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'documentos') {
      setFormData(prev => ({ ...prev, documentos: files }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Repactuação criada:', formData)
    alert('Repactuação adicionada com sucesso!')
  }

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <div className="p-4">
      <h2>Inserir Repactuação</h2>
      <CForm onSubmit={handleSubmit} className="space-y-3">
        <CFormInput
          type="date"
          label="Nova Data Final"
          name="novaDataFim"
          value={formData.novaDataFim}
          onChange={handleChange}
        />

        <CFormInput
          type="number"
          label="Novo Valor (R$)"
          name="novoValor"
          value={formData.novoValor}
          onChange={handleChange}
        />

        <CFormTextarea
          label="Descrição da Repactuação"
          name="descricaoRepactuacao"
          value={formData.descricaoRepactuacao}
          onChange={handleChange}
          rows={4}
        />

        <CFormInput
          type="file"
          label="Anexar Documentos"
          name="documentos"
          onChange={handleChange}
          multiple
        />

        <CButton className='mt-3' type="submit" color="info">Salvar Repactuação</CButton>
      </CForm>
    </div>

        </div>
        <AppFooter />
      </div>
    </div>
  )
}

