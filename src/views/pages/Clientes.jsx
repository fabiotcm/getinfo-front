import React from 'react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'
import CardClientes from '../../components/CardClientes'

const Clientes = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <CardClientes />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default Clientes;
