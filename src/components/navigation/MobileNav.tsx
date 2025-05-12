import { Link, useLocation } from 'react-router-dom';
import { Home, Search, List, User } from 'lucide-react';

const MobileNav = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-netflix-black border-t border-netflix-gray z-30">
      <div className="flex justify-around items-center h-16">
        <Link 
          to="/browse" 
          className={`flex flex-col items-center justify-center w-full h-full transition ${
            isActive('/browse') ? 'text-netflix-red' : 'text-netflix-gray'
          }`}
        >
          <Home size={20} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link 
          to="/search" 
          className={`flex flex-col items-center justify-center w-full h-full transition ${
            isActive('/search') ? 'text-netflix-red' : 'text-netflix-gray'
          }`}
        >
          <Search size={20} />
          <span className="text-xs mt-1">Search</span>
        </Link>
        
        <Link 
          to="/browse?category=mylist" 
          className={`flex flex-col items-center justify-center w-full h-full transition ${
            location.pathname === '/browse' && location.search.includes('mylist') 
              ? 'text-netflix-red' 
              : 'text-netflix-gray'
          }`}
        >
          <List size={20} />
          <span className="text-xs mt-1">My List</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={`flex flex-col items-center justify-center w-full h-full transition ${
            isActive('/profile') ? 'text-netflix-red' : 'text-netflix-gray'
          }`}
        >
          <User size={20} />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileNav;