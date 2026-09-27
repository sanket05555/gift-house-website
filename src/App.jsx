import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import PublicApp from './PublicApp'
import AdminLayout from './admin/AdminLayout'
import DashboardHome from './admin/DashboardHome'
import OrdersManager from './admin/OrdersManager'
import ProductsManager from './admin/ProductsManager'
import CategoriesManager from './admin/CategoriesManager'
import OccasionsManager from './admin/OccasionsManager'
import SettingsManager from './admin/SettingsManager'
import TestimonialsManager from './admin/TestimonialsManager'
import AdminLogin from './admin/AdminLogin'
import { AdminProvider } from './context/AdminContext'

function App() {
  return (
    <AdminProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PublicApp />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="orders" element={<OrdersManager />} />
            <Route path="products" element={<ProductsManager />} />
            <Route path="categories" element={<CategoriesManager />} />
            <Route path="occasions" element={<OccasionsManager />} />
            <Route path="testimonials" element={<TestimonialsManager />} />
            <Route path="settings" element={<SettingsManager />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AdminProvider>
  )
}

export default App
