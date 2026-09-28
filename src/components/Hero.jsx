import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAdmin } from '../context/AdminContext';

const Hero = () => {
  const { navigateToSection, clearFilters } = useShop();
  const { settings } = useAdmin();
  const handleExplore = (e) => {
    e.preventDefault();
    clearFilters();
    navigateToSection('shop');
  };

  const handleFindGift = (e) => {
    e.preventDefault();
    navigateToSection('find-gift');
  };




  return (
    <section id="home" className="relative min-h-[80vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-20 scroll-mt-20">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1572454591674-2739f30d8c40?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="Beautiful floral arrangement"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cream/95 via-cream/80 to-cream/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row items-center">
        <div className="w-full md:w-3/5 text-center md:text-left pt-12 md:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="text-wine text-sm md:text-base uppercase tracking-[0.2em] mb-4 block font-medium">{settings.tagline}</span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-dark leading-tight mb-6" dangerouslySetInnerHTML={{ __html: settings.heroTitle.replace('Moment', '<span class="text-wine italic">Moment</span>') }}>
            </h1>
            <p className="text-lg md:text-xl text-dark/70 mb-10 max-w-xl mx-auto md:mx-0 font-light leading-relaxed">
              {settings.heroDescription}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <button
                onClick={handleExplore}
                className="w-full sm:w-auto px-8 py-4 bg-wine text-cream hover:bg-wine/90 transition-all duration-300 rounded-sm font-medium uppercase tracking-wider text-sm flex items-center justify-center shadow-lg shadow-wine/20"
              >
                Explore Gifts
                <ArrowRight size={18} className="ml-2" />
              </button>
              <button
                onClick={handleFindGift}
                className="w-full sm:w-auto px-8 py-4 border-2 border-wine/20 text-wine hover:border-wine hover:bg-wine/5 transition-all duration-300 rounded-sm font-medium uppercase tracking-wider text-sm flex items-center justify-center"
              >
                Find a Gift
              </button>
            </div>


          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
