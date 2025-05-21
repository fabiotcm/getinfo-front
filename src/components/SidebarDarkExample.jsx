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
  cilUserPlus,
  cilBuilding,
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
          <CIcon customClassName="nav-icon" icon={cilHome} /> Dashboard
        </CNavItem>

        <CNavGroup
          toggler={
            <>
              <CIcon customClassName="nav-icon" icon={cilDescription} /> Contratos
            </>
          }
        >
          <CNavItem href="/home">Visualizar Contratos</CNavItem>
          <CNavItem href="/cadastrar-contrato">Cadastrar Contrato</CNavItem>
        </CNavGroup>

        <CNavGroup
          toggler={
            <>
              <CIcon customClassName="nav-icon" icon={cilUserPlus}/> Colaboradores
            </>
          }
        >
          <CNavItem href="/colaboradores">Visualizar Colaborador</CNavItem>
          <CNavItem href="/cadastrar-colaborador">Cadastrar Colaborador</CNavItem>
        </CNavGroup>

        <CNavGroup
          toggler={
            <>
              <CIcon customClassName="nav-icon" icon={cilBuilding} /> Empresas
            </>
          }
        >
          <CNavItem href="/clientes"> Visualizar Empresas</CNavItem>
          <CNavItem href="/cadastrar-empresa">Cadastrar Empresa</CNavItem>
        </CNavGroup>

        <CNavItem href="/configuracoes">
          <CIcon customClassName="nav-icon" icon={cilSettings} /> Configurações
        </CNavItem>

        <CNavItem href="/">
          <CIcon customClassName="nav-icon" icon={cilAccountLogout} /> Sair
        </CNavItem>
      </CSidebarNav>
    </CSidebar>
  )
}
