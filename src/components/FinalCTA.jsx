import React from 'react';
import { handleWhatsAppOrder } from '../config/business';
import { useAdmin } from '../context/AdminContext';

const FinalCTA = () => {
  const { settings } = useAdmin();

  return (
    <section className="py-12 md:py-24 bg-wine text-cream text-center px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-serif mb-6 leading-tight">
          Have something special in mind?
        </h2>
        <p className="text-xl md:text-2xl font-light mb-10 text-cream/80">
          Let's create a gift worth remembering.
        </p>
        <button
          onClick={() => handleWhatsAppOrder(null, settings)}
          className="px-8 py-4 bg-cream text-wine hover:bg-white transition-all duration-300 rounded-sm font-medium uppercase tracking-wider text-sm shadow-lg shadow-black/10 inline-flex items-center"
        >
          Order on WhatsApp
        </button>
      </div>
    </section>
  );
};

export default FinalCTA;
