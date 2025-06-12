import React from 'react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'
import CRepactuacao from 'src/components/Repactuacao.jsx'

const Repactuacao = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <CRepactuacao/>
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default Repactuacao;