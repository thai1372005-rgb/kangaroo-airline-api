import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, MessageCircle, Phone, Mail, MapPin, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { useI18n } from '../context/I18nContext' // <-- Import i18n
import { sanitizeFormData, validateContactForm, validateEmail, validatePhone } from '../utils/sanitizer'

const HelpCenter = () => {
  const { isDarkMode } = useAppContext()
  const { t } = useI18n() // <-- Kéo hàm dịch ra

  // ==========================================
  // 1. STATE QUẢN LÝ
  // ==========================================
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedFaqId, setExpandedFaqId] = useState(null)
  const [activeTab, setActiveTab] = useState('faq') // 'faq' | 'contact'
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'booking',
    subject: '',
    message: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [formMsg, setFormMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ==========================================
  // 2. FAQ DATA (Đã gắn hàm dịch t)
  // ==========================================
  const faqs = [
    { id: 1, category: 'booking', question: `❓ ${t('faq1_q')}`, answer: t('faq1_a'), views: 5234 },
    { id: 2, category: 'booking', question: `❓ ${t('faq2_q')}`, answer: t('faq2_a'), views: 4521 },
    { id: 3, category: 'baggage', question: `👜 ${t('faq3_q')}`, answer: t('faq3_a'), views: 3987 },
    { id: 4, category: 'check-in', question: `✈️ ${t('faq4_q')}`, answer: t('faq4_a'), views: 6123 },
    { id: 5, category: 'refund', question: `💰 ${t('faq5_q')}`, answer: t('faq5_a'), views: 5643 },
    { id: 6, category: 'special-assistance', question: `🦽 ${t('faq6_q')}`, answer: t('faq6_a'), views: 2345 },
    { id: 7, category: 'airport-transfer', question: `🚕 ${t('faq7_q')}`, answer: t('faq7_a'), views: 4156 },
    { id: 8, category: 'payment', question: `💳 ${t('faq8_q')}`, answer: t('faq8_a'), views: 5876 },
  ]

  // ==========================================
  // 3. CATEGORIES (Đã gắn hàm dịch t)
  // ==========================================
  const categories = [
    { id: 'all', label: `📌 ${t('catAll') || 'Tất cả'}` },
    { id: 'booking', label: `✈️ ${t('catBooking') || 'Đặt vé'}` },
    { id: 'baggage', label: `👜 ${t('catBaggage') || 'Hành lý'}` },
    { id: 'check-in', label: `🎫 ${t('catCheckIn') || 'Check-in'}` },
    { id: 'refund', label: `💰 ${t('catRefund') || 'Hoàn tiền'}` },
    { id: 'special-assistance', label: `🦽 ${t('catSpecial') || 'Hỗ trợ đặc biệt'}` },
    { id: 'airport-transfer', label: `🚕 ${t('catTransfer') || 'Dịch vụ sân bay'}` },
    { id: 'payment', label: `💳 ${t('catPayment') || 'Thanh toán'}` },
  ]

  // ==========================================
  // 4. CONTACT FORM HANDLING
  // ==========================================
  const handleContactChange = (e) => {
    const { name, value } = e.target
    setContactForm(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setFormMsg('')

    // Validation (Sử dụng hàm ngoài, bọc thêm báo lỗi nội bộ nếu cần)
    const errors = validateContactForm(contactForm)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    if (!validatePhone(contactForm.phone)) {
      setFormErrors(prev => ({ ...prev, phone: t('errorInvalidPhone') || 'Số điện thoại không hợp lệ' }))
      return
    }

    setIsSubmitting(true)

    const sanitized = sanitizeFormData(contactForm)

    await new Promise(resolve => setTimeout(resolve, 1500))

    const existingMessages = JSON.parse(localStorage.getItem('support_messages') || '[]')
    existingMessages.push({
      id: `MSG-${Date.now()}`,
      ...sanitized,
      submittedAt: new Date().toLocaleString('vi-VN'),
      status: 'pending',
    })
    localStorage.setItem('support_messages', JSON.stringify(existingMessages))

    setIsSubmitting(false)
    setFormMsg(`✅ ${t('requestSent') || 'Yêu cầu của bạn đã được gửi! Chúng tôi sẽ liên hệ sớm nhất.'}`)
    setContactForm({
      name: '', email: '', phone: '', category: 'booking', subject: '', message: '',
    })
    setFormErrors({})
  }

  // ==========================================
  // 5. FILTER FAQ
  // ==========================================
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredFaqs = faqs.filter(faq => {
    const matchCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchCategory && matchSearch
  })

  // ==========================================
  // 6. RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4 pt-28 transition-colors">
      <div className="max-w-5xl mx-auto">
        
        {/* === HEADER === */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-3">
            🆘 {t('helpCenterTitle') || 'Trung tâm hỗ trợ khách hàng'}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-bold max-w-2xl mx-auto">
            {t('helpCenterDesc') || 'Chúng tôi ở đây để giúp! Tìm kiếm câu hỏi hoặc liên hệ với chúng tôi ngay'}
          </p>
        </motion.div>

        {/* === TAB SWITCHER === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4 mb-12 justify-center"
        >
          {[
            { id: 'faq', label: `❓ ${t('faqTab') || 'Câu hỏi thường gặp'}` },
            { id: 'contact', label: `📬 ${t('contactTab') || 'Liên hệ hỗ trợ'}` },
          ].map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-8 py-3 rounded-2xl font-black transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* === FAQ TAB === */}
        <AnimatePresence mode="wait">
          {activeTab === 'faq' && (
            <motion.div
              key="faq"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Search & Filter */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('searchFaqPlaceholder') || "Tìm kiếm câu hỏi..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <motion.button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      whileHover={{ scale: 1.05 }}
                      className={`px-4 py-2 rounded-lg font-bold transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {cat.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* FAQ Items */}
              {filteredFaqs.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <MessageCircle className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t('noFaqFound') || 'Không tìm thấy câu hỏi'}</h2>
                  <p className="text-slate-600 dark:text-slate-400 font-bold">{t('trySearchOrContact') || 'Thử tìm kiếm hoặc liên hệ với chúng tôi'}</p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {filteredFaqs.map((faq, index) => (
                    <motion.div
                      key={faq.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden hover:border-blue-500 transition-all"
                    >
                      <button
                        onClick={() => setExpandedFaqId(expandedFaqId === faq.id ? null : faq.id)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <span className="text-left font-bold text-slate-900 dark:text-white">
                          {faq.question}
                        </span>
                        <motion.div
                          animate={{ rotate: expandedFaqId === faq.id ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className="w-6 h-6 text-blue-600" />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {expandedFaqId === faq.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-t-2 border-slate-200 dark:border-slate-700"
                          >
                            <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed mb-4">
                              {faq.answer}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 font-bold">
                              👍 {faq.views.toLocaleString('vi-VN')} {t('helpfulCount') || 'người thấy hữu ích'}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* === CONTACT TAB === */}
          {activeTab === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Contact Info Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Phone,
                    title: `📞 ${t('phoneTitle') || 'Điện thoại'}`,
                    info: '1900 1234',
                    detail: t('phoneDetail') || '24/7 (chủ nhật có)',
                  },
                  {
                    icon: Mail,
                    title: `📧 ${t('emailTitle') || 'Email'}`,
                    info: 'support@kangaroo.vn',
                    detail: t('emailDetail') || 'Phản hồi trong 2 giờ',
                  },
                  {
                    icon: MapPin,
                    title: `📍 ${t('officeTitle') || 'Văn phòng'}`,
                    info: t('officeAddress') || '123 Đường Nguyễn Hữu Cảnh',
                    detail: t('officeDetail') || 'TP HCM, Việt Nam',
                  },
                ].map((contact, idx) => {
                  const Icon = contact.icon
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-6 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-center"
                    >
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                        {contact.title}
                      </h3>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-300 mb-1">
                        {contact.info}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                        {contact.detail}
                      </p>
                    </motion.div>
                  )
                })}
              </div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700"
              >
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
                  📝 {t('sendRequest') || 'Gửi yêu cầu hỗ trợ'}
                </h2>

                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      👤 {t('nameLabel') || 'Tên'}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      placeholder={t('namePlaceholderForm') || "Tên đầy đủ của bạn"}
                      className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold outline-none transition-all ${
                        formErrors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'
                      }`}
                    />
                    {formErrors.name && (
                      <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1"><XCircle className="w-4 h-4" /> {formErrors.name}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        📧 {t('emailLabel') || 'Email'}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={contactForm.email}
                        onChange={handleContactChange}
                        placeholder="your.email@example.com"
                        className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold outline-none transition-all ${
                          formErrors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'
                        }`}
                      />
                      {formErrors.email && (
                        <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1"><XCircle className="w-4 h-4" /> {formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        📞 {t('phoneLabel') || 'Số điện thoại'}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={contactForm.phone}
                        onChange={handleContactChange}
                        placeholder="0912345678"
                        className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold outline-none transition-all ${
                          formErrors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'
                        }`}
                      />
                      {formErrors.phone && (
                        <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1"><XCircle className="w-4 h-4" /> {formErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      🏷️ {t('categoryLabel') || 'Danh mục'}
                    </label>
                    <select
                      name="category"
                      value={contactForm.category}
                      onChange={handleContactChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold outline-none focus:border-blue-500 transition-all"
                    >
                      <option value="booking">✈️ {t('catBooking')}</option>
                      <option value="baggage">👜 {t('catBaggage')}</option>
                      <option value="check-in">🎫 {t('catCheckIn')}</option>
                      <option value="refund">💰 {t('catRefund')}</option>
                      <option value="complaint">😠 {t('catComplaint')}</option>
                      <option value="feedback">💬 {t('catFeedback')}</option>
                      <option value="other">❓ {t('catOther')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      📌 {t('subjectLabel') || 'Tiêu đề'}
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={contactForm.subject}
                      onChange={handleContactChange}
                      placeholder={t('subjectPlaceholder') || "Mô tả ngắn về vấn đề của bạn"}
                      className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold outline-none transition-all ${
                        formErrors.subject ? 'border-red-500' : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'
                      }`}
                    />
                    {formErrors.subject && (
                      <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1"><XCircle className="w-4 h-4" /> {formErrors.subject}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      💬 {t('messageLabel') || 'Nội dung'}
                    </label>
                    <textarea
                      name="message"
                      value={contactForm.message}
                      onChange={handleContactChange}
                      placeholder={t('messagePlaceholder') || "Vui lòng mô tả chi tiết vấn đề của bạn..."}
                      rows="5"
                      className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold outline-none transition-all resize-none ${
                        formErrors.message ? 'border-red-500' : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'
                      }`}
                    />
                    {formErrors.message && (
                      <p className="text-xs text-red-600 font-bold mt-2 flex items-center gap-1"><XCircle className="w-4 h-4" /> {formErrors.message}</p>
                    )}
                  </div>

                  {formMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl font-bold flex items-center gap-2 ${
                        formMsg.startsWith('✅')
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                          : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {formMsg.startsWith('✅') ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      {formMsg}
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {t('sending') || 'Đang gửi...'}
                      </>
                    ) : (
                      <>📬 {t('submitBtn') || 'Gửi yêu cầu'}</>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default HelpCenter