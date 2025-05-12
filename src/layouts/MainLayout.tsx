import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Navbar from '../components/navigation/Navbar';
import MobileNav from '../components/navigation/MobileNav';

const MainLayout = () => {
  const { isAuthenticated, hasSelectedProfile } = useAuthStore();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but profile not selected (except for profile page)
  if (isAuthenticated && !hasSelectedProfile && location.pathname !== '/profile') {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="min-h-screen bg-netflix-dark flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <MobileNav />
    </div>
  );
};

export default MainLayout;