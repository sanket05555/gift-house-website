import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { useAdmin } from '../context/AdminContext';
import { handleWhatsAppOrder, generateWhatsAppUrl } from '../config/business';
import ImageWithFallback from './ImageWithFallback';
import { X, Search, SlidersHorizontal } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const formatPrice = (price) => {
  const num = typeof price === 'string' ? parseFloat(price.replace(/[^\d.-]/g, '')) : price;
  if (isNaN(num)) return price;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
};

const FeaturedCollections = () => {
  const { activeCategory, activeOccasion, activePriceRange, setActivePriceRange, clearFilters, applyFilter, isShopView, setIsShopView, searchQuery, setSearchQuery } = useShop();
  const { products, categories: collections, settings, occasions } = useAdmin();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
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

    // Exclude products with missing images from the featured public product section
    if (!isShopView && (!product.image || product.image.trim() === '')) {
      return false;
    }

    let matchesCategory = true;
    let matchesOccasion = true;
    let matchesPrice = true;

    if (activeCategory !== 'all') {
      matchesCategory = product.collection === activeCategory;
    }

    if (activeOccasion !== 'all') {
      matchesOccasion = product.occasions && product.occasions.includes(activeOccasion);
    }

    if (activePriceRange !== 'all') {
      const price = typeof product.price === 'string' ? parseFloat(product.price.replace(/[^\d.-]/g, '')) : product.price;
      if (activePriceRange === 'under-1000') matchesPrice = price < 1000;
      else if (activePriceRange === '1000-2500') matchesPrice = price >= 1000 && price <= 2500;
      else if (activePriceRange === 'over-2500') matchesPrice = price > 2500;
    }

    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      if (!product.title.toLowerCase().includes(q) && !product.collection?.toLowerCase().includes(q)) {
        return false;
      }
    }

    return matchesCategory && matchesOccasion && matchesPrice;
  });

  const getFilterLabel = () => {
    if (searchQuery) return `Search: ${searchQuery}`;
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
    <section id="shop" className={`py-10 md:py-24 bg-white scroll-mt-20 ${isShopView ? 'min-h-[80vh] md:min-h-screen' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* SHOP HEADER & FILTERS */}
        {isShopView ? (
          <div className="mb-12">
            <h2 className="text-3xl md:text-5xl font-serif text-dark mb-6">Shop All Gifts</h2>

            {/* Mobile Filter Button */}
            <div className="md:hidden flex justify-between items-center mb-6">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-wine/20 rounded-sm text-dark hover:bg-wine/5 transition-colors font-medium text-sm tracking-wider w-full"
              >
                <SlidersHorizontal size={18} />
                Filters & Search
              </button>
            </div>

            {/* Search and Filter Bar (Desktop) */}
            <div className="hidden md:flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark/40" size={20} />
                <input
                  type="text"
                  placeholder="Search gifts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-cream border border-wine/10 rounded-sm focus:outline-none focus:border-wine/30 transition-colors"
                />
              </div>
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-wine/20 rounded-sm text-dark hover:bg-wine/5 transition-colors font-medium text-sm tracking-wider uppercase"
              >
                <SlidersHorizontal size={18} />
                Filter & Sort
              </button>
            </div>

            {/* Horizontal Category Chips (Desktop) */}
            <div className="hidden md:flex overflow-x-auto pb-4 gap-3 hide-scrollbar">
              <button
                onClick={() => { clearFilters(); setIsShopView(true); }}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === 'all' && activeOccasion === 'all' && !searchQuery ? 'bg-wine text-cream' : 'bg-cream text-dark/70 hover:bg-wine/10'}`}
              >
                All
              </button>
              {collections.map(col => (
                <button
                  key={col.id}
                  onClick={() => applyFilter('category', col.id)}
                  className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === col.id ? 'bg-wine text-cream' : 'bg-cream text-dark/70 hover:bg-wine/10'}`}
                >
                  {col.label}
                </button>
              ))}
            </div>

            {getFilterLabel() && (
              <div className="mt-4 flex items-center gap-4">
                <span className="inline-flex items-center px-4 py-2 bg-wine/10 text-wine rounded-sm text-sm font-medium">
                  {getFilterLabel()}
                </span>
                <button
                  onClick={() => { clearFilters(); setIsShopView(true); }}
                  className="text-sm text-wine/60 hover:text-wine uppercase tracking-wider font-medium"
                >
                  Clear Filter
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-16">
            <div className="max-w-2xl">
              <span className="text-wine text-sm uppercase tracking-[0.2em] font-medium mb-2 block">Our Signature</span>
              <h2 className="text-4xl md:text-5xl font-serif text-dark mb-4">
                Featured Collections
              </h2>
              <p className="text-dark/60 text-lg font-light">Explore our most loved handcrafted creations.</p>
            </div>
            <button
              onClick={() => { clearFilters(); setIsShopView(true); window.scrollTo({ top: document.getElementById('shop').offsetTop - 80, behavior: 'smooth' }); }}
              className="hidden md:inline-flex text-wine font-medium uppercase tracking-wider text-sm hover:text-wine/80 transition-colors border-b border-wine/30 hover:border-wine pb-1"
            >
              Shop All Gifts
            </button>
          </div>
        )}

        {filteredProducts.length > 0 ? (
          <div className={`grid gap-3 md:gap-8 lg:gap-10 grid-cols-2 md:grid-cols-3 lg:grid-cols-4`}>
            {(isShopView ? filteredProducts : filteredProducts.slice(0, 4)).map((product, index) => {
              const collection = collections.find(c => c.id === product.collection);
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group cursor-pointer bg-white rounded-md overflow-hidden flex flex-col"
                  onClick={() => handleSelectProduct(product)}
                >
                  <div className={`relative w-full overflow-hidden bg-cream aspect-square`}>
                    <ImageWithFallback
                      src={product.image}
                      alt={product.title}
                      fallbackIdentifier={collection?.name || collection?.label || product.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                  <div className="pt-3 pb-4 px-1 flex-1 flex flex-col">
                    <p className="text-wine/70 text-[10px] md:text-xs uppercase tracking-widest mb-1 font-medium truncate">{collection?.label || 'Gift'}</p>
                    <h3 className="text-sm md:text-base font-serif text-dark mb-1 group-hover:text-wine transition-colors line-clamp-2 leading-snug">{product.title}</h3>
                    <p className="text-dark font-medium text-sm md:text-base mb-2 md:mb-3 mt-auto">{formatPrice(product.price)}</p>
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSelectProduct(product); }}
                        className="flex-1 bg-wine text-cream py-1.5 md:py-2.5 font-medium text-[10px] md:text-xs uppercase tracking-wider hover:bg-wine/90 transition-colors rounded-sm"
                      >
                        Order Now
                      </button>
                    </div>
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

        {!isShopView && (
          <div className="mt-12 text-center md:hidden">
            <button
              onClick={() => { clearFilters(); setIsShopView(true); window.scrollTo({ top: document.getElementById('shop').offsetTop - 80, behavior: 'smooth' }); }}
              className="inline-flex text-wine font-medium uppercase tracking-wider text-sm border-b border-wine/30 pb-1"
            >
              Shop All Gifts
            </button>
          </div>
        )}
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
              className="relative bg-white w-full max-w-3xl rounded-sm shadow-2xl overflow-y-auto md:overflow-hidden z-10 flex flex-col md:flex-row max-h-[90dvh] md:max-h-none"
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white/80 md:bg-white/50 hover:bg-white rounded-full text-dark transition-colors shadow-sm md:shadow-none"
              >
                <X size={20} />
              </button>

              <div className="w-full md:w-1/2 flex-shrink-0 aspect-square md:aspect-auto">
                <ImageWithFallback
                  src={selectedProduct.image}
                  alt={selectedProduct.title}
                  fallbackIdentifier={collections.find(c => c.id === selectedProduct.collection)?.name || collections.find(c => c.id === selectedProduct.collection)?.label || selectedProduct.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
                  <div className="flex flex-col h-full md:max-h-[70vh] md:overflow-y-auto md:pr-2 custom-scrollbar pb-[calc(1rem+env(safe-area-inset-bottom))] md:pb-0">
                    <h3 className="text-2xl font-serif text-dark mb-4">Complete Your Order</h3>

                    <div className="bg-cream/50 p-4 rounded-sm border border-wine/10 mb-6">
                      <p className="font-medium text-dark">{selectedProduct.title}</p>
                      <p className="text-wine font-medium">{formatPrice(selectedProduct.price)}</p>
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

      {/* MOBILE & DESKTOP FILTER DRAWER */}
      <AnimatePresence>
        {showMobileFilters && (
          <div className="fixed inset-0 z-[110]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl overflow-y-auto flex flex-col"
            >
              <div className="p-4 border-b border-wine/10 flex justify-between items-center bg-cream/50 sticky top-0 z-10">
                <h3 className="text-xl font-serif text-dark">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 text-dark hover:text-wine transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-8 flex-1">
                {/* Search */}
                <div>
                  <h4 className="text-sm font-medium text-dark uppercase tracking-wider mb-3 block">Search</h4>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark/40" size={16} />
                    <input
                      type="text"
                      placeholder="Search gifts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-cream/50 border border-wine/10 rounded-sm focus:outline-none focus:border-wine/30 transition-colors text-sm"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h4 className="text-sm font-medium text-dark uppercase tracking-wider mb-3 block">Categories</h4>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => { applyFilter('category', 'all'); }}
                      className={`text-left px-4 py-2.5 rounded-sm text-sm transition-colors ${activeCategory === 'all' ? 'bg-wine text-cream' : 'bg-cream/50 text-dark/80'}`}
                    >
                      All Categories
                    </button>
                    {collections.map(col => (
                      <button
                        key={col.id}
                        onClick={() => { applyFilter('category', col.id); }}
                        className={`text-left px-4 py-2.5 rounded-sm text-sm transition-colors ${activeCategory === col.id ? 'bg-wine text-cream' : 'bg-cream/50 text-dark/80'}`}
                      >
                        {col.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Occasions */}
                <div>
                  <h4 className="text-sm font-medium text-dark uppercase tracking-wider mb-3 block">Occasions</h4>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => { applyFilter('occasion', 'all'); }}
                      className={`text-left px-4 py-2.5 rounded-sm text-sm transition-colors ${activeOccasion === 'all' ? 'bg-wine text-cream' : 'bg-cream/50 text-dark/80'}`}
                    >
                      All Occasions
                    </button>
                    {occasions?.filter(o => o.active !== false).map(occ => (
                      <button
                        key={occ.id}
                        onClick={() => { applyFilter('occasion', occ.id); }}
                        className={`text-left px-4 py-2.5 rounded-sm text-sm transition-colors ${activeOccasion === occ.id ? 'bg-wine text-cream' : 'bg-cream/50 text-dark/80'}`}
                      >
                        {occ.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="text-sm font-medium text-dark uppercase tracking-wider mb-3 block">Price</h4>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setActivePriceRange('all')}
                      className={`text-left px-4 py-2.5 rounded-sm text-sm transition-colors ${activePriceRange === 'all' ? 'bg-wine text-cream' : 'bg-cream/50 text-dark/80'}`}
                    >
                      All Prices
                    </button>
                    <button
                      onClick={() => setActivePriceRange('under-1000')}
                      className={`text-left px-4 py-2.5 rounded-sm text-sm transition-colors ${activePriceRange === 'under-1000' ? 'bg-wine text-cream' : 'bg-cream/50 text-dark/80'}`}
                    >
                      Under ₹1000
                    </button>
                    <button
                      onClick={() => setActivePriceRange('1000-2500')}
                      className={`text-left px-4 py-2.5 rounded-sm text-sm transition-colors ${activePriceRange === '1000-2500' ? 'bg-wine text-cream' : 'bg-cream/50 text-dark/80'}`}
                    >
                      ₹1000 - ₹2500
                    </button>
                    <button
                      onClick={() => setActivePriceRange('over-2500')}
                      className={`text-left px-4 py-2.5 rounded-sm text-sm transition-colors ${activePriceRange === 'over-2500' ? 'bg-wine text-cream' : 'bg-cream/50 text-dark/80'}`}
                    >
                      Above ₹2500
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-wine/10 bg-white sticky bottom-0 z-10 flex gap-4">
                <button
                  onClick={() => { clearFilters(); setShowMobileFilters(false); }}
                  className="w-1/3 px-4 py-3 border border-wine/20 text-dark hover:bg-cream transition-colors rounded-sm font-medium text-[10px] tracking-wider uppercase"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-2/3 px-4 py-3 bg-wine text-cream hover:bg-wine/90 transition-colors rounded-sm font-medium text-[10px] tracking-wider uppercase"
                >
                  Show Results
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default FeaturedCollections;
