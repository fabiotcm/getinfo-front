import React from 'react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'
import DetalhesCliente from 'src/components/DetalhesCliente.jsx'

const Cliente = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <DetalhesCliente/>
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default Cliente;