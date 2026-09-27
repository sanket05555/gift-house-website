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
    <section id="about" className="py-24 bg-cream border-t border-wine/10 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-dark mb-6">Why {settings.businessName}</h2>
          <p className="text-dark/60 text-lg font-light max-w-2xl mx-auto">
            {settings.aboutText}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-soft mb-6 border border-wine/5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-serif text-dark mb-4">{feature.title}</h3>
              <p className="text-dark/60 font-light leading-relaxed">
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
