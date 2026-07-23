import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Users, 
  Plane, 
  Edit, 
  Trash2, 
  Plus, 
  X,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import axios from 'axios';
import API_BASE from '../config/api';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State for data
  const [stats, setStats] = useState({ totalUsers: 0, totalFlights: 0, totalBookings: 0 });
  const [usersList, setUsersList] = useState([]);
  const [flights, setFlights] = useState([]);
  const [airports, setAirports] = useState([]);
  
  // Loading & error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Forms & Modals state
  const [showAddFlight, setShowAddFlight] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [flightForm, setFlightForm] = useState({
    flight_number: '',
    departure_airport_id: '',
    arrival_airport_id: '',
    departure_time: '',
    arrival_time: '',
    price: '',
    total_seats: ''
  });

  const getHeaders = () => {
    const token = localStorage.getItem('kangaroo_access_token');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  const showMessage = (type, msg) => {
    if (type === 'error') setError(msg);
    if (type === 'success') setSuccess(msg);
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 3000);
  };

  useEffect(() => {
    if (user?.role?.toLowerCase() !== 'admin') return;
    
    if (activeTab === 'dashboard') {
      fetchStats();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'flights') {
      fetchFlights();
      fetchAirports();
    }
  }, [activeTab, user]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/stats`, getHeaders());
      setStats({
        totalUsers: res.data.totalUsers || res.data.total_users || 0,
        totalFlights: res.data.totalFlights || res.data.total_flights || 0,
        totalBookings: res.data.totalBookings || res.data.total_bookings || 0
      });
    } catch (err) {
      console.error(err);
      showMessage('error', 'Không thể tải thống kê');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/users`, getHeaders());
      setUsersList(res.data);
    } catch (err) {
      console.error(err);
      showMessage('error', 'Không thể tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFlights = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/flights`, getHeaders());
      setFlights(res.data);
    } catch (err) {
      console.error(err);
      showMessage('error', 'Không thể tải danh sách chuyến bay');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAirports = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/airports`, getHeaders());
      setAirports(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await axios.put(`${API_BASE}/api/admin/users/${userId}`, { role: newRole }, getHeaders());
      showMessage('success', 'Cập nhật quyền thành công');
      fetchUsers();
    } catch (err) {
      console.error(err);
      showMessage('error', 'Lỗi khi cập nhật quyền');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    try {
      await axios.delete(`${API_BASE}/api/admin/users/${userId}`, getHeaders());
      showMessage('success', 'Xóa người dùng thành công');
      fetchUsers();
    } catch (err) {
      console.error(err);
      showMessage('error', 'Lỗi khi xóa người dùng');
    }
  };

  const handleFlightSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        flight_number: flightForm.flight_number,
        departure_airport_id: parseInt(flightForm.departure_airport_id),
        arrival_airport_id: parseInt(flightForm.arrival_airport_id),
        departure_time: flightForm.departure_time,
        arrival_time: flightForm.arrival_time,
        price: parseFloat(flightForm.price),
        total_seats: parseInt(flightForm.total_seats)
      };

      if (editingFlight) {
        await axios.put(`${API_BASE}/api/admin/flights/${editingFlight.id}`, payload, getHeaders());
        showMessage('success', 'Cập nhật chuyến bay thành công');
        setEditingFlight(null);
      } else {
        await axios.post(`${API_BASE}/api/flights`, payload, getHeaders());
        showMessage('success', 'Thêm chuyến bay thành công');
        setShowAddFlight(false);
      }
      
      setFlightForm({
        flight_number: '',
        departure_airport_id: '',
        arrival_airport_id: '',
        departure_time: '',
        arrival_time: '',
        price: '',
        total_seats: ''
      });
      fetchFlights();
    } catch (err) {
      console.error(err);
      showMessage('error', 'Lỗi khi lưu chuyến bay');
    }
  };

  const handleEditFlightClick = (flight) => {
    setEditingFlight(flight);
    const formatForInput = (dateStr) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    };

    setFlightForm({
      flight_number: flight.flight_number || '',
      departure_airport_id: flight.departure_airport_id || flight.departure_airport?.id || '',
      arrival_airport_id: flight.arrival_airport_id || flight.arrival_airport?.id || '',
      departure_time: formatForInput(flight.departure_time),
      arrival_time: formatForInput(flight.arrival_time),
      price: flight.price || '',
      total_seats: flight.total_seats || ''
    });
  };

  const handleDeleteFlight = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chuyến bay này?')) return;
    try {
      await axios.delete(`${API_BASE}/api/admin/flights/${id}`, getHeaders());
      showMessage('success', 'Xóa chuyến bay thành công');
      fetchFlights();
    } catch (err) {
      console.error(err);
      showMessage('error', 'Lỗi khi xóa chuyến bay');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFlightForm(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-12 px-4 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Đang tải...</h2>
          <p className="text-slate-500 dark:text-slate-400">Vui lòng đợi trong khi xác thực quyền truy cập.</p>
        </div>
      </div>
    )
  }

  if (user?.role?.toLowerCase() !== 'admin') {
    return (
      <div className="min-h-screen pt-28 pb-12 px-4 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl text-center max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Truy cập bị từ chối</h2>
          <p className="text-slate-500 dark:text-slate-400">Bạn không có quyền truy cập trang quản trị này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Bảng Điều Khiển</h1>
            <p className="text-slate-500 dark:text-slate-400">Quản lý hệ thống Kangaroo Airlines</p>
          </div>
          
          <div className="flex bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
              <BarChart className="w-5 h-5" />
              <span className="hidden sm:inline">Tổng quan</span>
            </button>
            <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${activeTab === 'users' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
              <Users className="w-5 h-5" />
              <span className="hidden sm:inline">Người dùng</span>
            </button>
            <button onClick={() => setActiveTab('flights')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${activeTab === 'flights' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
              <Plane className="w-5 h-5" />
              <span className="hidden sm:inline">Chuyến bay</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 p-4 rounded-2xl bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center gap-3 font-semibold">
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6 p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center gap-3 font-semibold">
              <CheckCircle2 className="w-5 h-5" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading && (
          <div className="flex justify-center my-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}

        {!isLoading && activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-[2rem] text-white shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"><Users className="w-8 h-8" /></div>
                <h3 className="text-xl font-bold opacity-90">Tổng Người Dùng</h3>
              </div>
              <p className="text-5xl font-black">{stats.totalUsers}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-8 rounded-[2rem] text-white shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"><Plane className="w-8 h-8" /></div>
                <h3 className="text-xl font-bold opacity-90">Tổng Chuyến Bay</h3>
              </div>
              <p className="text-5xl font-black">{stats.totalFlights}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-8 rounded-[2rem] text-white shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"><BarChart className="w-8 h-8" /></div>
                <h3 className="text-xl font-bold opacity-90">Tổng Đặt Chỗ</h3>
              </div>
              <p className="text-5xl font-black">{stats.totalBookings}</p>
            </div>
          </motion.div>
        )}

        {!isLoading && activeTab === 'users' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-4 text-slate-500 dark:text-slate-400 font-bold uppercase text-sm">ID</th>
                    <th className="px-6 py-4 text-slate-500 dark:text-slate-400 font-bold uppercase text-sm">Username</th>
                    <th className="px-6 py-4 text-slate-500 dark:text-slate-400 font-bold uppercase text-sm">Email</th>
                    <th className="px-6 py-4 text-slate-500 dark:text-slate-400 font-bold uppercase text-sm">Vai trò</th>
                    <th className="px-6 py-4 text-slate-500 dark:text-slate-400 font-bold uppercase text-sm">Ngày tạo</th>
                    <th className="px-6 py-4 text-slate-500 dark:text-slate-400 font-bold uppercase text-sm text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">#{u.id}</td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{u.username}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(u.createdAt || u.created_at).toLocaleDateString('vi-VN')}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleToggleRole(u.id, u.role)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors" title="Đổi vai trò"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteUser(u.id)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" disabled={u.id === user.id} title="Xóa"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {usersList.length === 0 && <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">Không có dữ liệu</td></tr>}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {!isLoading && activeTab === 'flights' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-6">
              {!showAddFlight && (
                <button onClick={() => setShowAddFlight(true)} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-1">
                  <Plus className="w-5 h-5" /> Thêm chuyến bay mới
                </button>
              )}
              <AnimatePresence>
                {showAddFlight && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 mb-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">Thêm chuyến bay mới</h3>
                        <button onClick={() => setShowAddFlight(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                      </div>
                      <form onSubmit={handleFlightSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Số hiệu</label><input type="text" name="flight_number" value={flightForm.flight_number} onChange={handleInputChange} required placeholder="VD: VN100" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" /></div>
                        <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Giá vé (VNĐ)</label><input type="number" name="price" value={flightForm.price} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" /></div>
                        <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Sân bay đi</label><select name="departure_airport_id" value={flightForm.departure_airport_id} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"><option value="">Chọn</option>{airports.map(a => <option key={a.id} value={a.id}>{a.code} - {a.city}</option>)}</select></div>
                        <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Sân bay đến</label><select name="arrival_airport_id" value={flightForm.arrival_airport_id} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"><option value="">Chọn</option>{airports.map(a => <option key={a.id} value={a.id}>{a.code} - {a.city}</option>)}</select></div>
                        <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">TG Khởi hành</label><input type="datetime-local" name="departure_time" value={flightForm.departure_time} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" /></div>
                        <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">TG Đến</label><input type="datetime-local" name="arrival_time" value={flightForm.arrival_time} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" /></div>
                        <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tổng số ghế</label><input type="number" name="total_seats" value={flightForm.total_seats} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" /></div>
                        <div className="md:col-span-2 mt-4 flex justify-end gap-3"><button type="button" onClick={() => setShowAddFlight(false)} className="px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Hủy</button><button type="submit" className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md hover:shadow-lg transition-all">Lưu chuyến bay</button></div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                      <th className="px-6 py-4 text-slate-500 dark:text-slate-400 font-bold uppercase text-sm">Số hiệu</th>
                      <th className="px-6 py-4 text-slate-500 dark:text-slate-400 font-bold uppercase text-sm">Hành trình</th>
                      <th className="px-6 py-4 text-slate-500 dark:text-slate-400 font-bold uppercase text-sm">Khởi hành</th>
                      <th className="px-6 py-4 text-slate-500 dark:text-slate-400 font-bold uppercase text-sm">Giá vé</th>
                      <th className="px-6 py-4 text-slate-500 dark:text-slate-400 font-bold uppercase text-sm">Số ghế</th>
                      <th className="px-6 py-4 text-slate-500 dark:text-slate-400 font-bold uppercase text-sm text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flights.map((f) => {
                      const depCode = f.departure_airport?.code || f.departure_airport_id;
                      const arrCode = f.arrival_airport?.code || f.arrival_airport_id;
                      return (
                      <tr key={f.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white"><div className="flex items-center gap-2"><Plane className="w-4 h-4 text-blue-500" />{f.flight_number}</div></td>
                        <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{depCode} → {arrCode}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{new Date(f.departure_time).toLocaleString('vi-VN')}</td>
                        <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">{f.price.toLocaleString('vi-VN')} ₫</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{f.total_seats}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEditFlightClick(f)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors" title="Sửa"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteFlight(f.id)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    )})}
                    {flights.length === 0 && <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">Không có dữ liệu</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {editingFlight && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Cập nhật chuyến bay {editingFlight.flight_number}</h3>
                <button onClick={() => setEditingFlight(null)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleFlightSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Số hiệu</label><input type="text" name="flight_number" value={flightForm.flight_number} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" /></div>
                <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Giá vé (VNĐ)</label><input type="number" name="price" value={flightForm.price} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" /></div>
                <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Sân bay đi</label><select name="departure_airport_id" value={flightForm.departure_airport_id} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"><option value="">Chọn</option>{airports.map(a => <option key={a.id} value={a.id}>{a.code} - {a.city}</option>)}</select></div>
                <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Sân bay đến</label><select name="arrival_airport_id" value={flightForm.arrival_airport_id} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"><option value="">Chọn</option>{airports.map(a => <option key={a.id} value={a.id}>{a.code} - {a.city}</option>)}</select></div>
                <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">TG Khởi hành</label><input type="datetime-local" name="departure_time" value={flightForm.departure_time} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" /></div>
                <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">TG Đến</label><input type="datetime-local" name="arrival_time" value={flightForm.arrival_time} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" /></div>
                <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tổng số ghế</label><input type="number" name="total_seats" value={flightForm.total_seats} onChange={handleInputChange} required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" /></div>
                
                <div className="md:col-span-2 mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button type="button" onClick={() => setEditingFlight(null)} className="px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Hủy</button>
                  <button type="submit" className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md hover:shadow-lg transition-all">Cập nhật</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
