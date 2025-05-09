import React from 'react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'
import CadastrarCliente from '../../components/CadastrarCliente'

const CadastroCliente = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <CadastrarCliente />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default CadastroCliente;
