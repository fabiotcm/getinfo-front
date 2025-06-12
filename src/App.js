import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { pdfjs } from 'react-pdf'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'

// We use those styles to show code examples, you should remove them in your application.
import './scss/examples.scss'
import CadastroContrato from './views/pages/CadastroContrato'
import Clientes from './views/pages/Clientes'
import Cliente from './views/pages/Cliente'
import Contrato from './views/pages/Contrato'
import CadastroEmpresa from './views/pages/CadastroEmpresa'
import CadastroColaborador from './views/pages/CadastroColaborador'
import EdicaoContrato from './views/pages/EdicaoContrato'
import Aditivo from './views/pages/Aditivo'
import Repactuacao from './views/pages/Repactuacao'
import Colaboradores from './views/pages/Colaboradores'
import EdicaoEmpresa from './views/pages/EdicaoEmpresa'
import EdicaoColaborador from './views/pages/EdicaoColaborador'
import Colaborador from './views/pages/Colaborador'
import Dashboard from './views/pages/Dashboard'
import Contratos from './views/pages/Contratos'
import ClienteContratos from './views/pages/ClienteContratos'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
	'pdfjs-dist/build/pdf.worker.min.mjs',
	import.meta.url,
).toString();
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
          <Route exact path="/" name="Login" element={<Login />} />
          <Route exact path="/cadastrar-contrato" name="Cadastro de Contrato" element={<CadastroContrato />} />
          <Route exact path="/cadastrar-empresa" name="Cadastro de Cliente" element={<CadastroEmpresa />} />
          <Route exact path="/cadastrar-colaborador" name="Cadastro de Colaborador" element={<CadastroColaborador />} />
          <Route exact path="/colaboradores" element={<Colaboradores />} />
          <Route path="/colaboradores/:id" element={<Colaborador />} />
          <Route path="/colaboradores/:id/editar" element={<EdicaoColaborador />} />
          <Route path="/clientes/:id" element={<Cliente />} />
          <Route path="/clientes/:id/editar" element={<EdicaoEmpresa />} />
          <Route path="/clientes/:id/contratos" element={<ClienteContratos />} />
          <Route path="/contrato" element={<Contratos />} />
          <Route path="/contrato/:id" element={<Contrato />} />
          <Route path="/contrato/:id/editar" element={<EdicaoContrato />} />
          <Route path="/contrato/:id/aditivo" element={<Aditivo />} />
          <Route path="/contrato/:id/repactuacao" element={<Repactuacao />} />
          <Route path='/home' name="Home" element={<Dashboard/>}/>
          <Route exact path="/clientes" name="Clientes" element={<Clientes />} />
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
