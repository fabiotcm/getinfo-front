import React from 'react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'
import ExibirClientes from 'src/components/ExibirClientes.jsx'

const Clientes = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <ExibirClientes />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default Clientes;
