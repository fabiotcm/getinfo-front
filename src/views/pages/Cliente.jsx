import React from 'react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'
import ClienteDetalhes from 'src/components/ClienteDetalhes.jsx'

const Cliente = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <ClienteDetalhes/>
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default Cliente;