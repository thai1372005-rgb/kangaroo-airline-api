import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Calendar, Clock, Users, Phone, Mail, AlertCircle, CheckCircle2, Smartphone, QrCode, Building2, XCircle } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'
import { sanitizeFormData, validatePhone, validateContactForm, validateEmail } from '../utils/sanitizer'
import ShuttleSeatMap from '../components/ShuttleSeatMap'

const AirportTransfer = () => {
  const navigate = useNavigate()
  const { isDarkMode } = useAppContext()
  const { addTransfer } = useAuth()
  const { t, formatPrice, convertPrice } = useI18n()

  // ==========================================
  // 1. STATE QUẢN LÝ
  // ==========================================
  const [activeTab, setActiveTab] = useState('taxi') // 'taxi' | 'shuttle'
  const [step, setStep] = useState('booking') // 'booking' | 'payment' | 'confirmation'
  const [paymentMethod, setPaymentMethod] = useState('qr')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState({})
  const [bookingMsg, setBookingMsg] = useState('')

  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    pickupTime: '',
    passengerCount: 1,
    passengerName: '',
    phoneNumber: '',
    email: '',
    specialRequests: '',
  })

  const [bookingData, setBookingData] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([]) // Thêm: lưu ghế xe khách

  // ==========================================
  // 2. PRICING LOGIC
  // ==========================================
  const pricing = {
    taxi: {
      base: 250000, // VNĐ
      perKm: 15000,
      estimatedDistance: 25, // km (giả lập)
    },
    shuttle: {
      base: 150000,
      perKm: 8000,
      estimatedDistance: 25,
    }
  }

  const calculatePrice = () => {
    const type = activeTab === 'taxi' ? pricing.taxi : pricing.shuttle
    return type.base + (type.perKm * type.estimatedDistance)
  }

  // ==========================================
  // 3. FORM HANDLING
  // ==========================================
  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.pickupLocation.trim()) {
      newErrors.pickupLocation = t('errorPickupRequired') || 'Vui lòng nhập điểm đón'
    }

    if (!formData.dropoffLocation.trim()) {
      newErrors.dropoffLocation = t('errorDropoffRequired') || 'Vui lòng nhập điểm trả'
    }

    if (formData.pickupLocation && formData.dropoffLocation && formData.pickupLocation === formData.dropoffLocation) {
      newErrors.dropoffLocation = t('errorSameLocation') || 'Điểm đón và trả phải khác nhau'
    }

    if (!formData.pickupDate) {
      newErrors.pickupDate = t('errorDateRequired') || 'Vui lòng chọn ngày'
    }

    if (!formData.pickupTime) {
      newErrors.pickupTime = t('errorTimeRequired') || 'Vui lòng chọn thời gian'
    }

    if (formData.passengerCount < 1 || formData.passengerCount > 8) {
      newErrors.passengerCount = t('errorPassengerCount') || 'Số hành khách phải từ 1-8 người'
    }

    if (!formData.passengerName.trim() || formData.passengerName.trim().length < 3) {
      newErrors.passengerName = t('errorNameLength') || 'Tên hành khách phải từ 3 ký tự trở lên'
    }

    if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = t('errorInvalidPhone') || 'Số điện thoại không hợp lệ'
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = t('errorInvalidEmail') || 'Email không hợp lệ'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleBookingSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      setBookingMsg('')
      return
    }

    // Sanitize data
    const sanitized = sanitizeFormData(formData)

    // Tạo booking data
    const booking = {
      id: `TRF-${Date.now()}`,
      type: activeTab,
      ...sanitized,
      price: calculatePrice(),
      date: new Date().toLocaleDateString('vi-VN'),
    }

    setBookingData(booking)
    setStep('payment')
    setBookingMsg(`✅ ${t('bookingInfoSaved') || 'Thông tin đón-trả đã được lưu!'}`)
  }

  // ==========================================
  // 4. PAYMENT HANDLING
  // ==========================================
  const handleConfirmPayment = async () => {
    setIsProcessing(true)

    // Giả lập xử lý thanh toán
    await new Promise(resolve => setTimeout(resolve, 1500))

    const bookingReference = `KA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Tạo transfer ticket object
    const transferTicket = {
      id: `TRF-${Date.now()}`,
      bookingReference,
      type: activeTab, // 'taxi' | 'shuttle'
      pickupLocation: bookingData.pickupLocation,
      dropoffLocation: bookingData.dropoffLocation,
      pickupDate: bookingData.pickupDate,
      pickupTime: bookingData.pickupTime,
      passengerCount: bookingData.passengerCount,
      passengerName: bookingData.passengerName,
      phoneNumber: bookingData.phoneNumber,
      email: bookingData.email,
      specialRequests: bookingData.specialRequests,
      selectedSeats: selectedSeats,
      price: bookingData.price,
      paymentMethod,
      status: 'CONFIRMED',
      bookingDate: new Date().toLocaleDateString('vi-VN'),
      bookingTime: new Date().toLocaleTimeString('vi-VN'),
    }

    // Lưu vào AuthContext
    addTransfer(transferTicket)

    // Lưu vào localStorage (backup)
    const existingTransfers = JSON.parse(localStorage.getItem('airport_transfers') || '[]')
    existingTransfers.push(transferTicket)
    localStorage.setItem('airport_transfers', JSON.stringify(existingTransfers))

    setIsProcessing(false)
    setShowConfirmModal(false)
    setStep('confirmation')
    setBookingMsg(`✅ ${t('transferSuccess') || 'Đặt xe thành công! Bạn sẽ nhận được xác nhận qua email.'}`)
  }

  // ==========================================
  // 5. RESET BOOKING
  // ==========================================
  const handleNewBooking = () => {
    setFormData({
      pickupLocation: '',
      dropoffLocation: '',
      pickupDate: '',
      pickupTime: '',
      passengerCount: 1,
      passengerName: '',
      phoneNumber: '',
      email: '',
      specialRequests: '',
    })
    setBookingData(null)
    setStep('booking')
    setErrors({})
    setBookingMsg('')
  }

  // ==========================================
  // RENDER: BOOKING STEP
  // ==========================================
  if (step === 'booking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4 pt-28 transition-colors">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3">
              🚕 {t('transferPageTitle') || 'Dịch vụ đưa đón sân bay'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-bold max-w-2xl mx-auto">
              {t('transferPageDesc') || 'Đặt xe nhanh, an toàn, và tiết kiệm chi phí cho hành trình tới/từ sân bay'}
            </p>
          </motion.div>

          {/* Tab Switcher */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 mb-8 justify-center"
          >
            {[
              { id: 'taxi', label: `🚕 ${t('taxiPrivate') || 'Taxi (Riêng tư)'}`, icon: '' },
              { id: 'shuttle', label: `🚐 ${t('shuttleEconomy') || 'Xe khách (Tiết kiệm)'}`, icon: '' }
            ].map(tab => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-4 rounded-2xl font-black text-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
              </motion.button>
            ))}
          </motion.div>

          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-slate-200 dark:border-slate-700"
          >
            <form onSubmit={handleBookingSubmit} className="space-y-6">
              {/* Row 1: Locations */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                    📍 {t('pickupLocation')}
                  </label>
                  <input
                    type="text"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleFormChange}
                    placeholder={t('pickupPlaceholder') || "VD: Sân bay Tân Sơn Nhất..."}
                    className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold outline-none transition-all ${
                      errors.pickupLocation
                        ? 'border-red-500'
                        : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'
                    }`}
                  />
                  {errors.pickupLocation && (
                    <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> {errors.pickupLocation}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                    🏢 {t('dropoffLocation')}
                  </label>
                  <input
                    type="text"
                    name="dropoffLocation"
                    value={formData.dropoffLocation}
                    onChange={handleFormChange}
                    placeholder={t('dropoffPlaceholder') || "VD: Khách sạn, nhà riêng..."}
                    className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold outline-none transition-all ${
                      errors.dropoffLocation
                        ? 'border-red-500'
                        : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'
                    }`}
                  />
                  {errors.dropoffLocation && (
                    <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> {errors.dropoffLocation}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Date & Time */}
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                    📅 {t('pickupDate')}
                  </label>
                  <input
                    type="date"
                    name="pickupDate"
                    value={formData.pickupDate}
                    onChange={handleFormChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold outline-none transition-all [color-scheme:light] dark:[color-scheme:dark] ${
                      errors.pickupDate
                        ? 'border-red-500'
                        : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'
                    }`}
                  />
                  {errors.pickupDate && (
                    <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> {errors.pickupDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                    ⏰ {t('pickupTime')}
                  </label>
                  <input
                    type="time"
                    name="pickupTime"
                    value={formData.pickupTime}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold outline-none transition-all [color-scheme:light] dark:[color-scheme:dark] ${
                      errors.pickupTime
                        ? 'border-red-500'
                        : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'
                    }`}
                  />
                  {errors.pickupTime && (
                    <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> {errors.pickupTime}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                    👥 {t('passengerCountLabel') || 'Số hành khách'}
                  </label>
                  <select
                    name="passengerCount"
                    value={formData.passengerCount}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold outline-none focus:border-blue-500 transition-all"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>{num} {t('people') || 'người'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Passenger Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                    👤 {t('passengerName')}
                  </label>
                  <input
                    type="text"
                    name="passengerName"
                    value={formData.passengerName}
                    onChange={handleFormChange}
                    placeholder={t('namePlaceholder') || "VD: Nguyễn Văn A"}
                    className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold outline-none transition-all ${
                      errors.passengerName
                        ? 'border-red-500'
                        : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'
                    }`}
                  />
                  {errors.passengerName && (
                    <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> {errors.passengerName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                    📞 {t('phoneNumber')}
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleFormChange}
                    placeholder={t('phonePlaceholder') || "VD: 0912345678"}
                    className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold outline-none transition-all ${
                      errors.phoneNumber
                        ? 'border-red-500'
                        : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'
                    }`}
                  />
                  {errors.phoneNumber && (
                    <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> {errors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  📧 {t('email')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="your.email@example.com"
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold outline-none transition-all ${
                    errors.email
                      ? 'border-red-500'
                      : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  ✍️ {t('specialRequests') || 'Yêu cầu đặc biệt (tuỳ chọn)'}
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleFormChange}
                  placeholder={t('specialReqPlaceholder') || "VD: Cần ghế trẻ em, có nhiều hành lý..."}
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold outline-none focus:border-blue-500 transition-all resize-none"
                />
              </div>

              {/* SHUTTLE SEATMAP */}
              {activeTab === 'shuttle' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700"
                >
                  <ShuttleSeatMap onSeatsChange={setSelectedSeats} />
                </motion.div>
              )}

              {/* Booking Message */}
              {bookingMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl font-bold text-sm flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {bookingMsg}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black text-lg rounded-2xl transition-all shadow-lg"
              >
                💳 {t('continueToPayment')} ({formatPrice(convertPrice(calculatePrice()))})
              </motion.button>
            </form>
          </motion.div>

          {/* Price Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">💰 {t('priceDetails')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>{t('baseFare')}:</span>
                <span>{formatPrice(convertPrice(pricing[activeTab].base))}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>{t('estimatedDistance')}: {pricing[activeTab].estimatedDistance} km × {formatPrice(convertPrice(pricing[activeTab].perKm))}/km</span>
                <span>{formatPrice(convertPrice(pricing[activeTab].perKm * pricing[activeTab].estimatedDistance))}</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between font-black text-lg text-blue-600">
                <span>{t('totalPrice')}:</span>
                <span>{formatPrice(convertPrice(calculatePrice()))}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // ==========================================
  // RENDER: PAYMENT STEP
  // ==========================================
  if (step === 'payment' && bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">💳 {t('selectPaymentMethod')}</h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-slate-200 dark:border-slate-700"
          >
            <div className="space-y-4 mb-8">
              {[
                { id: 'qr', label: `📱 ${t('scanQR')}`, icon: <QrCode className="w-6 h-6" /> },
                { id: 'bank', label: `🏦 ${t('bankTransfer')}`, icon: <Building2 className="w-6 h-6" /> },
                { id: 'paypal', label: `💳 ${t('paypal') || 'PayPal'}`, icon: '🌐' },
              ].map(method => (
                <motion.button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  whileHover={{ scale: 1.02 }}
                  className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                    paymentMethod === method.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === method.id
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {paymentMethod === method.id && <div className="w-3 h-3 bg-white rounded-full"></div>}
                  </div>
                  <div className="text-2xl">{typeof method.icon === 'string' ? method.icon : method.icon}</div>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{method.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Payment Details */}
            <AnimatePresence>
              {paymentMethod === 'qr' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 p-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl text-center"
                >
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-4">{t('scanQRToPay') || 'Quét mã QR để thanh toán:'}</p>
                  <div className="w-48 h-48 bg-white dark:bg-slate-700 border-4 border-purple-600 rounded-2xl mx-auto flex items-center justify-center">
                    <QrCode className="w-20 h-20 text-purple-600" />
                  </div>
                </motion.div>
              )}

              {paymentMethod === 'bank' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 p-6 bg-slate-50 dark:bg-slate-700/50 rounded-2xl space-y-3"
                >
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-4">{t('bankAccountInfo') || 'Thông tin tài khoản ngân hàng:'}</p>
                  {[
                    { label: t('bankName') || 'Ngân hàng', value: 'Vietcombank' },
                    { label: t('accountNumber') || 'STK', value: '0987654321' },
                    { label: t('accountHolder') || 'Chủ tài khoản', value: 'KANGAROO AIRLINE' },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between p-3 bg-white dark:bg-slate-700 rounded-xl">
                      <span className="font-bold text-slate-600 dark:text-slate-400">{item.label}</span>
                      <span className="font-black text-slate-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              {paymentMethod === 'paypal' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-center"
                >
                  <p className="text-sm font-bold text-blue-600">🌐 {t('paypalRedirect') || 'Bạn sẽ được chuyển hướng tới PayPal để hoàn tất thanh toán.'}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Order Summary */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">📦 {t('orderSummary')}</h3>
              <div className="space-y-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                <div><strong>{t('vehicleType') || 'Loại xe'}:</strong> {activeTab === 'taxi' ? `🚕 ${t('taxiPrivate')}` : `🚐 ${t('shuttleEconomy')}`}</div>
                <div><strong>{t('pickupLocation')}:</strong> {bookingData.pickupLocation}</div>
                <div><strong>{t('dropoffLocation')}:</strong> {bookingData.dropoffLocation}</div>
                <div><strong>{t('dateTime') || 'Ngày/Giờ'}:</strong> {bookingData.pickupDate} {t('at') || 'lúc'} {bookingData.pickupTime}</div>
                <div className="pt-3 border-t border-blue-300 dark:border-blue-700">
                  <strong className="text-lg text-blue-600 dark:text-blue-400">
                    {t('totalPrice')}: {formatPrice(convertPrice(bookingData.price))}
                  </strong>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setStep('booking')}
                className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-black rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
              >
                ← {t('back') || 'Quay lại'}
              </button>
              <motion.button
                onClick={() => setShowConfirmModal(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all"
              >
                ✅ {t('confirmPayment')}
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md"
              >
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{t('confirmPaymentModalTitle') || 'Xác nhận thanh toán?'}</h2>
                <p className="text-slate-600 dark:text-slate-400 font-bold mb-6">
                  {t('youWillPay') || 'Bạn sẽ thanh toán'} <strong className="text-blue-600">{formatPrice(convertPrice(bookingData.price))}</strong> {t('forThisTransfer') || 'cho chuyến đón-trả này.'}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-black rounded-xl"
                  >
                    {t('cancel') || 'Hủy'}
                  </button>
                  <motion.button
                    onClick={handleConfirmPayment}
                    disabled={isProcessing}
                    whileHover={{ scale: 1.02 }}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {t('processing') || 'Xử lý...'}
                      </>
                    ) : (
                      <>✅ {t('agree') || 'Đồng ý'}</>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // ==========================================
  // RENDER: CONFIRMATION STEP
  // ==========================================
  if (step === 'confirmation' && bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-12 max-w-md shadow-2xl border-2 border-green-500 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </motion.div>

          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">
            {t('bookingSuccess') || 'Đặt xe thành công!'}
          </h1>

          <p className="text-slate-600 dark:text-slate-400 font-bold mb-8">
            {t('bookingSuccessDesc') || 'Chúng tôi sẽ liên hệ với bạn sớm để xác nhận chi tiết chuyến đi.'}
          </p>

          <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-6 mb-8 text-left space-y-3">
            <div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{t('bookingCode') || 'Mã đặt xe'}</p>
              <p className="text-lg font-black text-slate-900 dark:text-white">KA-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-600 pt-3">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{t('cost') || 'Chi phí'}</p>
              <p className="text-2xl font-black text-blue-600">{formatPrice(convertPrice(bookingData.price))}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-black rounded-xl hover:bg-slate-300 transition-all"
            >
              {t('homeButton') || 'Trang chủ'}
            </button>
            <motion.button
              onClick={handleNewBooking}
              whileHover={{ scale: 1.05 }}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              {t('bookAnother') || 'Đặt thêm xe'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }
}

export default AirportTransfer