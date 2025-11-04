import React from 'react';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  return (
    <header className="p-4 md:px-8">
      <nav className="flex justify-between items-center">
        <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Finder<span className="text-light-accent dark:text-dark-accent">Resep</span>
        </div>
        <ThemeToggle />
      </nav>
    </header>
  );
};

export default Header;