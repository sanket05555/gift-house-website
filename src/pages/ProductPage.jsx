import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { generateWhatsAppUrl } from '../config/business';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileStickyCTA from '../components/MobileStickyCTA';
import ImageWithFallback from '../components/ImageWithFallback';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { ShopProvider } from '../context/ShopContext';

const formatPrice = (price) => {
  const num = typeof price === 'string' ? parseFloat(price.replace(/[^\d.-]/g, '')) : price;
  if (isNaN(num)) return price;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
};

const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { categories: collections, occasions, settings } = useAdmin();

  // WhatsApp form state
  const [orderData, setOrderData] = useState({ name: '', phone: '', quantity: 1, location: '', date: '', specialInstructions: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
    
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*, product_occasions(occasion_id)')
          .eq('slug', slug)
          .single();

        if (error || !data) throw error || new Error('Product not found');

        const formattedProduct = {
          ...data,
          occasions: data.product_occasions ? data.product_occasions.map(po => po.occasion_id) : []
        };
        
        setProduct(formattedProduct);

        // SEO Updates
        document.title = `${formattedProduct.title} | Gift House`;
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', `Buy ${formattedProduct.title} at Gift House. Premium handcrafted gifts for every occasion.`);
        }
        
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
          canonical.setAttribute('href', `https://gifthouseindia.vercel.app/products/${slug}`);
        }

        // Generate Order Number
        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const randomHex = Math.floor(1000 + Math.random() * 9000);
        setOrderNumber(`GH-${dateStr}-${randomHex}`);

        // Add JSON-LD
        addJsonLd(formattedProduct);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      // Cleanup JSON-LD on unmount
      const existingProductScript = document.getElementById('product-json-ld');
      if (existingProductScript) existingProductScript.remove();
      const existingBreadcrumbScript = document.getElementById('breadcrumb-json-ld');
      if (existingBreadcrumbScript) existingBreadcrumbScript.remove();
    };
  }, [slug]);

  const addJsonLd = (prod) => {
    const existingProductScript = document.getElementById('product-json-ld');
    if (existingProductScript) existingProductScript.remove();

    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": prod.title,
      "image": prod.image_url,
      "description": `Buy ${prod.title} at Gift House. Premium handcrafted gifts for every occasion.`,
      "url": `https://gifthouseindia.vercel.app/products/${prod.slug}`,
      "offers": {
        "@type": "Offer",
        "price": typeof prod.price === 'string' ? parseFloat(prod.price.replace(/[^\d.-]/g, '')) : prod.price,
        "priceCurrency": "INR",
        "availability": prod.available !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      }
    };

    const scriptProd = document.createElement('script');
    scriptProd.type = 'application/ld+json';
    scriptProd.id = 'product-json-ld';
    scriptProd.innerHTML = JSON.stringify(productSchema);
    document.head.appendChild(scriptProd);

    const existingBreadcrumbScript = document.getElementById('breadcrumb-json-ld');
    if (existingBreadcrumbScript) existingBreadcrumbScript.remove();

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://gifthouseindia.vercel.app/" },
        { "@type": "ListItem", "position": 2, "name": "Shop", "item": "https://gifthouseindia.vercel.app/#shop" },
        { "@type": "ListItem", "position": 3, "name": prod.title, "item": `https://gifthouseindia.vercel.app/products/${prod.slug}` }
      ]
    };

    const scriptBread = document.createElement('script');
    scriptBread.type = 'application/ld+json';
    scriptBread.id = 'breadcrumb-json-ld';
    scriptBread.innerHTML = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(scriptBread);
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

    if (Object.keys(errors).length > 0) return;

    if (!whatsappUrl) {
      alert("WhatsApp ordering will be connected once the business owner provides the WhatsApp number in the admin settings.");
      return;
    }

    setIsSubmitting(true);

    const categoryObj = collections.find(c => c.id === product.category_id || c.id === product.collection);
    const categoryName = categoryObj?.name || categoryObj?.label || 'Gift';
    const unitPrice = typeof product.price === 'string' ? parseFloat(product.price.replace(/[^\d.-]/g, '')) || 0 : product.price || 0;
    const totalPrice = unitPrice * parseInt(orderData.quantity);

    const { error: insertError } = await supabase.from('orders').insert([{
      order_number: orderNumber,
      customer_name: orderData.name,
      customer_phone: normalizedPhone,
      product_id: product.id || null,
      product_name: product.title,
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

    if (insertError) {
      console.error("Error creating order:", insertError);
      setSubmitError("We couldn't create your order right now. Please try again.");
    } else {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream font-sans flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-wine animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-cream font-sans flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-serif text-dark mb-4">Product Not Found</h2>
            <p className="text-dark/70 mb-8">We couldn't find the gift you're looking for. It may have been removed or the link is incorrect.</p>
            <Link to="/#shop" className="inline-flex items-center justify-center px-6 py-3 bg-wine text-cream hover:bg-wine/90 transition-all rounded-sm font-medium uppercase tracking-wider text-sm">
              Back to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryObj = collections.find(c => c.id === product.category_id || c.id === product.collection);
  const categoryName = categoryObj?.name || categoryObj?.label || 'Gift';
  const payload = {
    ...product,
    categoryName
  };
  const orderDetailsForUrl = {
    ...orderData,
    orderNumber
  };
  const whatsappUrl = generateWhatsAppUrl(payload, settings, orderDetailsForUrl);

  return (
    <ShopProvider>
      <div className="min-h-screen bg-cream font-sans selection:bg-wine selection:text-cream pb-20 md:pb-0 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <nav className="flex flex-wrap items-center text-sm font-medium text-dark/60 mb-8 gap-2">
            <Link to="/" className="hover:text-wine transition-colors">Home</Link>
            <span>/</span>
            <Link to="/#shop" className="hover:text-wine transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-dark truncate">{product.title}</span>
          </nav>

          <Link to="/#shop" className="inline-flex items-center text-wine hover:text-wine/80 font-medium text-sm mb-6 transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to Shop
          </Link>

          <div className="bg-white rounded-sm shadow-xl overflow-hidden flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="w-full md:w-1/2 flex-shrink-0 aspect-square md:aspect-auto relative bg-cream">
              <ImageWithFallback
                src={product.image_url || product.image}
                alt={product.title}
                fallbackIdentifier={categoryName || product.title}
                className="w-full h-full object-cover absolute inset-0"
              />
            </div>
            
            {/* Details & Form Section */}
            <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
              <div className="flex flex-col h-full">
                
                {/* Product Header */}
                <div className="mb-8">
                  <p className="text-wine text-xs font-bold uppercase tracking-wider mb-2">{categoryName}</p>
                  <h1 className="text-3xl md:text-4xl font-serif text-dark mb-4">{product.title}</h1>
                  <div className="flex items-center gap-4">
                    <p className="text-2xl font-medium text-dark">{formatPrice(product.price)}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.available !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.available !== false ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  {product.occasions && product.occasions.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {product.occasions.map(occId => {
                        const occ = occasions.find(o => o.id === occId);
                        if (!occ) return null;
                        return (
                          <span key={occId} className="inline-block bg-cream border border-wine/10 text-dark/70 text-xs px-2 py-1 rounded-sm uppercase tracking-wider">
                            {occ.label || occ.name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="border-t border-wine/10 pt-8 mb-6">
                  <h3 className="text-xl font-serif text-dark mb-6">Complete Your Order</h3>
                  
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

                  <button
                    disabled={isSubmitting || product.available === false}
                    className="w-full flex items-center justify-center px-4 py-4 bg-wine text-cream hover:bg-wine/90 transition-all rounded-sm font-medium uppercase tracking-wider text-sm shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                    onClick={(e) => handleContinueToWhatsApp(e, whatsappUrl)}
                  >
                    {isSubmitting ? "Preparing your order..." : product.available !== false ? "Order via WhatsApp" : "Currently Unavailable"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <MobileStickyCTA />
      </div>
    </ShopProvider>
  );
};

export default ProductPage;
