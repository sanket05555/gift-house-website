import React from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ShopByOccasion from './components/ShopByOccasion'
import FeaturedCollections from './components/FeaturedCollections'
import WhyGiftHouse from './components/WhyGiftHouse'
import FindGift from './components/FindGift'
import Testimonials from './components/Testimonials'
import InstagramFeed from './components/InstagramFeed'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'
import { ShopProvider } from './context/ShopContext'

const PublicApp = () => {
  return (
    <ShopProvider>
      <div className="min-h-screen bg-cream font-sans selection:bg-wine selection:text-cream">
        <Navbar />
        <main>
          <Hero />
          <ShopByOccasion />
          <FeaturedCollections />
          <WhyGiftHouse />
          <FindGift />
          <Testimonials />
          <InstagramFeed />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </ShopProvider>
  )
}

export default PublicApp
