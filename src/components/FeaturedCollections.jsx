import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { useAdmin } from '../context/AdminContext';
import { handleWhatsAppOrder, generateWhatsAppUrl } from '../config/business';
import ImageWithFallback from './ImageWithFallback';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const FeaturedCollections = () => {
  const { activeCategory, activeOccasion, clearFilters, applyFilter } = useShop();
  const { products, categories: collections, settings } = useAdmin();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderData, setOrderData] = useState({ name: '', phone: '', quantity: 1, location: '', date: '', specialInstructions: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  const todayDate = new Date().toISOString().split('T')[0];

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setOrderData({ name: '', phone: '', quantity: 1, location: '', date: '', specialInstructions: '' });
    setFormErrors({});
    setSubmitError('');
    setIsSubmitting(false);
    
    // Generate order number: GH-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    setOrderNumber(`GH-${dateStr}-${randomHex}`);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleContinueToWhatsApp = async (e, whatsappUrl) => {
    e.preventDefault();
    setSubmitError('');
    
    const errors = {};
    if (!orderData.name.trim()) errors.name = "Customer Name is required";
    
    let normalizedPhone = orderData.phone.trim();
    if (!normalizedPhone) {
      errors.phone = "Customer Phone is required";
    } else {
      const phoneClean = normalizedPhone.replace(/[^\d+]/g, '');
      if (/^(?:\+91|91)?[6789]\d{9}$/.test(phoneClean)) {
        if (!phoneClean.startsWith('+91')) {
           normalizedPhone = '+91' + phoneClean.slice(-10);
        } else {
           normalizedPhone = phoneClean;
        }
      } else {
        errors.phone = "Please enter a valid 10-digit Indian mobile number";
      }
    }
    
    if (orderData.quantity < 1) errors.quantity = "Quantity must be at least 1";
    if (!orderData.location.trim()) errors.location = "Delivery Location is required";
    if (!orderData.date) errors.date = "Required Delivery Date is required";
    
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    if (!whatsappUrl) {
      alert("WhatsApp ordering will be connected once the business owner provides the WhatsApp number in the admin settings.");
      return;
    }

    setIsSubmitting(true);
    
    const categoryName = collections.find(c => c.id === selectedProduct.collection)?.label || selectedProduct.collection;
    const unitPrice = typeof selectedProduct.price === 'string' ? parseFloat(selectedProduct.price.replace(/[^\d.-]/g, '')) || 0 : selectedProduct.price || 0;
    const totalPrice = unitPrice * parseInt(orderData.quantity);

    const { error } = await supabase.from('orders').insert([{
      order_number: orderNumber,
      customer_name: orderData.name,
      customer_phone: normalizedPhone,
      product_id: selectedProduct.id || null,
      product_name: selectedProduct.title,
      category_name: categoryName,
      unit_price: unitPrice,
      quantity: parseInt(orderData.quantity),
      total_price: totalPrice,
      delivery_location: orderData.location,
      required_delivery_date: orderData.date,
      special_instructions: orderData.specialInstructions || null,
      status: 'whatsapp_pending',
      whatsapp_opened_at: new Date().toISOString()
    }]);

    setIsSubmitting(false);

    if (error) {
      console.error("Error creating order:", error);
      setSubmitError("We couldn't create your order right now. Please try again.");
    } else {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      handleCloseModal();
    }
  };

  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const filteredProducts = products.filter(product => {
    if (product.available === false) return false;

    let matchesCategory = true;
    let matchesOccasion = true;

    if (activeCategory !== 'all') {
      matchesCategory = product.collection === activeCategory;
    }
    
    if (activeOccasion !== 'all') {
      matchesOccasion = product.occasions && product.occasions.includes(activeOccasion);
    }

    return matchesCategory && matchesOccasion;
  });

  const getFilterLabel = () => {
    if (activeOccasion !== 'all') {
      return `Occasion: ${activeOccasion.replace('-', ' ').toUpperCase()}`;
    }
    if (activeCategory !== 'all') {
      const col = collections.find(c => c.id === activeCategory);
      return `Collection: ${col ? col.label : activeCategory}`;
    }
    return '';
  };

  return (
    <section id="shop" className="py-24 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div className="max-w-2xl">
            <span className="text-wine text-sm uppercase tracking-[0.2em] font-medium mb-2 block">Our Signature</span>
            <h2 className="text-4xl md:text-5xl font-serif text-dark mb-4">
              {activeCategory !== 'all' || activeOccasion !== 'all' ? 'Shop' : 'Featured Collections'}
            </h2>
            <p className="text-dark/60 text-lg font-light">Explore our most loved handcrafted creations.</p>
            
            {(activeCategory !== 'all' || activeOccasion !== 'all') && (
              <div className="mt-4 flex items-center gap-4">
                <span className="inline-flex items-center px-4 py-2 bg-wine/10 text-wine rounded-sm text-sm font-medium">
                  {getFilterLabel()}
                </span>
                <button 
                  onClick={clearFilters}
                  className="text-sm text-wine/60 hover:text-wine uppercase tracking-wider font-medium"
                >
                  Clear Filter
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={() => clearFilters()}
            className="hidden md:inline-flex text-wine font-medium uppercase tracking-wider text-sm hover:text-wine/80 transition-colors border-b border-wine/30 hover:border-wine pb-1"
          >
            View All Gifts
          </button>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredProducts.map((product, index) => {
              const collection = collections.find(c => c.id === product.collection);
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group cursor-pointer"
                  onClick={() => handleSelectProduct(product)}
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-cream mb-6">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.title}
                      fallbackIdentifier={collection?.name || collection?.label || product.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleSelectProduct(product); }}
                        className="w-full bg-cream text-dark py-3 font-medium text-sm uppercase tracking-wider hover:bg-wine hover:text-cream transition-colors rounded-sm"
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-wine/70 text-xs uppercase tracking-widest mb-2 font-medium">{collection?.label}</p>
                    <h3 className="text-xl font-serif text-dark mb-2 group-hover:text-wine transition-colors">{product.title}</h3>
                    <p className="text-dark/80 font-medium">{product.price}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-cream/50 rounded-sm border border-wine/10">
            <h3 className="text-2xl font-serif text-dark mb-4">No gifts have been added to this collection yet.</h3>
            <button 
              onClick={clearFilters}
              className="px-6 py-3 bg-wine text-cream hover:bg-wine/90 transition-all rounded-sm font-medium uppercase tracking-wider text-sm mt-4"
            >
              View All Gifts
            </button>
          </div>
        )}
        
        <div className="mt-12 text-center md:hidden">
          <button 
            onClick={() => clearFilters()}
            className="inline-flex text-wine font-medium uppercase tracking-wider text-sm border-b border-wine/30 pb-1"
          >
            View All Gifts
          </button>
        </div>
      </div>

      {/* QUICK VIEW MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-3xl rounded-sm shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row"
            >
              <button 
                onClick={handleCloseModal}
                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white/50 hover:bg-white rounded-full text-dark transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="w-full md:w-1/2 aspect-square md:aspect-auto">
                <ImageWithFallback 
                  src={selectedProduct.image} 
                  alt={selectedProduct.title}
                  fallbackIdentifier={collections.find(c => c.id === selectedProduct.collection)?.name || collections.find(c => c.id === selectedProduct.collection)?.label || selectedProduct.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex flex-col h-full max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    <h3 className="text-2xl font-serif text-dark mb-4">Complete Your Order</h3>
                    
                    <div className="bg-cream/50 p-4 rounded-sm border border-wine/10 mb-6">
                      <p className="font-medium text-dark">{selectedProduct.title}</p>
                      <p className="text-wine font-medium">{selectedProduct.price}</p>
                      <p className="text-xs text-dark/60 uppercase tracking-wider mt-1">
                        {collections.find(c => c.id === selectedProduct.collection)?.label}
                      </p>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-dark mb-1">Customer Name *</label>
                        <input 
                          type="text" 
                          value={orderData.name}
                          onChange={(e) => { setOrderData({...orderData, name: e.target.value}); setFormErrors({...formErrors, name: null}); }}
                          className={`w-full border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-sm p-2 outline-none focus:border-wine transition-colors`}
                          placeholder="Your full name"
                        />
                        {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-dark mb-1">Customer Phone *</label>
                        <input 
                          type="tel" 
                          value={orderData.phone}
                          onChange={(e) => { setOrderData({...orderData, phone: e.target.value}); setFormErrors({...formErrors, phone: null}); }}
                          className={`w-full border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-sm p-2 outline-none focus:border-wine transition-colors`}
                          placeholder="+91 or 10-digit mobile number"
                        />
                        {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-dark mb-1">Quantity *</label>
                        <input 
                          type="number" 
                          min="1"
                          value={orderData.quantity}
                          onChange={(e) => { setOrderData({...orderData, quantity: e.target.value}); setFormErrors({...formErrors, quantity: null}); }}
                          className={`w-full border ${formErrors.quantity ? 'border-red-500' : 'border-gray-300'} rounded-sm p-2 outline-none focus:border-wine transition-colors`}
                        />
                        {formErrors.quantity && <p className="text-red-500 text-xs mt-1">{formErrors.quantity}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-dark mb-1">Delivery Location *</label>
                        <input 
                          type="text" 
                          value={orderData.location}
                          onChange={(e) => { setOrderData({...orderData, location: e.target.value}); setFormErrors({...formErrors, location: null}); }}
                          className={`w-full border ${formErrors.location ? 'border-red-500' : 'border-gray-300'} rounded-sm p-2 outline-none focus:border-wine transition-colors`}
                          placeholder="Enter your delivery location"
                        />
                        {formErrors.location && <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-dark mb-1">Required Delivery Date *</label>
                        <input 
                          type="date" 
                          min={todayDate}
                          value={orderData.date}
                          onChange={(e) => { setOrderData({...orderData, date: e.target.value}); setFormErrors({...formErrors, date: null}); }}
                          className={`w-full border ${formErrors.date ? 'border-red-500' : 'border-gray-300'} rounded-sm p-2 outline-none focus:border-wine transition-colors`}
                        />
                        {formErrors.date && <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-dark mb-1">Special Instructions</label>
                        <textarea 
                          rows="2"
                          value={orderData.specialInstructions}
                          onChange={(e) => setOrderData({...orderData, specialInstructions: e.target.value})}
                          className="w-full border border-gray-300 rounded-sm p-2 outline-none focus:border-wine resize-none transition-colors"
                          placeholder="Any special request? (optional)"
                        />
                      </div>
                    </div>

                    {submitError && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-sm text-sm border border-red-100 mb-6 text-center">
                        {submitError}
                      </div>
                    )}

                    <div className="flex gap-4 mt-auto">
                      <button 
                        onClick={handleCloseModal}
                        disabled={isSubmitting}
                        className="w-1/3 px-4 py-3 border border-wine/20 text-dark hover:bg-cream transition-colors rounded-sm font-medium text-sm tracking-wider uppercase disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      {(() => {
                        const payload = {
                          ...selectedProduct, 
                          categoryName: collections.find(c => c.id === selectedProduct.collection)?.label || selectedProduct.collection
                        };
                        const orderDetailsForUrl = {
                          ...orderData,
                          orderNumber
                        };
                        const whatsappUrl = generateWhatsAppUrl(payload, settings, orderDetailsForUrl);

                        return (
                          <button 
                            disabled={isSubmitting}
                            className="w-2/3 flex items-center justify-center px-4 py-3 bg-wine text-cream hover:bg-wine/90 transition-all rounded-sm font-medium uppercase tracking-wider text-sm shadow-md disabled:opacity-70"
                            onClick={(e) => handleContinueToWhatsApp(e, whatsappUrl)}
                          >
                            {isSubmitting ? "Preparing your order..." : "Continue to WhatsApp"}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default FeaturedCollections;
