import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Gift, 
  MessageSquare, 
  Settings, 
  LogOut,
  ExternalLink,
  Loader2,
  ShoppingCart,
  X
} from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const { user, isAdmin, isAuthLoading, isAdminLoading, logout, settings } = useAdmin();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    console.log("[ADMIN] route mounted");
  }, []);

  // Close mobile menu when navigating
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (isAuthLoading) {
    console.log("[ADMIN] rendering Loading Admin...");
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 flex-col">
        <Loader2 className="w-8 h-8 text-wine animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Loading Admin...</p>
      </div>
    );
  }

  if (!user) {
    console.log("[ADMIN] rendering login (redirect)");
    return <Navigate to="/admin/login" replace />;
  }

  if (isAdminLoading) {
    console.log("[ADMIN] rendering Verifying admin access...");
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 flex-col">
        <Loader2 className="w-8 h-8 text-wine animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Verifying admin access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    console.log("[ADMIN] rendering access denied");
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 flex-col p-4 text-center">
        <h2 className="text-3xl font-bold text-red-600 mb-4 font-serif">Access Denied</h2>
        <p className="text-gray-600 mb-8 max-w-md">You do not have administrator privileges to access this area. Please contact the site owner if you believe this is an error.</p>
        <button 
          onClick={logout}
          className="px-8 py-3 bg-wine text-white rounded-lg hover:bg-wine/90 transition-colors shadow-sm font-medium"
        >
          Logout & Return to Site
        </button>
      </div>
    );
  }

  console.log("[ADMIN] rendering dashboard");

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingCart size={20} /> },
    { name: 'Products', path: '/admin/products', icon: <Package size={20} /> },
    { name: 'Categories', path: '/admin/categories', icon: <Tags size={20} /> },
    { name: 'Occasions', path: '/admin/occasions', icon: <Gift size={20} /> },
    { name: 'Testimonials', path: '/admin/testimonials', icon: <MessageSquare size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between md:justify-center">
          <h1 className="text-2xl font-serif text-wine font-semibold tracking-wide">
            {settings?.businessName || 'Gift House'}
          </h1>
          <button 
            className="md:hidden text-gray-500"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-wine text-white shadow-md shadow-wine/20' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.icon}
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors text-sm font-medium"
          >
            <ExternalLink size={20} />
            <span>Preview Website</span>
          </a>
          <button 
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between md:hidden">
          <h1 className="text-xl font-serif text-wine font-semibold">
            {settings?.businessName || 'Gift House'}
          </h1>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
          <div className="max-w-6xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
