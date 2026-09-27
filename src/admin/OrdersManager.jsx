import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Search, Filter, Eye, X, CheckCircle, Clock, Package, Truck, Check, XCircle, Phone, MessageCircle, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdateLoading(true);
      const updates = { status: newStatus };
      
      // Update timestamps based on status
      const now = new Date().toISOString();
      if (newStatus === 'confirmed') updates.confirmed_at = now;
      if (newStatus === 'completed') updates.completed_at = now;
      if (newStatus === 'cancelled') updates.cancelled_at = now;

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, ...updates } : order
      ));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, ...updates });
      }

      // Insert history
      await supabase.from('order_status_history').insert([{
        order_id: orderId,
        status: newStatus
      }]);


    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'whatsapp_pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'preparing': 'bg-purple-100 text-purple-800',
      'out_for_delivery': 'bg-indigo-100 text-indigo-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    
    const labels = {
      'whatsapp_pending': 'WhatsApp Pending',
      'confirmed': 'Confirmed',
      'preparing': 'Preparing',
      'out_for_delivery': 'Out for Delivery',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product_name.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesFilter = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif text-wine">Orders</h2>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search orders by number, customer, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine focus:border-transparent outline-none transition-shadow"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-wine focus:border-transparent outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="whatsapp_pending">WhatsApp Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wine mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Order Number</th>
                  <th className="py-4 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="py-4 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="py-4 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="py-4 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
                  <th className="py-4 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="py-4 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-medium text-gray-900">{order.order_number}</td>
                    <td className="py-4 px-4">{order.customer_name}</td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{order.product_name}</div>
                        <div className="text-gray-500">Qty: {order.quantity}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium">₹{order.total_price}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{new Date(order.required_delivery_date).toLocaleDateString()}</td>
                    <td className="py-4 px-4">{getStatusBadge(order.status)}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-wine hover:text-wine/80 p-2 rounded-lg hover:bg-wine/5 transition-colors"
                        title="View Details"
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">No orders found.</p>
            <p className="text-gray-400 text-sm mt-1">Orders will appear here once customers checkout.</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <div>
                  <h3 className="text-2xl font-serif text-wine">Order Details</h3>
                  <p className="text-gray-500 text-sm mt-1">{selectedOrder.order_number}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Customer Info */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Customer Details</h4>
                    <div className="space-y-3 text-sm">
                      <p><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-900">{selectedOrder.customer_name}</span></p>
                      {selectedOrder.customer_phone && (
                        <p><span className="text-gray-500">Phone:</span> <span className="font-medium text-gray-900">{selectedOrder.customer_phone}</span></p>
                      )}
                      <p className="flex items-start gap-2">
                        <span className="text-gray-500 min-w-[70px]">Location:</span> 
                        <span className="font-medium text-gray-900 flex-1">{selectedOrder.delivery_location}</span>
                      </p>
                      <p><span className="text-gray-500">Required Date:</span> <span className="font-medium text-gray-900">{new Date(selectedOrder.required_delivery_date).toLocaleDateString()}</span></p>
                      {selectedOrder.special_instructions && (
                        <div>
                          <span className="text-gray-500 block mb-1">Special Instructions:</span>
                          <p className="bg-gray-50 p-3 rounded text-gray-800 italic">{selectedOrder.special_instructions}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Order Summary</h4>
                    <div className="space-y-3 text-sm">
                      <p><span className="text-gray-500">Product:</span> <span className="font-medium text-gray-900">{selectedOrder.product_name}</span></p>
                      {selectedOrder.category_name && <p><span className="text-gray-500">Category:</span> <span className="font-medium text-gray-900">{selectedOrder.category_name}</span></p>}
                      <p><span className="text-gray-500">Unit Price:</span> <span className="font-medium text-gray-900">₹{selectedOrder.unit_price}</span></p>
                      <p><span className="text-gray-500">Quantity:</span> <span className="font-medium text-gray-900">{selectedOrder.quantity}</span></p>
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-lg"><span className="text-gray-500 text-sm mr-2">Total:</span> <span className="font-medium text-wine font-serif">₹{selectedOrder.total_price}</span></p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Status & Timeline</h4>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                        disabled={updateLoading}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-wine focus:border-transparent outline-none disabled:opacity-50"
                      >
                        <option value="whatsapp_pending">WhatsApp Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="flex-1 text-sm space-y-2">
                      <p className="flex justify-between"><span className="text-gray-500">Created:</span> <span>{new Date(selectedOrder.created_at).toLocaleString()}</span></p>
                      {selectedOrder.whatsapp_opened_at && (
                        <p className="flex justify-between"><span className="text-gray-500">WhatsApp Opened:</span> <span>{new Date(selectedOrder.whatsapp_opened_at).toLocaleString()}</span></p>
                      )}
                      {selectedOrder.confirmed_at && (
                        <p className="flex justify-between"><span className="text-gray-500">Confirmed:</span> <span>{new Date(selectedOrder.confirmed_at).toLocaleString()}</span></p>
                      )}
                      {selectedOrder.completed_at && (
                        <p className="flex justify-between"><span className="text-gray-500">Completed:</span> <span>{new Date(selectedOrder.completed_at).toLocaleString()}</span></p>
                      )}
                      {selectedOrder.cancelled_at && (
                        <p className="flex justify-between"><span className="text-gray-500">Cancelled:</span> <span>{new Date(selectedOrder.cancelled_at).toLocaleString()}</span></p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Timeline */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h4>
                      <div className="flex flex-col gap-3">
                        {selectedOrder.customer_phone && (
                          <>
                            <a 
                              href={`https://wa.me/${selectedOrder.customer_phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Hi ${selectedOrder.customer_name}, this is Gift House regarding your order ${selectedOrder.order_number}.\nYour order status is now ${selectedOrder.status.replace(/_/g, ' ')}.\nPlease contact us if you have any questions.`)}`}
                              target="_blank" rel="noopener noreferrer"
                              className="flex items-center justify-center gap-3 px-4 py-3 bg-[#25D366] text-white rounded-lg hover:bg-[#128C7E] transition-colors font-medium text-sm"
                            >
                              <MessageCircle size={18} /> WhatsApp Customer
                            </a>
                            <a 
                              href={`tel:${selectedOrder.customer_phone}`}
                              className="flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                            >
                              <Phone size={18} /> Call Customer
                            </a>
                          </>
                        )}
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(selectedOrder.delivery_location);
                            alert('Address copied!');
                          }}
                          className="flex items-center justify-center gap-3 px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors font-medium text-sm"
                        >
                          <Copy size={18} /> Copy Delivery Address
                        </button>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(selectedOrder.order_number);
                            alert('Order Number copied!');
                          }}
                          className="flex items-center justify-center gap-3 px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors font-medium text-sm"
                        >
                          <Copy size={18} /> Copy Order Number
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Visual Timeline</h4>
                      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                        
                        {['whatsapp_pending', 'confirmed', 'preparing', 'out_for_delivery', 'completed'].map((step, idx) => {
                          const isActive = [
                            'whatsapp_pending', 'confirmed', 'preparing', 'out_for_delivery', 'completed'
                          ].indexOf(selectedOrder.status) >= idx;
                          
                          const isCancelled = selectedOrder.status === 'cancelled';
                          
                          if (isCancelled && idx > 0) return null;
                          
                          const statusLabels = {
                            whatsapp_pending: 'WhatsApp Pending',
                            confirmed: 'Confirmed',
                            preparing: 'Preparing',
                            out_for_delivery: 'Out for Delivery',
                            completed: 'Completed',
                            cancelled: 'Cancelled'
                          };

                          return (
                            <div key={step} className="relative flex items-center justify-between group is-active">
                              <div className={`flex items-center justify-center w-5 h-5 rounded-full border-4 shadow shrink-0 z-10
                                ${isCancelled ? 'bg-red-500 border-red-100' : isActive ? 'bg-wine border-wine/20' : 'bg-gray-300 border-gray-100'}`}>
                              </div>
                              <div className={`w-[calc(100%-2rem)] p-3 rounded-lg border ${isActive || (isCancelled && idx === 0) ? 'border-wine/30 bg-wine/5 shadow-sm' : 'border-gray-100 bg-white'}`}>
                                <div className="flex items-center justify-between space-x-2">
                                  <div className={`font-medium text-sm ${isActive ? 'text-wine' : 'text-gray-500'}`}>
                                    {isCancelled ? 'Cancelled' : statusLabels[step]}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersManager;
