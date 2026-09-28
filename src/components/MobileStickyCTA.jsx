import React, { useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { handleWhatsAppOrder } from '../config/business';
import { MessageCircle } from 'lucide-react';

const MobileStickyCTA = () => {
  const { settings } = useAdmin();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      // Check if any modal is open by checking if a div with fixed inset-0 z-[100] exists
      // or if body has overflow hidden
      const hasModal = document.querySelector('.z-\\[100\\]');
      setIsVisible(!hasModal);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] right-3 z-[90]">
      <button 
        onClick={() => handleWhatsAppOrder(null, settings)}
        className="bg-wine text-cream w-12 h-12 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.25)] flex justify-center items-center hover:scale-105 transition-transform"
        aria-label="Order on WhatsApp"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
};

export default MobileStickyCTA;
