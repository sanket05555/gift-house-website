import React from 'react';
import { Camera as Instagram } from 'lucide-react';
import { motion } from 'framer-motion';
import ImageWithFallback from './ImageWithFallback';

import { useAdmin } from '../context/AdminContext';

const InstagramFeed = () => {
  const { settings } = useAdmin();
  
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-12">
          <div className="w-12 h-12 bg-cream rounded-full flex items-center justify-center mx-auto mb-4 text-wine border border-wine/10">
            <Instagram size={24} />
          </div>
          <h2 className="text-3xl md:text-4xl font-serif text-dark mb-4">From {settings.businessName} on Instagram</h2>
          <a 
            href={`https://instagram.com/${settings.instagramHandle.replace('@', '')}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-wine font-medium hover:text-wine/80 transition-colors uppercase tracking-wider text-sm border-b border-wine/30 hover:border-wine pb-1"
          >
            Follow {settings.instagramHandle}
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
          {[
            '1572454591674-2739f30d8c40',
            '1584305574647-0685bd87b326',
            '1518199266791-5375a83190b7',
            '1563241592301-657df2a58b88',
            '1530103862676-de8c9debad1d',
            '1605553950156-f4021245037d'
          ].map((imageId, index) => (
            <motion.a
              key={index}
              href={`https://instagram.com/${settings.instagramHandle.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative aspect-square overflow-hidden group block bg-cream rounded-sm"
            >
              <ImageWithFallback
                src={`https://images.unsplash.com/photo-${imageId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80`}
                alt="Instagram feed image"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Instagram size={32} className="text-white drop-shadow-md" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
