import React from 'react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'
import CadastrarEmpresa from '../../components/CadastrarEmpresa'

const CadastroEmpresa = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <CadastrarEmpresa />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default CadastroEmpresa;
