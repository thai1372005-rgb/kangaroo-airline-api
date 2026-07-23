import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Download, Eye, Calendar, DollarSign, CheckCircle2, AlertCircle, Filter, Search, ArrowRight, Printer, FileText } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext' // <-- Thêm import

const TransactionHistory = () => {
  const navigate = useNavigate()
  const { user, getUserTickets, getUserTransfers, getUserInvoices } = useAuth()
  const { t, formatPrice, convertPrice, formatPriceWithCode } = useI18n() // <-- Lấy các hàm

  // ==========================================
  // 1. STATE QUẢN LÝ
  // ==========================================
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all' | 'flight' | 'transfer'
  const [filterStatus, setFilterStatus] = useState('all') // 'all' | 'CONFIRMED' | 'PAID'
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [sortBy, setSortBy] = useState('date-desc') // 'date-desc' | 'date-asc' | 'amount-desc'

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
      const tickets = getUserTickets()
      const transfers = getUserTransfers()
      const invoices = getUserInvoices()

      // Kết hợp tất cả giao dịch
      const allTransactions = [
        ...tickets.map(ticket => ({
          ...ticket,
          type: 'flight',
          transactionType: `✈️ ${t('flightTickets') || 'Vé Máy Bay'}`,
          amount: ticket.finalPrice,
          date: ticket.issueDate,
          status: ticket.status,
          description: `${ticket.flight.departure_airport?.code} → ${ticket.flight.arrival_airport?.code}`
        })),
        ...transfers.map(transfer => ({
          ...transfer,
          type: 'transfer',
          transactionType: `🚕 ${t('transferService') || 'Dịch vụ Đưa Đón'}`,
          amount: transfer.price,
          date: transfer.issueDate || transfer.bookingDate,
          status: transfer.status,
          description: `${transfer.pickupLocation} → ${transfer.dropoffLocation}`
        }))
      ]

      // Sắp xếp theo ngày (mới nhất trước)
      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))
      setTransactions(allTransactions)
    }

    setLoading(false)
  }, [navigate, user, getUserTickets, getUserTransfers, getUserInvoices, t])

  // ==========================================
  // 3. FILTER & SEARCH LOGIC
  // ==========================================
  useEffect(() => {
    let filtered = transactions

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType)
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus)
    }

    // Sort
    if (sortBy === 'date-asc') {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date))
    } else if (sortBy === 'date-desc') {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
    } else if (sortBy === 'amount-desc') {
      filtered.sort((a, b) => b.amount - a.amount)
    }

    setFilteredTransactions(filtered)
  }, [searchTerm, filterType, filterStatus, sortBy, transactions])

  // ==========================================
  // 4. RENDER RECEIPT MODAL
  // ==========================================
  const renderReceipt = (transaction) => {
    const isFlightType = transaction.type === 'flight'

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center border-b-2 border-dashed border-slate-300 dark:border-slate-600 pb-6">
          <div className="text-4xl mb-2">🎫</div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t('eReceipt') || 'Biên Lai Điện Tử'}</h2>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2">
            {transaction.bookingReference}
          </p>
        </div>

        {/* Transaction Info */}
        <div className="grid grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900 p-6 rounded-xl">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t('transType') || 'Loại giao dịch'}</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{transaction.transactionType}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t('ticketStatus') || 'Trạng thái'}</p>
            <div className="flex items-center gap-2">
              {transaction.status === 'CONFIRMED' || transaction.status === 'PAID' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-black text-green-600">{t('successStatus') || 'Thành công'}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="font-black text-yellow-600">{transaction.status}</span>
                </>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t('dateLabel') || 'Ngày'}</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{transaction.date}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t('timeLabel') || 'Giờ'}</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {transaction.bookingTime || new Date().toLocaleTimeString('vi-VN')}
            </p>
          </div>
        </div>

        {/* Details */}
        {isFlightType ? (
          <div className="space-y-4">
            <h3 className="font-black text-lg text-slate-900 dark:text-white">✈️ {t('flightDetails') || 'Chi tiết chuyến bay'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-2">{t('departureFlight') || 'Chuyến đi'}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {transaction.flight.departure_airport?.code || 'SGN'}
                </p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2">
                  {transaction.flight.departure_time}
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase mb-2">{t('arrivalPoint') || 'Điểm đến'}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {transaction.flight.arrival_airport?.code || 'HAN'}
                </p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2">
                  {transaction.flight.arrival_time}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-center">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('flightNumber') || 'Chuyến bay'}</p>
                <p className="font-black text-slate-900 dark:text-white mt-1">{transaction.flight.flight_number}</p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-center">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('duration') || 'Thời gian'}</p>
                <p className="font-black text-slate-900 dark:text-white mt-1">{transaction.flight.duration}</p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-center">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('seat') || 'Ghế'}</p>
                <p className="font-black text-blue-600 mt-1">{transaction.seats?.join(', ') || '-'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-black text-lg text-slate-900 dark:text-white">🚕 {t('transferDetails') || 'Chi tiết dịch vụ đưa đón'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-2">{t('pickupLocation') || 'Điểm đón'}</p>
                <p className="font-black text-slate-900 dark:text-white">{transaction.pickupLocation}</p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2">
                  {transaction.pickupDate} - {transaction.pickupTime}
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase mb-2">{t('dropoffLocation') || 'Điểm trả'}</p>
                <p className="font-black text-slate-900 dark:text-white">{transaction.dropoffLocation}</p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2">
                  {transaction.passengerCount} {t('passengers') || 'hành khách'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Amount */}
        <div className="border-t-2 border-dashed border-slate-300 dark:border-slate-600 pt-6">
          <div className="text-center">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">{t('totalAmount') || 'TỔNG TIỀN'}</p>
            <p className="text-4xl font-black text-blue-600 dark:text-orange-400">
              {formatPriceWithCode(convertPrice(transaction.amount))}
            </p>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">{t('paymentMethod') || 'Phương thức thanh toán'}</p>
          <p className="font-black text-slate-900 dark:text-white">
            {transaction.paymentMethod?.includes('bank')
              ? `🏦 ${t('bankTransfer') || 'Chuyển khoản ngân hàng'}`
              : transaction.paymentMethod === 'qr'
              ? `📱 ${t('scanQR') || 'QR Code'}`
              : `💵 ${t('cashPayment') || 'Tiền mặt'}`}
          </p>
          {transaction.paymentMethod?.includes('bank') && (
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mt-2">
              {t('bankName') || 'Ngân hàng'}: {transaction.paymentMethod.split('-')[1]?.toUpperCase() || 'VCB'}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="text-center border-t border-slate-300 dark:border-slate-600 pt-6">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {t('thankYouMsg') || 'Cảm ơn bạn đã sử dụng dịch vụ của Kangaroo Airline'}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            {t('receiptIssuer') || 'Biên lai này được phát hành bởi Kangaroo Airline'} • {new Date().toLocaleDateString('vi-VN')}
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 pt-28">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-bold">{t('loadingTransactions') || 'Đang tải lịch sử giao dịch...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4 pt-28 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* === HEADER === */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-3">
            <CreditCard className="w-10 h-10 text-blue-600" />
            {t('transactionHistory') || 'Lịch sử giao dịch'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-bold">
            {filteredTransactions.length} {t('transactionsCount') || 'giao dịch'} • {t('totalLabel') || 'Tổng'}: {formatPriceWithCode(convertPrice(filteredTransactions.reduce((sum, t) => sum + t.amount, 0)))}
          </p>
        </motion.div>

        {/* === SEARCH & FILTER === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-4 gap-4 mb-8"
        >
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={t('searchTransactions') || "Tìm kiếm mã booking hoặc địa điểm..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:border-blue-600 outline-none transition-all"
            />
          </div>

          {/* Filter Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:border-blue-600 outline-none transition-all"
          >
            <option value="all">{t('allTypes') || 'Tất cả loại'}</option>
            <option value="flight">✈️ {t('flightTickets') || 'Vé máy bay'}</option>
            <option value="transfer">🚕 {t('transferService') || 'Dịch vụ đưa đón'}</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:border-blue-600 outline-none transition-all"
          >
            <option value="date-desc">{t('newestFirst') || 'Mới nhất trước'}</option>
            <option value="date-asc">{t('oldestFirst') || 'Cũ nhất trước'}</option>
            <option value="amount-desc">{t('highestPrice') || 'Giá cao nhất'}</option>
          </select>
        </motion.div>

        {/* === TRANSACTIONS LIST === */}
        {filteredTransactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <CreditCard className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t('noTransactions') || 'Không có giao dịch'}</h2>
            <p className="text-slate-600 dark:text-slate-400 font-bold mb-8">{t('bookToSeeHistory') || 'Hãy đặt vé để có lịch sử giao dịch'}</p>
            <button
              onClick={() => navigate('/flights')}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-xl transition-all hover:shadow-lg active:scale-95"
            >
              {t('bookNowButton') || 'Đặt vé ngay'} <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700"
                >
                  <div className="grid md:grid-cols-5 gap-6 items-center">
                    {/* Type & Ref */}
                    <div>
                      <p className="text-3xl mb-2">{transaction.type === 'flight' ? '✈️' : '🚕'}</p>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('bookingCode') || 'Mã booking'}</p>
                      <p className="font-black text-slate-900 dark:text-white">{transaction.bookingReference}</p>
                    </div>

                    {/* Description */}
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t('details') || 'Chi tiết'}</p>
                      <p className="font-black text-slate-900 dark:text-white">{transaction.description}</p>
                    </div>

                    {/* Date */}
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t('dateLabel') || 'Ngày'}</p>
                      <p className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {transaction.date}
                      </p>
                    </div>

                    {/* Amount */}
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">{t('priceLabel') || 'Giá'}</p>
                      <p className="text-xl font-black text-blue-600 dark:text-orange-400">
                        {formatPriceWithCode(convertPrice(transaction.amount))}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedReceipt(transaction)}
                        className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2"
                        title={t('viewReceipt') || "Xem biên lai"}
                      >
                        <Eye className="w-5 h-5" />
                        <span className="hidden sm:inline">{t('receipt') || 'Biên lai'}</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.print()}
                        className="px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-black rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
                        title={t('printReceipt') || "In biên lai"}
                      >
                        <Printer className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* === RECEIPT MODAL === */}
      <AnimatePresence>
        {selectedReceipt && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReceipt(null)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-50"
            >
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
                {renderReceipt(selectedReceipt)}

                {/* Action Buttons */}
                <div className="mt-8 flex gap-3 border-t border-slate-200 dark:border-slate-700 pt-6">
                  <button
                    onClick={() => {
                      window.print()
                    }}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Printer className="w-5 h-5" />
                    {t('printReceipt') || 'In biên lai'}
                  </button>
                  <button
                    onClick={() => setSelectedReceipt(null)}
                    className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-black rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                  >
                    {t('close') || 'Đóng'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TransactionHistory