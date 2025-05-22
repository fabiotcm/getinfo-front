import React from 'react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'
import ColaboradorDetalhes from '../../components/ColaboradorDetalhes'

const Colaborador = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <ColaboradorDetalhes/>
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default Colaborador;
