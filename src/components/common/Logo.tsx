import { Film } from 'lucide-react';

interface LogoProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo = ({ color = 'text-netflix-red', size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl md:text-3xl',
    lg: 'text-3xl md:text-4xl',
  };

  return (
    <div className={`flex items-center ${sizeClasses[size]}`}>
      <Film className={`${color} mr-2`} />
      <span className={`font-bold ${color}`}>NETFLIX</span>
    </div>
  );
};

export default Logo;