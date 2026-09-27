import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { useAdmin } from '../context/AdminContext';
import { handleWhatsAppOrder } from '../config/business';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { navigateToSection, applyFilter, clearFilters } = useShop();
  const { settings } = useAdmin();

  const handleNavClick = (e, linkName) => {
    e.preventDefault();
    setIsOpen(false);
    
    switch (linkName) {
      case 'Home':
        navigateToSection('home');
        break;
      case 'Shop':
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
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
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
    </nav>
  );
};

export default Navbar;
