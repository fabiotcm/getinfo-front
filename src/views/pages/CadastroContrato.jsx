import React from 'react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'
import CadastrarContrato from '../../components/CadastrarContrato'

const CadastroContrato = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <CadastrarContrato />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default CadastroContrato
