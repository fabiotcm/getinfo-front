import React from 'react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'
import ContratoDetalhes from 'src/components/ContratoDetalhes.jsx'

const Contrato = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <ContratoDetalhes/>
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default Contrato;
