import React from 'react'
import {
  CSidebar,
  CSidebarBrand,
  CSidebarHeader,
  CSidebarNav,
  CNavGroup,
  CNavItem,
  CNavTitle,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import {
  cilHome,
  cilUser,
  cilSettings,
  cilAccountLogout,
  cilDescription,
} from '@coreui/icons'

export const SidebarDarkExample = () => {
  return (
    <CSidebar className="border-end" colorScheme="dark">
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand>
          <img src="src/assets/brand/logo-getinfo2.46e29e79.png" alt="Logo" style={{ height: '40px' }} />
        </CSidebarBrand>
      </CSidebarHeader>
      <CSidebarNav>
        <CNavItem href="/home">
          <CIcon customClassName="nav-icon" icon={cilHome} /> Home
        </CNavItem>

        <CNavGroup
          toggler={
            <>
              <CIcon customClassName="nav-icon" icon={cilDescription} /> Contratos
            </>
          }
        >
          <CNavItem href="/cadastrar-cliente">Cadastrar Cliente</CNavItem>
          <CNavItem href="/cadastrar-contrato">Cadastrar Contrato</CNavItem>
        </CNavGroup>

        <CNavItem href="/clientes">
          <CIcon customClassName="nav-icon" icon={cilUser} /> Clientes
        </CNavItem>

        <CNavItem href="/configuracoes">
          <CIcon customClassName="nav-icon" icon={cilSettings} /> Configurações
        </CNavItem>

        <CNavItem href="/sair">
          <CIcon customClassName="nav-icon" icon={cilAccountLogout} /> Sair
        </CNavItem>
      </CSidebarNav>
    </CSidebar>
  )
}
