import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import contratos from '../data/contratos.json'
import { CForm, CFormInput, CFormTextarea, CButton, CFormSelect } from '@coreui/react'

export default function EditarContrato() {
  const { id } = useParams()
  const contrato = contratos.find(c => c.id === parseInt(id))
  const [formData, setFormData] = useState({
    descricao: contrato?.descricao || '',
    colaboradorResponsavel: contrato?.colaboradorResponsavel || '',
    status: contrato?.status || ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Contrato atualizado:', formData)
    alert('Contrato atualizado com sucesso!')
  }

  return (
    <div className="p-4">
      <h2>Editar Contrato</h2>
      <CForm onSubmit={handleSubmit} className="space-y-3">
        <CFormTextarea
          label="Descrição"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          rows={4}
        />

        <CFormInput
          label="Colaborador Responsável"
          name="colaboradorResponsavel"
          value={formData.colaboradorResponsavel}
          onChange={handleChange}
        />

        <CFormSelect
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="">Selecione o status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="encerrado">Encerrado</option>
        </CFormSelect>

        <CButton type="submit" color="primary">Salvar Alterações</CButton>
      </CForm>
    </div>
  )
} 
