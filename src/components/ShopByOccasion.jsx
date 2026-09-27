import React from 'react';
import { motion } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { useAdmin } from '../context/AdminContext';
import ImageWithFallback from './ImageWithFallback';

const ShopByOccasion = () => {
  const { applyFilter } = useShop();
  const { occasions } = useAdmin();
  const activeOccasions = occasions.filter(o => o.active !== false);

  return (
    <section id="occasions" className="py-24 bg-cream scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-wine text-sm uppercase tracking-[0.2em] font-medium mb-2 block">Curated For You</span>
          <h2 className="text-4xl md:text-5xl font-serif text-dark">Shop by Occasion</h2>
          <div className="w-16 h-0.5 bg-wine mx-auto mt-6"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {activeOccasions.map((occasion, index) => (
            <motion.div
              key={occasion.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => applyFilter('occasion', occasion.id)}
              className="group relative h-64 overflow-hidden rounded-sm cursor-pointer shadow-soft block"
            >
              <div className="absolute inset-0 bg-dark/20 group-hover:bg-dark/40 transition-colors duration-500 z-10" />
              <ImageWithFallback
                src={occasion.image}
                alt={occasion.label}
                fallbackIdentifier={occasion.id || occasion.label}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 z-20 flex items-center justify-center p-4 text-center">
                <h3 className="text-cream text-lg md:text-xl font-serif font-medium tracking-wide drop-shadow-md">
                  {occasion.label}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByOccasion;
