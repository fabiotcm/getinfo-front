import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="https://www.getinfo.net.br/" target="_blank" rel="noopener noreferrer">
          GetInfo
        </a>
        <span className="ms-1">&copy; 2025</span>
      </div>
      <div>
        <p className="m-0">Made By os crias do Squad 04</p>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
