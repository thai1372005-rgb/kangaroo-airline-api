import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Plane, MapPin, Calendar, Users, Trash2, FileText, AlertCircle, CheckCircle2, Download, CreditCard, QrCode } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'

const MyTickets = () => {
  const navigate = useNavigate()
  const { user, getUserTickets, getUserTransfers, getUserInvoices, deleteTicket, deleteTransfer } = useAuth()
  const { t, formatPrice } = useI18n()

  // ==========================================
  // 1. STATE QUẢN LÝ
  // ==========================================
  const [activeTab, setActiveTab] = useState('flights') // 'flights' | 'transfers'
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState([])
  const [transfers, setTransfers] = useState([])
  const [invoices, setInvoices] = useState([])
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, id: null })
  const [invoiceModal, setInvoiceModal] = useState({ isOpen: false, invoiceId: null })

  // ==========================================
  // 2. KIỂM TRA ĐĂNG NHẬP & LẤY DỮ LIỆU
  // ==========================================
  useEffect(() => {
    const hasToken = localStorage.getItem('kangaroo_token')
    if (!hasToken) {
      navigate('/login')
      return
    }

    if (user) {
      setTickets(getUserTickets())
      setTransfers(getUserTransfers())
      setInvoices(getUserInvoices())
    }

    setLoading(false)
  }, [navigate, user, getUserTickets, getUserTransfers, getUserInvoices])

  // ==========================================
  // 3. HÀM XỬ LÝ XÓA
  // ==========================================
  const handleDelete = (type, id) => {
    setDeleteModal({ isOpen: true, type, id })
  }

  const confirmDelete = async () => {
    const { type, id } = deleteModal

    if (type === 'flight') {
      deleteTicket(id)
      setTickets(tickets.filter(tk => tk.id !== id))
    } else if (type === 'transfer') {
      deleteTransfer(id)
      setTransfers(transfers.filter(tr => tr.id !== id))
    }

    setDeleteModal({ isOpen: false, type: null, id: null })
  }

  // ==========================================
  // 4. HÀM DOWNLOAD/XEM HÓA ĐƠN
  // ==========================================
  const handleDownloadInvoice = (invoice) => {
    alert(`📥 Hóa đơn ${invoice.id} đã được tải!\n\nGửi tới email: ${user?.email}`)
  }

  const handleDownloadTicket = (ticket) => {
    alert(`📥 Vé ${ticket.bookingReference} đã được tải!\n\nGửi tới email: ${user?.email}`)
  }

  const viewInvoice = (invoiceId) => {
    setInvoiceModal({ isOpen: true, invoiceId })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 pt-28">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-bold">Đang tải vé của bạn...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4 pt-28 transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* === HEADER === */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-3">
            <Plane className="w-10 h-10 text-blue-600" />
            {t('myTickets')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-bold">
            {tickets.length + transfers.length > 0
              ? `Bạn có ${tickets.length + transfers.length} vé đã đặt`
              : t('noTickets')}
          </p>
        </motion.div>

        {/* === TABS === */}
        <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('flights')}
            className={`px-6 py-4 font-black text-lg transition-all border-b-4 ${
              activeTab === 'flights'
                ? 'border-blue-600 text-blue-600 dark:text-orange-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Plane className="w-5 h-5 inline mr-2" />
            {t('flightTickets')} ({tickets.length})
          </button>

          <button
            onClick={() => setActiveTab('transfers')}
            className={`px-6 py-4 font-black text-lg transition-all border-b-4 ${
              activeTab === 'transfers'
                ? 'border-blue-600 text-blue-600 dark:text-orange-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-5 h-5 inline mr-2" />
            {t('transferTickets')} ({transfers.length})
          </button>
        </div>

        {/* === TAB: FLIGHT TICKETS === */}
        <AnimatePresence mode="wait">
          {activeTab === 'flights' && (
            <motion.div
              key="flights"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {tickets.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Plane className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                    Chưa có vé máy bay
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 font-bold mb-8">
                    Hãy tìm kiếm và đặt vé máy bay ngay!
                  </p>
                  <button
                    onClick={() => navigate('/flights')}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-xl transition-all hover:shadow-lg active:scale-95"
                  >
                    {t('search')} <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {tickets.map((ticket, index) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="group"
                    >
                      {/* === BOARDING PASS DESIGN === */}
                      <div className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-3xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-slate-200 dark:border-slate-600">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-5">
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 20px)`,
                            }}
                          ></div>
                        </div>

                        {/* Main Content */}
                        <div className="relative p-8">
                          {/* --- TOP SECTION: TICKET TYPE & STATUS --- */}
                          <div className="flex items-center justify-between mb-8 pb-8 border-b-2 border-dashed border-slate-300 dark:border-slate-600">
                            <div className="flex items-center gap-4">
                              <div className={`px-4 py-2 rounded-xl font-black text-sm ${
                                ticket.ticketType === 'round-trip'
                                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              }`}>
                                {ticket.ticketType === 'round-trip' ? '🔄 KHỨ HỒI' : '➡️ MỘT CHIỀU'}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Mã đặt chỗ</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white tracking-widest">
                                  {ticket.bookingReference}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Trạng thái</p>
                              <div className="flex items-center gap-2 justify-end mt-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <p className="text-lg font-black text-green-600 dark:text-green-400">{ticket.status}</p>
                              </div>
                            </div>
                          </div>

                          {/* --- FLIGHT DETAILS --- */}
                          <div className="grid lg:grid-cols-2 gap-12 mb-8">
                            {/* Outbound Flight */}
                            <div className="space-y-6">
                              <div className="flex items-end justify-between gap-4">
                                <div>
                                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Chuyến đi</p>
                                  <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {ticket.flight.departure_airport?.code || 'SGN'}
                                  </p>
                                </div>

                                <div className="flex-1 flex flex-col items-center gap-2 pb-1">
                                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                    {ticket.flight.departure_time}
                                  </p>
                                  <Plane className="w-6 h-6 text-blue-600 rotate-90" />
                                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                    {ticket.flight.arrival_time}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Điểm đến</p>
                                  <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {ticket.flight.arrival_airport?.code || 'HAN'}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-600">
                                <div>
                                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Chuyến</p>
                                  <p className="font-black text-slate-900 dark:text-white text-sm mt-1">
                                    {ticket.flight.flight_number}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Thời gian</p>
                                  <p className="font-black text-slate-900 dark:text-white text-sm mt-1">
                                    {ticket.flight.duration}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Ghế</p>
                                  <p className="font-black text-blue-600 text-sm mt-1">
                                    {ticket.seats.join(', ')}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Return Flight (if round-trip) */}
                            {ticket.ticketType === 'round-trip' && (
                              <div className="space-y-6 lg:border-l border-slate-200 dark:border-slate-600 lg:pl-8">
                                <div className="flex items-end justify-between gap-4">
                                  <div>
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Chuyến về</p>
                                    <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                                      {ticket.flight.arrival_airport?.code || 'HAN'}
                                    </p>
                                  </div>

                                  <div className="flex-1 flex flex-col items-center gap-2 pb-1">
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                      {ticket.flight.return_time}
                                    </p>
                                    <Plane className="w-6 h-6 text-orange-600 rotate-90" />
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                      {ticket.flight.return_arrival_time}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Điểm đến</p>
                                    <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                                      {ticket.flight.departure_airport?.code || 'SGN'}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-600">
                                  <div>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Chuyến</p>
                                    <p className="font-black text-slate-900 dark:text-white text-sm mt-1">
                                      {ticket.flight.return_flight_number}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Thời gian</p>
                                    <p className="font-black text-slate-900 dark:text-white text-sm mt-1">
                                      {ticket.flight.return_duration}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Ghế</p>
                                    <p className="font-black text-blue-600 text-sm mt-1">
                                      {ticket.seats.join(', ')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* --- PASSENGER & PRICE INFO --- */}
                          <div className="grid md:grid-cols-3 gap-6 mb-8 pb-8 border-b-2 border-dashed border-slate-300 dark:border-slate-600">
                            <div>
                              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Hành khách</p>
                              <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
                                {ticket.passengerName}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {ticket.passengerEmail}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Phương thức</p>
                              <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
                                {ticket.paymentMethod === 'bank' ? '🏦 Ngân hàng' : '📱 QR Code'}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Tổng giá</p>
                              <p className="text-2xl font-black text-blue-600 mt-1">
                                {ticket.finalPrice.toLocaleString('vi-VN')} ₫
                              </p>
                              {ticket.discountAmount > 0 && (
                                <p className="text-xs text-green-600 dark:text-green-400 font-bold mt-1">
                                  Tiết kiệm: {ticket.discountAmount.toLocaleString('vi-VN')} ₫
                                </p>
                              )}
                            </div>
                          </div>

                          {/* --- BARCODE & QR SECTION --- */}
                          <div className="grid md:grid-cols-2 gap-8 mb-6">
                            {/* QR Code */}
                            <div className="flex flex-col items-center gap-3">
                              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">QR Code</p>
                              <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-600 border-4 border-slate-300 dark:border-slate-500 rounded-2xl flex items-center justify-center">
                                <QrCode className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold text-center">
                                {ticket.barcode}
                              </p>
                            </div>

                            {/* Barcode */}
                            <div className="flex flex-col items-center gap-3">
                              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Barcode</p>
                              <div className="w-full h-20 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-600 border-4 border-slate-300 dark:border-slate-500 rounded-2xl flex items-center justify-center">
                                <div className="flex gap-0.5 h-10">
                                  {Array.from({ length: 30 }).map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-1 h-full ${i % 3 === 0 ? 'bg-slate-900 dark:bg-white' : 'bg-transparent'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold font-mono">
                                {ticket.id.substring(0, 12).toUpperCase()}
                              </p>
                            </div>
                          </div>

                          {/* --- ACTION BUTTONS --- */}
                          <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-600">
                            <button
                              onClick={() => viewInvoice(ticket.invoiceId)}
                              className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-black rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                              <FileText className="w-5 h-5" />
                              {t('viewInvoice')}
                            </button>

                            <button
                              onClick={() => handleDownloadTicket(ticket)}
                              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-xl transition-all hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                            >
                              <Download className="w-5 h-5" />
                              Tải vé
                            </button>

                            <button
                              onClick={() => handleDelete('flight', ticket.id)}
                              className="px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-black rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-all active:scale-95"
                              title="Xóa vé"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          {/* --- ISSUE DATE --- */}
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-4 text-center">
                            Ngày phát hành: {ticket.issueDate}
                          </p>
                        </div>

                        {/* Decorative Corner Elements */}
                        <div className="absolute top-0 right-0 w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-bl-3xl -mr-0.5 -mt-0.5"></div>
                        <div className="absolute bottom-0 left-0 w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-tr-3xl -ml-0.5 -mb-0.5"></div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {/* === QUICK ACTIONS === */}
              {tickets.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-12 p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700"
                >
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Hành động khác</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <button
                      onClick={() => navigate('/flights')}
                      className="py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-xl transition-all hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Plane className="w-5 h-5" />
                      Đặt vé thêm
                    </button>

                    <button
                      onClick={() => navigate('/')}
                      className="py-3 px-6 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-black rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
                    >
                      Về trang chủ
                    </button>

                    <button
                      onClick={() => navigate('/transactions')}
                      className="py-3 px-6 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-black rounded-xl transition-all hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-5 h-5" />
                      {t('transactionHistory')}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* === TAB: TRANSFER TICKETS === */}
        <AnimatePresence mode="wait">
          {activeTab === 'transfers' && (
            <motion.div
              key="transfers"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {transfers.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MapPin className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                    Chưa có vé đưa đón
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 font-bold mb-8">
                    Đặt vé đưa đón sân bay ngay!
                  </p>
                  <button
                    onClick={() => navigate('/pickup')}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-xl transition-all hover:shadow-lg active:scale-95"
                  >
                    {t('bookNowTransfer')} <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              ) : (
                transfers.map((transfer) => (
                  <motion.div
                    key={transfer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all"
                  >
                    {/* HEADER */}
                    <div className="flex items-start justify-between mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          {t('bookingReference')}
                        </p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                          {transfer.bookingReference}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            transfer.status === 'CONFIRMED'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          }`}>
                            {transfer.status === 'CONFIRMED' ? '✓ ' + t('confirmed') : '✗ ' + t('cancelled')}
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {transfer.type === 'taxi' ? 'Taxi' : 'Xe Khách'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Ngày
                        </p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{transfer.pickupDate}</p>
                      </div>
                    </div>

                    {/* TRANSFER INFO */}
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Tuyến đường
                        </p>
                        <div className="space-y-2">
                          <p className="text-2xl font-black text-slate-900 dark:text-white">
                            {transfer.pickupLocation} → {transfer.dropoffLocation}
                          </p>
                          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                            {transfer.pickupTime}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Chi tiết
                        </p>
                        <div className="space-y-2">
                          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                            {t('passengers')}: {transfer.passengerCount}
                          </p>
                          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                            {t('passenger')}: {transfer.passengerName}
                          </p>
                          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                            ☎️ {transfer.phoneNumber}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* PRICE */}
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl mb-8">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Giá
                        </p>
                        <p className="text-2xl font-black text-blue-600 dark:text-orange-400">
                          {formatPrice(transfer.price)}
                        </p>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => viewInvoice(transfer.invoiceId)}
                        className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-black rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <FileText className="w-5 h-5" />
                        {t('viewInvoice')}
                      </button>
                      <button
                        onClick={() => handleDelete('transfer', transfer.id)}
                        className="flex-1 px-4 py-3 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-black rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-5 h-5" />
                        {t('deleteTicket')}
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* === MODAL: XÁC NHẬN XÓA === */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModal({ isOpen: false, type: null, id: null })}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-50"
            >
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md shadow-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-2">
                  Bạn có chắc chắn không?
                </h2>
                <p className="text-slate-600 dark:text-slate-400 font-bold text-center mb-8">
                  {deleteModal.type === 'flight' 
                    ? 'Bạn sắp xóa vé máy bay này. Thao tác này không thể hoàn tác.' 
                    : 'Bạn sắp xóa vé dịch vụ đưa đón này. Thao tác này không thể hoàn tác.'}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteModal({ isOpen: false, type: null, id: null })}
                    className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-black rounded-xl transition-all hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    {t('no')}
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl transition-all hover:shadow-lg active:scale-95"
                  >
                    {t('yes')}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* === MODAL: XEM HÓA ĐƠN === */}
      <AnimatePresence>
        {invoiceModal.isOpen && invoices.find(inv => inv.id === invoiceModal.invoiceId) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInvoiceModal({ isOpen: false, invoiceId: null })}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-50"
            >
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
                {(() => {
                  const invoice = invoices.find(inv => inv.id === invoiceModal.invoiceId)
                  if (!invoice) return null

                  return (
                    <div className="space-y-6">
                      <div className="text-center border-b border-slate-200 dark:border-slate-700 pb-6">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Hóa đơn điện tử
                        </p>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white">{invoice.id}</h2>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">NGÀY PHÁT HÀNH</p>
                          <p className="font-black text-slate-900 dark:text-white">{invoice.issueDate}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">NGÀY THANH TOÁN</p>
                          <p className="font-black text-slate-900 dark:text-white">{invoice.paymentDate}</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl">
                        <table className="w-full text-sm">
                          <thead className="border-b border-slate-200 dark:border-slate-700">
                            <tr>
                              <th className="text-left font-black text-slate-900 dark:text-white pb-3">Mô tả</th>
                              <th className="text-center font-black text-slate-900 dark:text-white pb-3">SL</th>
                              <th className="text-right font-black text-slate-900 dark:text-white pb-3">Đơn giá</th>
                              <th className="text-right font-black text-slate-900 dark:text-white pb-3">Tổng</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {invoice.items.map((item, idx) => (
                              <tr key={idx}>
                                <td className="py-3 text-slate-700 dark:text-slate-300 font-bold">{item.description}</td>
                                <td className="text-center text-slate-700 dark:text-slate-300 font-bold">{item.quantity}</td>
                                <td className="text-right text-slate-700 dark:text-slate-300 font-bold">
                                  {formatPrice(item.unitPrice)}
                                </td>
                                <td className="text-right text-slate-700 dark:text-slate-300 font-bold">
                                  {formatPrice(item.total)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="space-y-2 text-right">
                        <div className="flex justify-end gap-4 text-sm font-bold">
                          <span className="text-slate-600 dark:text-slate-400">Cộng:</span>
                          <span className="text-slate-900 dark:text-white w-32">{formatPrice(invoice.subtotal)}</span>
                        </div>
                        <div className="flex justify-end gap-4 text-sm font-bold">
                          <span className="text-slate-600 dark:text-slate-400">Thuế:</span>
                          <span className="text-slate-900 dark:text-white w-32">{formatPrice(invoice.tax)}</span>
                        </div>
                        <div className="flex justify-end gap-4 text-xl font-black border-t border-slate-200 dark:border-slate-700 pt-3">
                          <span className="text-slate-900 dark:text-white">Tổng cộng:</span>
                          <span className="text-blue-600 dark:text-orange-400 w-32">{formatPrice(invoice.total)}</span>
                        </div>
                      </div>

                      {/* === LỊCH SỬ GIAO DỊCH & THANH TOÁN === */}
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">📋 Lịch sử giao dịch & thanh toán</h3>
                        <div className="space-y-3">
                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-black text-green-700 dark:text-green-400">✓ Thanh toán thành công</p>
                                <p className="text-xs text-green-600 dark:text-green-500 font-bold mt-1">
                                  Mã giao dịch: {invoice.transactionId || `TXN-${invoice.id.slice(0, 8)}`}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-green-700 dark:text-green-400">{formatPrice(invoice.total)}</p>
                                <p className="text-xs text-green-600 dark:text-green-500 font-bold mt-1">
                                  {invoice.paymentDate || new Date().toLocaleDateString('vi-VN')}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-green-700 dark:text-green-400 font-bold">
                              Phương thức: {invoice.paymentMethod === 'bank' ? '🏦 Chuyển khoản ngân hàng' : invoice.paymentMethod === 'qr' ? '📱 QR Code' : '💵 Tiền mặt'}
                            </p>
                          </div>

                          {/* Lịch sử chi tiết */}
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white mb-2">Chi tiết đơn hàng:</p>
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-xs font-bold space-y-2">
                              <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Ngày tạo đơn:</span>
                                <span className="text-slate-900 dark:text-white">{invoice.issueDate || new Date().toLocaleDateString('vi-VN')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Loại giao dịch:</span>
                                <span className="text-slate-900 dark:text-white">{invoice.type === 'flight' ? '✈️ Vé máy bay' : '🚕 Dịch vụ đưa đón'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Trạng thái:</span>
                                <span className="text-green-600 dark:text-green-400">✓ Đã thanh toán</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Email xác nhận:</span>
                                <span className="text-slate-900 dark:text-white truncate">{user?.email || 'user@example.com'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => handleDownloadInvoice(invoice)}
                          className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <FileText className="w-5 h-5" />
                          {t('downloadInvoice')}
                        </button>
                        <button
                          onClick={() => setInvoiceModal({ isOpen: false, invoiceId: null })}
                          className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-black rounded-xl transition-all"
                        >
                          Đóng
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MyTickets