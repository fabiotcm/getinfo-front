import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { CForm, CFormInput, CFormTextarea, CButton } from '@coreui/react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'

export default function Aditivo() {
  const { id } = useParams()
  const [formData, setFormData] = useState({
    novaDataFim: '',
    descricaoAditivo: '',
    novoEntregavel: '',
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
    console.log('Aditivo criado:', formData)
    alert('Aditivo adicionado com sucesso!')
  }

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <div className="p-4">
      <h2>Inserir Aditivo</h2>
      <CForm onSubmit={handleSubmit} className="space-y-3">
        <CFormInput
          type="date"
          label="Nova Data Final"
          name="novaDataFim"
          value={formData.novaDataFim}
          onChange={handleChange}
        />

        <CFormInput
          label="Novo Entregável"
          name="novoEntregavel"
          value={formData.novoEntregavel}
          onChange={handleChange}
        />

        <CFormTextarea
          label="Descrição do Aditivo"
          name="descricaoAditivo"
          value={formData.descricaoAditivo}
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

        <CButton type="submit" color="warning">Salvar Aditivo</CButton>
      </CForm>
    </div>

        </div>
        <AppFooter />
      </div>
    </div>
    
  )
}
