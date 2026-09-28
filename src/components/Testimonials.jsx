import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';

const Testimonials = () => {
  const { testimonials } = useAdmin();
  const visibleTestimonials = testimonials.filter(t => t.visible !== false);

  if (visibleTestimonials.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-wine text-sm uppercase tracking-[0.2em] font-medium mb-2 block">Customer Love</span>
          <h2 className="text-4xl md:text-5xl font-serif text-dark">Words from our Customers</h2>
          <div className="w-16 h-0.5 bg-wine mx-auto mt-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {visibleTestimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-8 rounded-sm shadow-soft border border-wine/5 flex flex-col h-full relative"
            >
              {/* Quote marks */}
              <div className="absolute top-6 right-6 text-6xl font-serif text-cream leading-none select-none">"</div>

              <div className="flex text-gold mb-6 relative z-10">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={16} fill="currentColor" className={star <= testimonial.rating ? "text-gold fill-gold" : "text-gray-200"} />
                ))}
              </div>
              <p className="text-dark/70 font-light leading-relaxed italic mb-8 flex-grow relative z-10">
                {testimonial.text}
              </p>
              <div className="flex items-center relative z-10">
                <div className="w-10 h-10 bg-cream rounded-full flex items-center justify-center text-wine font-serif font-medium border border-wine/10 uppercase">
                  {testimonial.name ? testimonial.name.charAt(0) : 'C'}
                </div>
                <div className="ml-4">
                  <h4 className="text-dark font-medium font-serif">{testimonial.name}</h4>
                  <p className="text-dark/50 text-sm">{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
