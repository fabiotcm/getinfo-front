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

import logo_getinfo from 'src/assets/brand/logo-getinfo2.46e29e79.png'

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
          <img src={logo_getinfo} alt="Logo" style={{ height: '33px' }} />
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
          <CNavItem href="/cadastrar-empresa">Cadastrar Empresa</CNavItem>
          <CNavItem href="/cadastrar-contrato">Cadastrar Contrato</CNavItem>
          <CNavItem href="/cadastrar-colaborador">Cadastrar Colaborador</CNavItem>
        </CNavGroup>

        <CNavItem href="/clientes">
          <CIcon customClassName="nav-icon" icon={cilUser} /> Empresas
        </CNavItem>

        <CNavItem href="/configuracoes">
          <CIcon customClassName="nav-icon" icon={cilSettings} /> Configurações
        </CNavItem>

        <CNavItem href="/login">
          <CIcon customClassName="nav-icon" icon={cilAccountLogout} /> Sair
        </CNavItem>
      </CSidebarNav>
    </CSidebar>
  )
}
