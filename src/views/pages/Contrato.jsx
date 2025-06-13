import React from 'react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'
import DetalhesContrato from 'src/components/DetalhesContrato.jsx'

const Contrato = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <DetalhesContrato/>
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default Contrato;
