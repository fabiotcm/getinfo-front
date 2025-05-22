import React from 'react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'
import EditarColaborador from '../../components/EditarColaborador'

const EdicaoColaborador = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <EditarColaborador/>
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default EdicaoColaborador;
