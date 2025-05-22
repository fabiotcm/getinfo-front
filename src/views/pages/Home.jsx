import React from 'react'
import { AppSidebar, AppHeader, AppFooter } from '../../components'
import DashboardContratos from '../../components/DashboardContratos'
const Home = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <DashboardContratos/>
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default Home;
