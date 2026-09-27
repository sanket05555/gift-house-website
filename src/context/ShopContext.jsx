import React, { createContext, useState, useContext } from 'react';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeOccasion, setActiveOccasion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const navigateToSection = (id) => {
    // Basic hash navigation logic + smooth scroll
    window.location.hash = id;
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const applyFilter = (type, value) => {
    if (type === 'category') {
      setActiveCategory(value);
      setActiveOccasion('all');
    } else if (type === 'occasion') {
      setActiveOccasion(value);
      setActiveCategory('all');
    }
    navigateToSection('shop');
  };

  const clearFilters = () => {
    setActiveCategory('all');
    setActiveOccasion('all');
    setSearchQuery('');
  };

  return (
    <ShopContext.Provider value={{
      activeCategory,
      activeOccasion,
      searchQuery,
      setSearchQuery,
      applyFilter,
      clearFilters,
      navigateToSection
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
