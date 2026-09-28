import React, { createContext, useState, useContext } from 'react';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeOccasion, setActiveOccasion] = useState('all');
  const [activePriceRange, setActivePriceRange] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isShopView, setIsShopView] = useState(false);

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
    setIsShopView(true);
    navigateToSection('shop');
  };

  const clearFilters = () => {
    setActiveCategory('all');
    setActiveOccasion('all');
    setActivePriceRange('all');
    setSearchQuery('');
  };

  return (
    <ShopContext.Provider value={{
      activeCategory,
      activeOccasion,
      activePriceRange,
      setActivePriceRange,
      searchQuery,
      setSearchQuery,
      isShopView,
      setIsShopView,
      applyFilter,
      clearFilters,
      navigateToSection
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
