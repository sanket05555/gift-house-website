import React, { createContext, useState, useContext, useEffect } from 'react';
import { products as mockProducts, collections as mockCategories, occasions as mockOccasions } from '../data/mockData';
import { supabase } from '../lib/supabaseClient';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkAdmin = async (sessionUser) => {
      if (!sessionUser) {
        if (mounted) {
          setUser(null);
          setIsAdmin(false);
          setIsAdminLoading(false);
          setIsAuthLoading(false);
        }
        return;
      }
      
      if (mounted) {
        setUser(sessionUser);
        setIsAdminLoading(true);
        setIsAuthLoading(false);
      }
      
      try {
        console.log("[ADMIN] admin verification started");
        const { data, error } = await supabase.rpc('is_admin');
        if (error) {
          console.error("[ADMIN] is_admin check failed:", error);
          const testQuery = await supabase.from('orders').select('id').limit(1);
          if (mounted) {
            setIsAdmin(!testQuery.error);
          }
        } else {
          console.log("[ADMIN] admin verification result:", data);
          if (mounted) {
            setIsAdmin(!!data);
          }
        }
      } catch (err) {
        console.error("[ADMIN] Admin check exception:", err);
        if (mounted) {
          setIsAdmin(false);
        }
      } finally {
        if (mounted) {
          setIsAdminLoading(false);
        }
      }
    };

    console.log("[ADMIN] auth loading started");
    // Check active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error("[ADMIN] session error:", error);
      console.log("[ADMIN] auth session result:", session?.user?.id || 'null');
      checkAdmin(session?.user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[ADMIN] auth state change event:", event);
      checkAdmin(session?.user);
    });

    // Fetch public data
    const fetchPublicData = async () => {
      try {
        const [
          { data: pData },
          { data: cData },
          { data: oData },
          { data: tData },
          { data: sData }
        ] = await Promise.all([
          supabase.from('products').select(`
            *,
            categories (slug),
            product_occasions (
              occasions (slug)
            )
          `),
          supabase.from('categories').select('*').order('name'),
          supabase.from('occasions').select('*').order('name'),
          supabase.from('testimonials').select('*'),
          supabase.from('website_settings').select('*').limit(1)
        ]);

        if (cData && cData.length > 0) {
          setCategories(cData.map(c => ({
            ...c,
            label: c.name,
            id: c.slug // fallback for mock data structure
          })));
        }

        if (oData && oData.length > 0) {
          setOccasions(oData.map(o => ({
            ...o,
            label: o.name,
            image: o.image_url,
            id: o.slug // fallback for mock data structure
          })));
        }

        if (pData && pData.length > 0) {
          setProducts(pData.map(p => ({
            ...p,
            collection: p.categories?.slug || p.category_id,
            image: p.image_url,
            occasions: p.product_occasions ? p.product_occasions.map(po => po.occasions?.slug).filter(Boolean) : []
          })));
        }

        if (tData && tData.length > 0) {
          setTestimonials(tData);
        }

        if (sData && sData.length > 0) {
          const s = sData[0];
          setSettings(prev => ({
            ...prev,
            businessName: s.business_name || prev.businessName,
            tagline: s.tagline || prev.tagline,
            instagramHandle: s.instagram_handle || prev.instagramHandle,
            whatsappNumber: s.whatsapp_number || prev.whatsappNumber,
            heroTitle: s.hero_title || prev.heroTitle,
            heroDescription: s.hero_description || prev.heroDescription,
            aboutText: s.about_text || prev.aboutText
          }));
        }
      } catch (err) {
        console.error('Error fetching Supabase data:', err);
      }
    };

    fetchPublicData();
    // Expose it to the context
    setRefreshData(() => fetchPublicData);

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const [products, setProducts] = useState(mockProducts);
  const [categories, setCategories] = useState(mockCategories);
  const [occasions, setOccasions] = useState(mockOccasions);
  const [testimonials, setTestimonials] = useState([
    { id: 't1', name: 'Priya Sharma', location: 'Mumbai', rating: 5, text: 'The personalized hamper was absolutely beautiful. My husband loved it!', visible: true },
    { id: 't2', name: 'Rahul Desai', location: 'Delhi', rating: 5, text: 'Amazing quality and such thoughtful packaging. Will definitely order again.', visible: true },
    { id: 't3', name: 'Anita Patel', location: 'Bangalore', rating: 4, text: 'Beautiful flowers, they look so real. Perfect for home decor.', visible: true }
  ]);
  const [settings, setSettings] = useState({
    businessName: 'Gift House',
    tagline: 'Premium Indian Gifting',
    instagramHandle: '@_gift_house_13',
    whatsappNumber: '',
    heroTitle: 'Make Every Moment Beautiful.',
    heroDescription: 'Thoughtfully crafted gifts, bouquets and handmade creations for the moments that matter.',
    aboutText: 'We believe that a gift is more than just an item; it\'s an expression of love, care, and connection.'
  });
  const [refreshData, setRefreshData] = useState(() => () => {});

  // Example CRUD operations for products
  const addProduct = (product) => setProducts([...products, { ...product, id: Date.now() }]);
  const updateProduct = (id, updatedProduct) => setProducts(products.map(p => p.id === id ? updatedProduct : p));
  const deleteProduct = (id) => setProducts(products.filter(p => p.id !== id));

  // CRUD for Categories
  const addCategory = (category) => setCategories([...categories, { ...category, id: category.id || `cat-${Date.now()}` }]);
  const updateCategory = (id, updatedCategory) => setCategories(categories.map(c => c.id === id ? updatedCategory : c));
  const deleteCategory = (id) => setCategories(categories.filter(c => c.id !== id));

  // CRUD for Occasions
  const addOccasion = (occasion) => setOccasions([...occasions, { ...occasion, id: occasion.id || `occ-${Date.now()}` }]);
  const updateOccasion = (id, updatedOccasion) => setOccasions(occasions.map(o => o.id === id ? updatedOccasion : o));
  const deleteOccasion = (id) => setOccasions(occasions.filter(o => o.id !== id));

  // CRUD for Testimonials
  const addTestimonial = (testimonial) => setTestimonials([...testimonials, { ...testimonial, id: `test-${Date.now()}` }]);
  const updateTestimonial = (id, updatedTestimonial) => setTestimonials(testimonials.map(t => t.id === id ? updatedTestimonial : t));
  const deleteTestimonial = (id) => setTestimonials(testimonials.filter(t => t.id !== id));

  const updateSettings = (newSettings) => setSettings({ ...settings, ...newSettings });

  return (
    <AdminContext.Provider value={{
      user, isAdmin, isAuthLoading, isAdminLoading, logout,
      products, addProduct, updateProduct, deleteProduct,
      categories, addCategory, updateCategory, deleteCategory,
      occasions, addOccasion, updateOccasion, deleteOccasion,
      testimonials, addTestimonial, updateTestimonial, deleteTestimonial,
      settings, updateSettings,
      refreshData
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
