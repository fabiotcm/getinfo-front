import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton, CCard, CCardBody, CCol, CContainer, CForm,
  CFormInput, CInputGroup, CInputGroupText, CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { register } from '../../../services/authService'

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  })
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.senha !== form.confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }
    try {
      await register(form)
      navigate('/login')
    } catch (err) {
      setErro('Erro ao registrar usuário')
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={handleSubmit}>
                  <h1>Registrar</h1>
                  <p className="text-body-secondary">Criar uma conta</p>
                  {erro && <p className="text-danger">{erro}</p>}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Usuário"
                      autoComplete="username"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput
                      placeholder="Email"
                      autoComplete="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Senha"
                      autoComplete="new-password"
                      name="senha"
                      value={form.senha}
                      onChange={handleChange}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Repetir Senha"
                      autoComplete="new-password"
                      name="confirmarSenha"
                      value={form.confirmarSenha}
                      onChange={handleChange}
                    />
                  </CInputGroup>
                  <div className="d-grid">
                    <CButton type="submit" color="success" className='text-white'>
                      Criar conta
                    </CButton>
                  </div>
                </CForm>
                <div>
                  <p className="text-center mt-3">
                    Já tem uma conta? <a href="" onClick={(e) => 
                      e.preventDefault() ||
                      navigate('/')
                    }>Faça o login</a>
                  </p>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register
