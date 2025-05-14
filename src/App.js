import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'

// We use those styles to show code examples, you should remove them in your application.
import './scss/examples.scss'
import CadastroContrato from './views/pages/CadastroContrato'
import Clientes from './views/pages/Clientes'
import ClienteDetalhes from './views/pages/ClienteDetalhes'
import Home from './views/pages/Home'
import ContratoDetalhes from './views/pages/ContratoDetalhes'
import CadastroEmpresa from './views/pages/CadastroEmpresa'
import CadastroColaborador from './views/pages/CadastroColaborador'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          <Route exact path="/cadastrar-contrato" name="Cadastro de Contrato" element={<CadastroContrato />} />
          <Route exact path="/cadastrar-empresa" name="Cadastro de Cliente" element={<CadastroEmpresa />} />
          <Route exact path="/cadastrar-colaborador" name="Cadastro de Colaborador" element={<CadastroColaborador />} />
          <Route path="/clientes/:id" element={<ClienteDetalhes />} />
          <Route path="/contrato/:id" element={<ContratoDetalhes />} />
          <Route path='/home' name="Home" element={<Home/>}/>
          <Route exact path="/clientes" name="Clientes" element={<Clientes />} />
          <Route exact path="/login" name="Login Page" element={<Login />} />
          <Route exact path="/register" name="Register Page" element={<Register />} />
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} />
          <Route path="*" name="Home" element={<DefaultLayout />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
