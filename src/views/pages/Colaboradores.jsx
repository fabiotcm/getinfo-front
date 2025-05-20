import React from 'react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'
import ExibirColaborador from '../../components/ExibirColaboradores'

const Colaboradores = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <ExibirColaborador/>
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default Colaboradores;
