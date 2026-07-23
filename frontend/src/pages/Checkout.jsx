import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Lock, CreditCard, Building2, X, CheckCircle2, AlertCircle, QrCode, Banknote } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'

const Checkout = () => {
  const navigate = useNavigate()
  const { user, addTicket, addInvoice } = useAuth()
  const { t, formatPrice, currency, convertPrice } = useI18n()

  // ==========================================
  // 1. KIỂM TRA ĐĂNG NHẬP & LẤY DỮ LIỆU VÉ
  // ==========================================
  useEffect(() => {
    const hasToken = localStorage.getItem('kangaroo_token')
    if (!hasToken) {
      navigate('/login')
      return
    }

    const draftBooking = localStorage.getItem('draft_booking')
    if (!draftBooking) {
      navigate('/flights')
      return
    }

    try {
      setBookingData(JSON.parse(draftBooking))
    } catch (err) {
      console.error('Lỗi parsing draft_booking:', err)
      navigate('/flights')
    }
  }, [navigate])

  // ==========================================
  // 2. STATE QUẢN LÝ
  // ==========================================
  const [bookingData, setBookingData] = useState(null)
  const [discountCode, setDiscountCode] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)
  const [discountError, setDiscountError] = useState('')
  const [ticketType, setTicketType] = useState('one-way') // 'one-way' | 'round-trip'
  const [paymentMethod, setPaymentMethod] = useState('bank') // 'bank' | 'qr' | 'cash'
  const [selectedBank, setSelectedBank] = useState('vietcombank')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const createBankLogoData = ({ initials, name, start, end }) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 96" role="img" aria-label="${name}"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${start}"/><stop offset="100%" stop-color="${end}"/></linearGradient></defs><rect width="240" height="96" rx="24" fill="url(#g)"/><rect x="14" y="14" width="68" height="68" rx="18" fill="rgba(255,255,255,0.18)"/><text x="48" y="58" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="28" font-weight="700" fill="#fff">${initials}</text><text x="98" y="42" font-family="Arial,Helvetica,sans-serif" font-size="22" font-weight="700" fill="#fff">${name}</text><text x="98" y="66" font-family="Arial,Helvetica,sans-serif" font-size="12" font-weight="600" fill="rgba(255,255,255,0.92)">Vietnam bank</text></svg>`
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
  }

  const BANKS = [
    {
      id: 'vietcombank',
      name: 'Vietcombank',
      code: 'VCB',
      logoUrl: createBankLogoData({ initials: 'VCB', name: 'Vietcombank', start: '#006838', end: '#00a74a' })
    },
    {
      id: 'techcombank',
      name: 'Techcombank',
      code: 'TCB',
      logoUrl: createBankLogoData({ initials: 'TCB', name: 'Techcombank', start: '#e30613', end: '#ff4d4d' })
    },
    {
      id: 'mbbank',
      name: 'MB Bank',
      code: 'MBB',
      logoUrl: createBankLogoData({ initials: 'MBB', name: 'MB Bank', start: '#1a3c7e', end: '#4a7fd4' })
    },
    {
      id: 'acb',
      name: 'ACB',
      code: 'ACB',
      logoUrl: createBankLogoData({ initials: 'ACB', name: 'ACB', start: '#004b87', end: '#0073cf' })
    },
    {
      id: 'bidv',
      name: 'BIDV',
      code: 'BIDV',
      logoUrl: createBankLogoData({ initials: 'BIDV', name: 'BIDV', start: '#003580', end: '#0066cc' })
    },
    {
      id: 'vpbank',
      name: 'VPBank',
      code: 'VPB',
      logoUrl: createBankLogoData({ initials: 'VPB', name: 'VPBank', start: '#00693c', end: '#2db84b' })
    },
  ]


  // ==========================================
  // 4. LOGIC GIẢM GIÁ
  // ==========================================
  const DISCOUNT_CODES = {
    'SUMMER20': 0.2,
    'VIP50': 0.5,
    'NEWBIE10': 0.1,
    'LUCKY25': 0.25,
  }

  const applyDiscount = () => {
    setDiscountError('')
    const code = discountCode.toUpperCase().trim()

    if (!code) {
      setDiscountError(t('discountCode') + ' ' + t('passwordRequired').toLowerCase())
      return
    }

    if (code in DISCOUNT_CODES) {
      const discount = Math.floor(bookingData.totalPrice * DISCOUNT_CODES[code])
      setDiscountAmount(discount)
    } else {
      setDiscountError(t('invalidDiscount') || 'Mã giảm giá không hợp lệ')
      setDiscountAmount(0)
    }
  }

  // ==========================================
  // 5. LOGIC THANH TOÁN
  // ==========================================
  const finalPrice = bookingData ? bookingData.totalPrice - discountAmount : 0

  const handleConfirmPayment = async () => {
    setIsProcessing(true)

    await new Promise(resolve => setTimeout(resolve, 1500))

    const newTicket = {
      bookingReference: `KA${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      flight: bookingData.flight,
      seats: bookingData.selectedSeats,
      originalPrice: bookingData.totalPrice,
      discountAmount: discountAmount,
      finalPrice: finalPrice,
      passengerName: user?.name || 'Passenger',
      passengerEmail: user?.email || '',
      status: 'CONFIRMED',
      issueDate: new Date().toLocaleDateString('vi-VN'),
      ticketType: ticketType,
      paymentMethod: paymentMethod === 'bank' ? `bank-${selectedBank}` : paymentMethod,
      barcode: `${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
    }

    addTicket(newTicket)

    const invoiceData = {
      type: 'flight',
      bookingReference: newTicket.bookingReference,
      items: [
        {
          description: `${t('ticketType') || 'Vé'} ${newTicket.ticketType} - ${newTicket.flight.departure_airport?.code} → ${newTicket.flight.arrival_airport?.code}`,
          quantity: newTicket.seats.length,
          unitPrice: bookingData.totalPrice / newTicket.seats.length,
          total: bookingData.totalPrice
        }
      ],
      subtotal: bookingData.totalPrice,
      tax: Math.round(bookingData.totalPrice * 0.1),
      total: finalPrice + Math.round(bookingData.totalPrice * 0.1)
    }
    addInvoice(invoiceData)

    localStorage.removeItem('draft_booking')

    setIsProcessing(false)
    setShowConfirmModal(false)

    setTimeout(() => navigate('/manage'), 1000)
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 pt-28">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-bold">{t('loadingData') || 'Đang tải dữ liệu...'}</p>
        </div>
      </div>
    )
  }

  const isRoundtrip = bookingData.flight?.roundtrip

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4 pt-28 transition-colors">
    <div className="max-w-7xl mx-auto">
        {/* === HEADER === */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">
            ✈️ {t('finalPrice')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-bold">
            {isRoundtrip ? (t('roundTripTicket') || 'Vé khứ hồi') : (t('oneWayTicket') || 'Vé một chiều')} - {bookingData.selectedSeats.length} {t('passengers')}
          </p>
        </motion.div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,1fr)]">
          {/* === MAIN CONTENT === */}
          <div className="space-y-6">
            {/* --- CHỌN LOẠI VÉ --- */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-lg border border-slate-200 dark:border-slate-700 md:p-8"
            >
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">🎫</span> {t('ticketType') || 'Loại vé'}
              </h2>

              <div className="space-y-3">
                {/* Vé một chiều */}
                <button
                  onClick={() => setTicketType('one-way')}
                  className={`w-full p-6 rounded-2xl border-2 transition-all ${
                    ticketType === 'one-way'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      ticketType === 'one-way'
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {ticketType === 'one-way' && <div className="w-3 h-3 bg-white rounded-full"></div>}
                    </div>
                    <div className="text-left">
                      <p className="font-black text-slate-900 dark:text-white">➡️ {t('oneWayTicket') || 'Vé một chiều'}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t('oneWayDesc') || 'Chỉ bay chiều đi'}</p>
                    </div>
                  </div>
                </button>

                {/* Vé khứ hồi */}
                <button
                  onClick={() => setTicketType('round-trip')}
                  className={`w-full p-6 rounded-2xl border-2 transition-all ${
                    ticketType === 'round-trip'
                      ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      ticketType === 'round-trip'
                        ? 'border-orange-600 bg-orange-600'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {ticketType === 'round-trip' && <div className="w-3 h-3 bg-white rounded-full"></div>}
                    </div>
                    <div className="text-left">
                      <p className="font-black text-slate-900 dark:text-white">🔄 {t('roundTripTicket') || 'Vé khứ hồi'}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t('roundTripDesc') || 'Cả chiều đi lẫn chiều về'}</p>
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
            
            {/* --- THÔNG TIN CHUYẾN BAY --- */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-lg border border-slate-200 dark:border-slate-700 md:p-8"
            >
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">🛫</span> {t('flightDetails') || 'Chi tiết chuyến bay'}
              </h2>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl">
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-bold mb-1">{t('departureFlight') || 'Chuyến đi'}</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">
                      {bookingData.flight.departure_airport?.code} → {bookingData.flight.arrival_airport?.code}
                    </p>
                    <p className="text-slate-500 text-sm mt-1">
                      {bookingData.flight.departure_time} • {bookingData.flight.duration}
                    </p>
                  </div>

                  {isRoundtrip && (
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-xl">
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-bold mb-1">{t('returnFlight') || 'Chuyến về'}</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white">
                        {bookingData.flight.arrival_airport?.code} → {bookingData.flight.departure_airport?.code}
                      </p>
                      <p className="text-slate-500 text-sm mt-1">
                        {bookingData.flight.return_time} • {bookingData.flight.return_duration}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-bold">{t('aircraft') || 'Máy bay'}</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{bookingData.flight.aircraft}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-bold">{t('flightNumber') || 'Chuyến bay'}</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{bookingData.flight.flight_number}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-bold">{t('seatNumber')}</p>
                    <p className="text-lg font-black text-blue-600">{bookingData.selectedSeats.join(', ')}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* --- MÃ GIẢM GIÁ --- */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-lg border border-slate-200 dark:border-slate-700 md:p-8"
            >
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">🎟️</span> {t('discountCode')}
              </h2>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="VD: SUMMER20, VIP50..."
                    className="flex-1 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-500 uppercase"
                  />
                  <button
                    onClick={applyDiscount}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-xl transition-all hover:shadow-lg active:scale-95"
                  >
                    {t('applyDiscount')}
                  </button>
                </div>

                {discountError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold">
                    <AlertCircle className="w-5 h-5" />
                    {discountError}
                  </div>
                )}

                {discountAmount > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    {t('discountSuccess') || 'Áp dụng thành công! Tiết kiệm'} {formatPrice(convertPrice(discountAmount))}
                  </div>
                )}

                <p className="text-sm text-slate-600 dark:text-slate-400 font-bold">
                  💡 {t('search')}: SUMMER20 (20%), VIP50 (50%), NEWBIE10 (10%), LUCKY25 (25%)
                </p>
              </div>
            </motion.div>

            {/* --- PHƯƠNG THỨC THANH TOÁN --- */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg border border-slate-200 dark:border-slate-700"
            >
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">💳</span> {t('paymentMethod')}
              </h2>

              <div className="space-y-3">
                {/* --- CHUYỂN KHOẢN NGÂN HÀNG --- */}
                <button
                  onClick={() => setPaymentMethod('bank')}
                  className={`w-full p-6 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'bank'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'bank'
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {paymentMethod === 'bank' && <div className="w-3 h-3 bg-white rounded-full"></div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-6 h-6 text-blue-600" />
                      <div className="text-left">
                        <p className="font-black text-slate-900 dark:text-white">{t('bankTransfer')}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('fastAndSafe') || 'Nhanh chóng và an toàn'}</p>
                      </div>
                    </div>
                  </div>
                </button>

                {/* --- CHỌN NGÂN HÀNG --- */}
                <AnimatePresence>
                  {paymentMethod === 'bank' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-2 gap-5 p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden sm:grid-cols-3 xl:grid-cols-3"
                    >
                      {BANKS.map((bank) => (
                        <button
                          key={bank.id}
                          onClick={() => setSelectedBank(bank.id)}
                          className={`flex min-h-44 flex-col items-center justify-center gap-4 rounded-[1.5rem] border-2 px-4 py-5 text-sm font-bold transition-all ${
                            selectedBank === bank.id
                              ? 'border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 shadow-lg shadow-emerald-700/10 ring-1 ring-emerald-200/60'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400 dark:hover:border-emerald-500'
                          }`}
                        >
                          <div className="flex h-16 w-full items-center justify-center rounded-2xl border border-slate-100 bg-white px-4 py-2 shadow-sm dark:border-slate-700 dark:bg-white/95">
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-3 shadow-inner ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                              <img
                                src={bank.logoUrl}
                                alt={bank.name}
                                className="max-h-20 max-w-[180px] object-contain drop-shadow-lg bg-white/95 rounded-xl p-2"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </div>
                          <div className="text-center text-base font-black leading-tight text-slate-800 dark:text-slate-100">{bank.name}</div>
                          <div className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-800 dark:bg-slate-900/70 dark:text-emerald-300">
                            {bank.code}
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* --- QR CODE --- */}
                <button
                  onClick={() => setPaymentMethod('qr')}
                  className={`w-full p-6 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'qr'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'qr'
                        ? 'border-purple-600 bg-purple-600'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {paymentMethod === 'qr' && <div className="w-3 h-3 bg-white rounded-full"></div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <QrCode className="w-6 h-6 text-purple-600" />
                      <div className="text-left">
                        <p className="font-black text-slate-900 dark:text-white">{t('scanQR') || 'Quét QR Code'}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('payAtCounter') || 'Thanh toán ngay tại điểm'}</p>
                      </div>
                    </div>
                  </div>
                </button>

                {/* --- TIỀN MẶT --- */}
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`w-full p-6 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'cash'
                        ? 'border-green-600 bg-green-600'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {paymentMethod === 'cash' && <div className="w-3 h-3 bg-white rounded-full"></div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Banknote className="w-6 h-6 text-green-600" />
                      <div className="text-left">
                        <p className="font-black text-slate-900 dark:text-white">{t('cashPayment') || 'Tiền mặt'}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('payAtCounter') || 'Thanh toán ngay tại điểm'}</p>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>

          {/* === SIDEBAR: TÓM TẮT ĐƠN === */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky top-32 self-start"
          >
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg border border-slate-200 dark:border-slate-700 space-y-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{t('orderSummary')}</h3>

              <div className="space-y-3 text-sm font-bold">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">{t('totalPrice')}</span>
                  <span className="text-slate-900 dark:text-white">{formatPrice(convertPrice(bookingData.totalPrice))}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>{t('discount') || 'Giảm giá'}</span>
                    <span>-{formatPrice(convertPrice(discountAmount))}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{t('taxLabel') || 'Thuế (10%)'}</span>
                  <span>{formatPrice(convertPrice(Math.round(finalPrice * 0.1)))}</span>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between">
                  <span className="text-slate-900 dark:text-white">{t('finalPrice')}</span>
                  <span className="text-2xl font-black text-blue-600 dark:text-orange-400">
                    {formatPrice(convertPrice(finalPrice + Math.round(finalPrice * 0.1)))}
                  </span>
                </div>
              </div>

              {currency !== 'VND' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs font-bold text-blue-700 dark:text-blue-300">
                  💱 {t('exchangeRate') || 'Tỷ giá thay đổi theo thời gian thực'}
                </div>
              )}

              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all hover:shadow-lg active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('processing') || 'Đang xử lý...'}
                  </>
                ) : (
                  <>
                    {t('confirmPayment')} <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-xs text-slate-500 dark:text-slate-400 text-center font-bold">
                🔒 {t('secureTransaction') || 'Giao dịch được bảo mật 256-bit'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* === MODAL XÁC NHẬN === */}
      <AnimatePresence>
        {showConfirmModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessing && setShowConfirmModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-50"
            >
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md shadow-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t('paymentConfirmation')}</h2>
                  {!isProcessing && (
                    <button onClick={() => setShowConfirmModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                      <X className="w-6 h-6" />
                    </button>
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-bold mb-1">{t('paymentAmount') || 'Số tiền thanh toán'}</p>
                    <p className="text-3xl font-black text-blue-600 dark:text-orange-400">
                      {formatPrice(convertPrice(finalPrice + Math.round(finalPrice * 0.1)))}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-bold mb-1">{t('paymentMethod') || 'Phương thức thanh toán'}</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">
                      {paymentMethod === 'bank' && `${t('bankTransfer')} (${BANKS.find(b => b.id === selectedBank)?.name})`}
                      {paymentMethod === 'qr' && (t('scanQR') || 'Quét QR Code')}
                      {paymentMethod === 'cash' && (t('cashPayment') || 'Tiền mặt')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    disabled={isProcessing}
                    className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-black rounded-xl transition-all disabled:opacity-50"
                  >
                    {t('cancel') || 'Hủy'}
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={isProcessing}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" /> {t('confirm') || 'Xác nhận'}
                      </>
                    )}
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

export default Checkout
