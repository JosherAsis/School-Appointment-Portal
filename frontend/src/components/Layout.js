import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

// Pages that should not display the navbar
const noNavbarRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

// Pages that should not have the container class (full width)
const noContainerRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password'];

const Layout = ({ children }) => {
  const location = useLocation();
  const shouldShowNavbar = !noNavbarRoutes.some(route =>
    location.pathname === route || location.pathname.startsWith('/reset-password/')
  );

  const shouldUseContainer = !noContainerRoutes.some(route =>
    location.pathname === route || location.pathname.startsWith('/reset-password/')
  );

  return (
    <div className="App">
      {shouldShowNavbar && <Navbar />}
      <div className={shouldUseContainer ? "container" : ""}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
