import React from 'react';
import { Camera as Instagram } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAdmin } from '../context/AdminContext';
import { handleWhatsAppOrder } from '../config/business';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { navigateToSection, applyFilter, clearFilters } = useShop();
  const { settings } = useAdmin();

  const handleFooterLinkClick = (e, link) => {
    e.preventDefault();
    if (link === 'Shop') {
      clearFilters();
      navigateToSection('shop');
    } else if (link === 'Occasions') {
      navigateToSection('occasions');
    } else if (link === 'Personalized Gifts') {
      applyFilter('category', 'personalized-gifts');
    } else if (link === 'About') {
      navigateToSection('about');
    } else if (link === 'Contact') {
      handleWhatsAppOrder(null, settings);
    }
  };

  return (
    <footer className="bg-dark text-cream pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-2">
            <h3 className="font-serif text-3xl font-semibold tracking-wide text-cream mb-4">
              {settings?.businessName || 'Gift House'}
            </h3>
            <p className="text-cream/70 font-light text-lg mb-6 max-w-sm">
              {settings?.tagline || 'Thoughtful gifts. Handmade moments.'}
            </p>
            <div className="flex items-center space-x-4">
              <a 
                href={`https://instagram.com/${settings.instagramHandle.replace('@', '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-cream/20 flex items-center justify-center hover:bg-cream hover:text-dark transition-all duration-300"
              >
                <Instagram size={20} />
              </a>
              <span className="text-sm font-medium tracking-wider">{settings.instagramHandle}</span>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-xl mb-6">Explore</h4>
            <ul className="space-y-4">
              {['Shop', 'Occasions', 'Personalized Gifts', 'About', 'Contact'].map((link) => (
                <li key={link}>
                  <a 
                    href={`#${link.toLowerCase().replace(' ', '-')}`} 
                    onClick={(e) => handleFooterLinkClick(e, link)}
                    className="text-cream/70 hover:text-white transition-colors text-sm uppercase tracking-wider"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-xl mb-6">Contact</h4>
            <p className="text-cream/70 font-light mb-4">
              DM us on Instagram to place an order or inquire about custom gifts.
            </p>
            <button 
              onClick={() => handleWhatsAppOrder(null, settings)}
              className="px-6 py-3 border border-cream/20 hover:border-cream transition-all duration-300 rounded-sm font-medium uppercase tracking-wider text-xs"
            >
              Message on WhatsApp
            </button>
          </div>
        </div>

        <div className="border-t border-cream/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-cream/50">
          <p>&copy; {currentYear} {settings?.businessName || 'Gift House'}. All rights reserved.</p>
          <div className="mt-4 md:mt-0 px-4 py-2 bg-cream/5 rounded-sm border border-cream/10 text-xs tracking-wider uppercase">
            Concept website — created for demonstration
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
