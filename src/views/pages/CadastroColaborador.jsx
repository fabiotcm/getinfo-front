import React from 'react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'
import CadastrarColaborador from '../../components/CadastrarColaborador'

const CadastroColaborador = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <CadastrarColaborador />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default CadastroColaborador;
