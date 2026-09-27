import React, { useState, useEffect, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { 
  Package, CheckCircle, Clock, XCircle, Users, DollarSign, TrendingUp, ShoppingCart, 
  Database, Loader2, Image as ImageIcon, ArrowRight 
} from 'lucide-react';
import { runMigration } from './migrateData';
import { fixBrokenImages } from './fixImages';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Line
} from 'recharts';

const COLORS = ['#8b2233', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];
const REVENUE_STATUSES = ['confirmed', 'preparing', 'out_for_delivery', 'completed'];

const StatCard = ({ title, value, icon, link, color, subtitle }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      {link && (
        <Link to={link} className="text-sm text-wine hover:text-wine/80 font-medium mt-3 inline-flex items-center">
          View Details <ArrowRight size={14} className="ml-1" />
        </Link>
      )}
    </div>
    <div className={`p-4 rounded-full ${color}`}>
      {icon}
    </div>
  </div>
);

const DashboardHome = () => {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [period, setPeriod] = useState('30'); // '7', '30', '365', 'all', 'today'
  
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error("Error fetching orders for analytics:", err);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleMigration = async () => {
    if (!window.confirm('Are you sure you want to migrate demo data to Supabase?')) return;
    setIsMigrating(true);
    setMigrationResult(null);
    try {
      const result = await runMigration();
      setMigrationResult(result);
    } catch (err) {
      alert('Migration error: ' + err.message);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleFixImages = async () => {
    if (!window.confirm('Are you sure you want to fix broken images in Supabase?')) return;
    setIsFixing(true);
    setFixResult(null);
    try {
      const result = await fixBrokenImages();
      setFixResult(result);
    } catch (err) {
      alert('Fix error: ' + err.message);
    } finally {
      setIsFixing(false);
    }
  };


  const filteredOrders = useMemo(() => {
    if (period === 'all') return orders;
    
    const now = new Date();
    let cutoff = new Date();
    
    if (period === 'today') {
      cutoff.setHours(0,0,0,0);
    } else {
      cutoff.setDate(now.getDate() - parseInt(period));
    }
    
    return orders.filter(o => new Date(o.created_at) >= cutoff);
  }, [orders, period]);

  const analytics = useMemo(() => {
    const revenueOrders = filteredOrders.filter(o => REVENUE_STATUSES.includes(o.status));
    const totalRevenue = revenueOrders.reduce((sum, o) => sum + Number(o.total_price), 0);
    
    const pendingOrders = filteredOrders.filter(o => o.status === 'whatsapp_pending');
    const confirmedOrders = filteredOrders.filter(o => o.status === 'confirmed');
    const completedOrders = filteredOrders.filter(o => o.status === 'completed');
    const cancelledOrders = filteredOrders.filter(o => o.status === 'cancelled');

    const uniqueCustomers = new Set(filteredOrders.map(o => o.customer_name?.toLowerCase().trim())).size;

    // Charts Data
    const dateMap = {};
    const revenueMap = {};
    
    filteredOrders.forEach(o => {
      const dateStr = new Date(o.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dateMap[dateStr] = (dateMap[dateStr] || 0) + 1;
      
      if (REVENUE_STATUSES.includes(o.status)) {
        revenueMap[dateStr] = (revenueMap[dateStr] || 0) + Number(o.total_price);
      } else if (!revenueMap[dateStr]) {
        revenueMap[dateStr] = 0;
      }
    });

    const timelineData = Object.keys(dateMap).slice(0, 14).reverse().map(date => ({
      date,
      Orders: dateMap[date] || 0,
      Revenue: revenueMap[date] || 0
    }));

    // Status Data
    const statusCounts = {};
    filteredOrders.forEach(o => {
      const label = o.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      statusCounts[label] = (statusCounts[label] || 0) + 1;
    });
    const statusData = Object.keys(statusCounts).map(name => ({
      name, value: statusCounts[name]
    }));

    // Top Products
    const productSales = {};
    revenueOrders.forEach(o => {
      if (!productSales[o.product_name]) {
        productSales[o.product_name] = { name: o.product_name, revenue: 0, count: 0 };
      }
      productSales[o.product_name].revenue += Number(o.total_price);
      productSales[o.product_name].count += Number(o.quantity);
    });
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Categories Data
    const catSales = {};
    revenueOrders.forEach(o => {
      const cat = o.category_name || 'Uncategorized';
      if (!catSales[cat]) {
        catSales[cat] = { name: cat, revenue: 0 };
      }
      catSales[cat].revenue += Number(o.total_price);
    });
    const categoryData = Object.values(catSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Today's specific numbers
    const todayOrders = orders.filter(o => new Date(o.created_at).setHours(0,0,0,0) === new Date().setHours(0,0,0,0));
    const todayRevOrders = todayOrders.filter(o => REVENUE_STATUSES.includes(o.status));
    const todayRevenue = todayRevOrders.reduce((sum, o) => sum + Number(o.total_price), 0);

    return {
      totalOrders: filteredOrders.length,
      totalRevenue,
      avgOrderValue: revenueOrders.length > 0 ? Math.round(totalRevenue / revenueOrders.length) : 0,
      pending: pendingOrders.length,
      confirmed: confirmedOrders.length,
      completed: completedOrders.length,
      cancelled: cancelledOrders.length,
      uniqueCustomers,
      timelineData,
      statusData,
      topProducts,
      categoryData,
      today: {
        orders: todayOrders.length,
        revenue: todayRevenue,
        completed: todayOrders.filter(o => o.status === 'completed').length,
        awaiting: orders.filter(o => o.status === 'whatsapp_pending' || o.status === 'confirmed').length
      }
    };
  }, [filteredOrders, orders]);

  return (
    <div className="space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-wine">Dashboard & Analytics</h1>
          <p className="text-gray-500 mt-1">Overview of your business performance</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select 
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-wine outline-none bg-white shadow-sm font-medium text-gray-700 text-sm"
          >
            <option value="today">Today</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="365">This Year</option>
            <option value="all">All Time</option>
          </select>
          <button
            onClick={handleFixImages}
            disabled={isFixing}
            className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium shadow-sm transition-all text-sm disabled:opacity-50"
          >
            {isFixing ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
            <span>Fix Images</span>
          </button>
          <button
            onClick={handleMigration}
            disabled={isMigrating}
            className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium shadow-sm transition-all text-sm disabled:opacity-50"
          >
            {isMigrating ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
            <span>Migrate Data</span>
          </button>
        </div>
      </div>

      {fixResult && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg shadow-sm">
          <h3 className="font-bold mb-2">Image Fix Complete</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Occasions checked: {fixResult.occasionsChecked}</li>
            <li>Occasions fixed: {fixResult.occasionsFixed}</li>
            <li>Products checked: {fixResult.productsChecked}</li>
            <li>Products fixed: {fixResult.productsFixed}</li>
          </ul>
        </div>
      )}

      {migrationResult && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg shadow-sm">
          <h3 className="font-bold mb-2">Migration Complete</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Categories inserted: {migrationResult.categories}</li>
            <li>Occasions inserted: {migrationResult.occasions}</li>
            <li>Products inserted: {migrationResult.products}</li>
          </ul>
        </div>
      )}
      
      {ordersLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 text-wine animate-spin" />
        </div>
      ) : (
        <>
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Revenue" 
              value={`₹${analytics.totalRevenue.toLocaleString()}`}
              subtitle="From confirmed/completed orders"
              icon={<TrendingUp size={24} className="text-emerald-600" />} 
              color="bg-emerald-50"
            />
            <StatCard 
              title="Total Orders" 
              value={analytics.totalOrders}
              icon={<ShoppingCart size={24} className="text-blue-600" />} 
              color="bg-blue-50"
              link="/admin/orders"
            />
            <StatCard 
              title="Avg Order Value" 
              value={`₹${analytics.avgOrderValue.toLocaleString()}`}
              icon={<DollarSign size={24} className="text-purple-600" />} 
              color="bg-purple-50"
            />
            <StatCard 
              title="Total Customers" 
              value={analytics.uniqueCustomers}
              icon={<Users size={24} className="text-orange-600" />} 
              color="bg-orange-50"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Breakdown */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Order Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg text-yellow-800">
                  <div className="flex items-center gap-3"><Clock size={18} /> <span className="font-medium">WhatsApp Pending</span></div>
                  <span className="font-bold text-lg">{analytics.pending}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg text-blue-800">
                  <div className="flex items-center gap-3"><CheckCircle size={18} /> <span className="font-medium">Confirmed</span></div>
                  <span className="font-bold text-lg">{analytics.confirmed}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg text-green-800">
                  <div className="flex items-center gap-3"><Package size={18} /> <span className="font-medium">Completed</span></div>
                  <span className="font-bold text-lg">{analytics.completed}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg text-red-800">
                  <div className="flex items-center gap-3"><XCircle size={18} /> <span className="font-medium">Cancelled</span></div>
                  <span className="font-bold text-lg">{analytics.cancelled}</span>
                </div>
              </div>
            </div>

            {/* Timeline Charts */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue & Orders Over Time</h3>
              {analytics.timelineData.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.timelineData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                      <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(value) => `₹${value}`} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} allowDecimals={false} domain={[0, 'auto']} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        cursor={{fill: '#f3f4f6'}}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="Revenue" fill="#8b2233" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="Orders" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center text-gray-400">
                  No chart data available for this period.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Top Performing Products</h3>
              {analytics.topProducts.length > 0 ? (
                <div className="space-y-4">
                  {analytics.topProducts.map((p, i) => (
                    <div key={i} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-wine/10 text-wine flex items-center justify-center font-bold text-sm">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.count} units sold</p>
                        </div>
                      </div>
                      <div className="font-bold text-gray-900">
                        ₹{p.revenue.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">No product sales yet.</div>
              )}
            </div>

            {/* Top Categories */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue by Category</h3>
              {analytics.categoryData.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="revenue"
                      >
                        {analytics.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center text-gray-400">
                  No category data available.
                </div>
              )}
            </div>
          </div>

          {/* Today's Summary & Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-wine text-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-serif mb-6 text-white/90">Today's Summary</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-white/60 text-sm mb-1">Today's Confirmed Revenue</p>
                  <p className="text-3xl font-bold">₹{analytics.today.revenue.toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                  <div>
                    <p className="text-white/60 text-xs mb-1">Orders Received</p>
                    <p className="text-xl font-bold">{analytics.today.orders}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">Awaiting Confirmation</p>
                    <p className="text-xl font-bold">{analytics.today.awaiting}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                <Link to="/admin/orders" className="text-sm font-medium text-wine hover:underline">
                  View All
                </Link>
              </div>
              
              {orders.length > 0 ? (
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-500">
                        <th className="pb-3 font-medium">Order</th>
                        <th className="pb-3 font-medium">Customer</th>
                        <th className="pb-3 font-medium">Amount</th>
                        <th className="pb-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.slice(0, 5).map(order => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 font-medium text-gray-900">{order.order_number}</td>
                          <td className="py-3 text-gray-600">{order.customer_name}</td>
                          <td className="py-3 font-medium text-gray-900">₹{order.total_price}</td>
                          <td className="py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              order.status === 'whatsapp_pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {order.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                  No recent orders to show.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardHome;
