import React from 'react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'
import CAditivo from 'src/components/Aditivo.jsx'

const Aditivo = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <CAditivo/>
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default Aditivo;