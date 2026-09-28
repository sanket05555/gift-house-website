import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Gift, Sparkles, Clock } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const WhyGiftHouse = () => {
  const { settings } = useAdmin();
  const features = [
    {
      icon: <Heart className="w-8 h-8 text-wine" />,
      title: "Handmade with Care",
      description: "Each creation is meticulously crafted by hand with attention to every tiny detail."
    },
    {
      icon: <Gift className="w-8 h-8 text-wine" />,
      title: "Thoughtful Presentation",
      description: "Beautifully wrapped and presented to create a premium unboxing experience."
    },
    {
      icon: <Sparkles className="w-8 h-8 text-wine" />,
      title: "Personalized Gifting",
      description: "Customized options with photos and messages to make it truly yours."
    },
    {
      icon: <Clock className="w-8 h-8 text-wine" />,
      title: "Made for Memorable Moments",
      description: "Designed specifically to elevate your celebrations and create lasting memories."
    }
  ];

  return (
    <section id="about" className="py-10 md:py-24 bg-cream border-t border-wine/10 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-serif text-dark mb-4 md:mb-6">Why {settings.businessName}</h2>
          <p className="text-dark/60 text-base md:text-lg font-light max-w-2xl mx-auto">
            {settings.aboutText}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center bg-white/50 md:bg-transparent p-4 md:p-0 rounded-md md:rounded-none border border-wine/5 md:border-none"
            >
              <div className="w-12 h-12 md:w-20 md:h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-soft mb-3 md:mb-6 border border-wine/5">
                {React.cloneElement(feature.icon, { className: "w-5 h-5 md:w-8 md:h-8 text-wine" })}
              </div>
              <h3 className="text-lg md:text-xl font-serif text-dark mb-2 md:mb-4">{feature.title}</h3>
              <p className="text-dark/60 text-sm md:text-base font-light leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyGiftHouse;
