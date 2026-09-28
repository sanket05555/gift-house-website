import React, { useState, useEffect } from 'react';
import { Menu, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { useAdmin } from '../context/AdminContext';
import { handleWhatsAppOrder } from '../config/business';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const { navigateToSection, applyFilter, clearFilters, setIsShopView, setSearchQuery } = useShop();
  const { settings } = useAdmin();

  const handleNavClick = (e, linkName) => {
    e.preventDefault();
    setIsOpen(false);

    switch (linkName) {
      case 'Home':
        navigateToSection('home');
        break;
      case 'Shop':
        setIsShopView(true);
        clearFilters();
        navigateToSection('shop');
        break;
      case 'Occasions':
        navigateToSection('occasions');
        break;
      case 'Personalized':
        applyFilter('category', 'personalized-gifts');
        break;
      case 'About':
        navigateToSection('about');
        break;
      default:
        break;
    }
  };

  const handleMobileSearch = (e) => {
    e.preventDefault();
    if (localSearch.trim()) {
      clearFilters();
      setSearchQuery(localSearch);
      setIsShopView(true);
      setIsSearchOpen(false);
      navigateToSection('shop');
    }
  };

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Shop', href: '#shop' },
    { name: 'Occasions', href: '#occasions' },
    { name: 'Personalized', href: '#personalized' },
    { name: 'About', href: '#about' },
  ];

  // Handle hash changes manually for direct loads (like /#about)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#about') {
      setTimeout(() => navigateToSection('about'), 500);
    } else if (hash === '#personalized') {
      setTimeout(() => applyFilter('category', 'personalized-gifts'), 500);
    } else if (hash === '#shop') {
      setTimeout(() => navigateToSection('shop'), 500);
    } else if (hash === '#occasions') {
      setTimeout(() => navigateToSection('occasions'), 500);
    }
  }, []);

  return (
    <nav className="fixed w-full z-50 bg-cream/90 backdrop-blur-md border-b border-wine/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Mobile menu button */}
          <div className="flex items-center justify-start md:hidden w-12">
            <button
              onClick={() => { setIsOpen(!isOpen); setIsSearchOpen(false); }}
              className="text-dark hover:text-wine transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center flex-1 md:justify-start">
            <a
              href="#home"
              onClick={(e) => handleNavClick(e, 'Home')}
              className="font-serif text-2xl font-semibold tracking-wide text-wine"
            >
              {settings?.businessName || 'Gift House'}
            </a>
          </div>

          {/* Mobile Search Icon */}
          <div className="flex items-center justify-end md:hidden w-12">
            <button
              onClick={() => { setIsSearchOpen(!isSearchOpen); setIsOpen(false); }}
              className="text-dark hover:text-wine transition-colors"
            >
              <Search size={22} />
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.name)}
                className="text-dark/80 hover:text-wine font-medium text-sm transition-colors uppercase tracking-wider"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Icons & CTAs */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleWhatsAppOrder(null, settings)}
              className="hidden md:inline-flex items-center justify-center px-5 py-2.5 border border-wine text-wine hover:bg-wine hover:text-cream transition-all duration-300 rounded-sm text-sm font-medium uppercase tracking-wider"
            >
              Order on WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-[-1] md:hidden"
            style={{ top: '80px' }}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-cream border-b border-wine/10"
          >
            <div className="px-4 pt-2 pb-6 space-y-2 shadow-soft">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block px-3 py-3 text-base font-medium text-dark/80 hover:text-wine hover:bg-wine/5 rounded-sm transition-colors"
                  onClick={(e) => handleNavClick(e, link.name)}
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleWhatsAppOrder(null, settings);
                  }}
                  className="w-full inline-flex items-center justify-center px-5 py-3 border border-wine bg-wine text-cream hover:bg-wine/90 transition-all duration-300 rounded-sm text-sm font-medium uppercase tracking-wider"
                >
                  Order on WhatsApp
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expandable Mobile Search */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-cream border-b border-wine/10 overflow-hidden absolute w-full left-0 top-20 shadow-md"
          >
            <div className="px-4 py-3">
              <form onSubmit={handleMobileSearch} className="relative flex items-center h-[52px] bg-white border border-wine/20 rounded-[10px] shadow-sm overflow-hidden px-1">
                <div className="pl-3 h-full flex items-center justify-center text-dark/40 pointer-events-none">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search gifts, hampers & more"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full pl-3 pr-2 h-full bg-transparent border-0 focus:outline-none text-dark text-[15px] placeholder:text-gray-400"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => { setIsSearchOpen(false); setLocalSearch(''); }}
                  className="w-10 h-10 flex items-center justify-center text-dark/40 hover:text-wine transition-colors"
                >
                  <X size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
