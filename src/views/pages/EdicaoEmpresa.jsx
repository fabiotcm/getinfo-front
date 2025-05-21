import React from 'react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'
import EditarEmpresa from '../../components/EditarEmpresa'

const EdicaoEmpresa = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <EditarEmpresa/>
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default EdicaoEmpresa;
