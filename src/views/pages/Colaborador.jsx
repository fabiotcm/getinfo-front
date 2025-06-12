import React from 'react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'
import DetalhesColaborador from 'src/components/DetalhesColaborador.jsx'

const Colaborador = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <DetalhesColaborador/>
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default Colaborador;
