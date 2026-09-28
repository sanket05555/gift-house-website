import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../context/ShopContext';

const FindGift = () => {
  const { applyFilter } = useShop();
  const [step, setStep] = useState(1);
  const [recipient, setRecipient] = useState('');
  const [occasion, setOccasion] = useState('');

  const recipients = ['Partner', 'Friend', 'Family', 'Someone Special', 'For Myself'];
  const occasions = ['Birthday', 'Anniversary', 'Celebration', 'Surprise', 'Traditional Occasion', 'Home Decor'];

  const handleNext = (type, value) => {
    if (type === 'recipient') {
      setRecipient(value);
      setStep(2);
    } else if (type === 'occasion') {
      setOccasion(value);
      setStep(3);
    }
  };

  const handleReset = () => {
    setStep(1);
    setRecipient('');
    setOccasion('');
  };

  const handleViewGifts = () => {
    // Map FindGift occasion to Shop context occasion
    const mapping = {
      'Birthday': 'birthday',
      'Anniversary': 'anniversary',
      'Celebration': 'celebration',
      'Surprise': 'someone-special',
      'Traditional Occasion': 'traditional',
      'Home Decor': 'home-decor'
    };
    const filterId = mapping[occasion] || 'all';
    applyFilter('occasion', filterId);

    // Optional: reset finder after viewing
    setTimeout(() => {
      handleReset();
    }, 1000);
  };

  return (
    <section id="find-gift" className="py-12 md:py-24 bg-white scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-cream rounded-sm p-8 md:p-16 shadow-soft border border-wine/5 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-wine/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

          <div className="relative z-10 text-center mb-10">
            <span className="text-wine text-sm uppercase tracking-[0.2em] font-medium mb-2 block">Gift Finder</span>
            <h2 className="text-3xl md:text-4xl font-serif text-dark">Find the Perfect Gift</h2>
          </div>

          <div className="relative min-h-[300px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <h3 className="text-xl md:text-2xl font-serif text-dark mb-8 text-center">Who are you gifting?</h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    {recipients.map((item) => (
                      <button
                        key={item}
                        onClick={() => handleNext('recipient', item)}
                        className="px-6 py-3 border border-wine/20 text-dark hover:border-wine hover:bg-wine hover:text-cream transition-all duration-300 rounded-sm font-medium tracking-wide"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <h3 className="text-xl md:text-2xl font-serif text-dark mb-8 text-center">What is the occasion?</h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    {occasions.map((item) => (
                      <button
                        key={item}
                        onClick={() => handleNext('occasion', item)}
                        className="px-6 py-3 border border-wine/20 text-dark hover:border-wine hover:bg-wine hover:text-cream transition-all duration-300 rounded-sm font-medium tracking-wide"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleReset} className="mt-8 text-sm text-wine/60 hover:text-wine uppercase tracking-wider font-medium">
                    Start Over
                  </button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center text-center py-8"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-soft border border-wine/10">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif text-dark mb-4">We found perfect matches!</h3>
                  <p className="text-dark/60 font-light mb-8">
                    Curated thoughtful gifts for your <span className="font-medium text-dark">{recipient.toLowerCase()}</span> for their <span className="font-medium text-dark">{occasion.toLowerCase()}</span>.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <button onClick={handleViewGifts} className="px-8 py-4 bg-wine text-cream hover:bg-wine/90 transition-all duration-300 rounded-sm font-medium uppercase tracking-wider text-sm shadow-lg shadow-wine/20">
                      View Gifts
                    </button>
                    <button onClick={handleReset} className="px-8 py-4 border border-wine/20 text-wine hover:bg-wine/5 transition-all duration-300 rounded-sm font-medium uppercase tracking-wider text-sm">
                      Start Over
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FindGift;
