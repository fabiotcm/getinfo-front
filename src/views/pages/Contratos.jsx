import React from 'react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'
import ContratoCard from '../../components/ContratoCard'

const Contratos = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <ContratoCard/>
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default Contratos;
