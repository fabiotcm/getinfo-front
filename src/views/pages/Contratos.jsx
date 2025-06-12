import React from 'react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'
import ExibirContrato from 'src/components/ExibirContrato.jsx'

const Contratos = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <ExibirContrato/>
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default Contratos;
