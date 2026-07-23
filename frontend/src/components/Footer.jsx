import { useState } from 'react'
import { Plane, Mail, Phone, MapPin, CreditCard, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { useI18n } from '../context/I18nContext'

// Social icons thay thế
const FacebookIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const TwitterIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
)

const InstagramIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const LinkedinIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const Footer = () => {
  const { t } = useI18n()
  const currentYear = new Date().getFullYear()

  const [newsletter, setNewsletter] = useState({ email: '' })
  const [newsletterMsg, setNewsletterMsg] = useState('')

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (!newsletter.email) return
    setNewsletterMsg(`✅ ${t('newsletterSuccess') || 'Cảm ơn bạn đã đăng ký! Chúng tôi sẽ gửi ưu đãi sớm nhất.'}`)
    setNewsletter({ email: '' })
    setTimeout(() => setNewsletterMsg(''), 4000)
  }

  const footerLinks = {
    about: [
      { label: t('brandStory') || 'Câu chuyện thương hiệu', href: '#' },
      { label: t('kangarooTeam') || 'Đội bay', href: '#' },
      { label: t('careers') || 'Tuyển dụng', href: '#' },
      { label: t('press') || 'Báo chí', href: '#' },
    ],
    support: [
      { label: t('supportCenter') || 'Trung tâm hỗ trợ', href: '#' },
      { label: t('ticketTerms') || 'Điều kiện giá vé', href: '#' },
      { label: t('baggagePolicy') || 'Quy định hành lý', href: '#' },
      { label: t('refundPolicy') || 'Hoàn & Hủy vé', href: '#' },
    ],
    policy: [
      { label: t('privacy') || 'Chính sách bảo mật', href: '#' },
      { label: t('terms') || 'Điều khoản dịch vụ', href: '#' },
      { label: t('cookiePolicy') || 'Chính sách cookie', href: '#' },
      { label: t('complaint') || 'Khiếu nại & Khôi phục', href: '#' },
    ],
    download: [
      { label: 'App Store (iOS)', href: '#', icon: '🍎' },
      { label: 'Google Play (Android)', href: '#', icon: '🤖' },
    ],
  }

  const socialLinks = [
    { icon: FacebookIcon, href: 'https://facebook.com', label: 'Facebook', color: 'text-blue-500' },
    { icon: TwitterIcon, href: 'https://twitter.com', label: 'Twitter', color: 'text-sky-400' },
    { icon: InstagramIcon, href: 'https://instagram.com', label: 'Instagram', color: 'text-pink-500' },
    { icon: LinkedinIcon, href: 'https://linkedin.com', label: 'LinkedIn', color: 'text-blue-600' },
  ]

  return (
    <footer className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* === NEWSLETTER SECTION === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 p-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl shadow-lg border border-blue-500"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-black text-white mb-2">{t('newsletterTitle') || 'Đăng ký nhận tin tức ✈️'}</h3>
              <p className="text-blue-100 font-bold">
                {t('newsletterDesc') || 'Nhận những ưu đãi độc quyền, tin khuyến mãi mới nhất trực tiếp vào email'}
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="flex gap-3">
              <input
                type="email"
                placeholder={t('emailPlaceholder') || 'Nhập email của bạn...'}
                value={newsletter.email}
                onChange={(e) => setNewsletter({ email: e.target.value })}
                className="flex-1 px-6 py-3 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-white text-blue-600 font-black rounded-xl hover:bg-yellow-300 transition-all active:scale-95"
              >
                {t('submitBtn') || 'Gửi'}
              </button>
            </form>

            {newsletterMsg && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full text-white font-bold text-sm"
              >
                {newsletterMsg}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* === MAIN LINKS GRID === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-16">

          {/* === CỘT 1: BRAND === */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
                <Plane className="text-white w-5 h-5 rotate-45" />
              </div>
              <div>
                <h3 className="text-lg font-black">KANGAROO</h3>
                <p className="text-xs font-bold text-blue-500 dark:text-blue-400">AIRLINE</p>
              </div>
            </div>

            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              {t('brandDesc') || 'Trải nghiệm bay đẳng cấp 5 sao, dịch vụ tuyệt vời, giá cước hợp lý.'}
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm mb-6">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-slate-600 dark:text-slate-400 font-bold">1900-1234</span>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-slate-600 dark:text-slate-400 font-bold">support@kangaroo.vn</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                <span className="text-slate-600 dark:text-slate-400 font-bold">123 Đường Huynh Quang Thai, TP HCM</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    className={`p-3 bg-slate-100 dark:bg-slate-800 rounded-full ${social.color} hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}
                    title={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                )
              })}
            </div>
          </motion.div>

          {/* === CỘT 2: VỀ CHÚNG TÔI === */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-wider">
              📌 {t('about') || 'Về chúng tôi'}
            </h4>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <motion.a
                    href={link.href}
                    whileHover={{ x: 5 }}
                    className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-2"
                  >
                    {link.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* === CỘT 3: HỖ TRỢ === */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-wider">
              🎯 {t('support') || 'Hỗ trợ'}
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <motion.a
                    href={link.href}
                    whileHover={{ x: 5 }}
                    className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-2"
                  >
                    {link.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* === CỘT 4: CHÍNH SÁCH === */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-wider">
              ⚖️ {t('policies') || 'Chính sách'}
            </h4>
            <ul className="space-y-3">
              {footerLinks.policy.map((link) => (
                <li key={link.label}>
                  <motion.a
                    href={link.href}
                    whileHover={{ x: 5 }}
                    className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-2"
                  >
                    {link.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* === CỘT 5: TẢI APP === */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-wider">
              📱 {t('downloadApp') || 'Tải ứng dụng'}
            </h4>
            
            <div className="space-y-4 flex flex-col items-start">
              {/* Nút tải App Store */}
              <motion.a
                href="#app-store"
                whileHover={{ scale: 1.05, y: -2 }}
                className="block transition-transform"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                  alt="Download on the App Store" 
                  className="h-10 w-auto"
                />
              </motion.a>

              {/* Nút tải Google Play */}
              <motion.a
                href="#google-play"
                whileHover={{ scale: 1.05, y: -2 }}
                className="block transition-transform"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                  alt="Get it on Google Play" 
                  className="h-10 w-auto"
                />
              </motion.a>
            </div>
          </motion.div>
        </div>
        
       {/* === PAYMENT & CERTIFICATIONS === */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 pb-16 border-b border-slate-200 dark:border-slate-800">
          
          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-600" />
              {t('paymentMethod') || 'Phương thức thanh toán'}
            </h4>
            <div className="grid grid-cols-4 gap-3">
              {/* Visa */}
              <motion.div whileHover={{ y: -5 }} className="flex items-center justify-center p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors h-14 shadow-sm overflow-hidden">
                <img src="https://cdn.simpleicons.org/visa/1434CB" alt="Visa" className="h-6 w-auto object-contain" />
              </motion.div>
              {/* Mastercard */}
              <motion.div whileHover={{ y: -5 }} className="flex items-center justify-center p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-500 transition-colors h-14 shadow-sm overflow-hidden">
                <img src="https://cdn.simpleicons.org/mastercard/EB001B" alt="Mastercard" className="h-6 w-auto object-contain" />
              </motion.div>
              {/* JCB */}
              <motion.div whileHover={{ y: -5 }} className="flex items-center justify-center p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors h-14 shadow-sm overflow-hidden">
                <img src="https://cdn.simpleicons.org/jcb/0F35A9" alt="JCB" className="h-6 w-auto object-contain" />
              </motion.div>
              {/* PayPal */}
              <motion.div whileHover={{ y: -5 }} className="flex items-center justify-center p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors h-14 shadow-sm overflow-hidden">
                <img src="https://cdn.simpleicons.org/paypal/00457C" alt="PayPal" className="h-6 w-auto object-contain" />
              </motion.div>
            </div>
          </motion.div>

          {/* Certifications */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-600" />
              {t('certifications') || 'Chứng nhận an toàn'}
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {/* IATA Certified */}
              <motion.div whileHover={{ y: -5 }} className="flex items-center justify-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors h-14 shadow-sm">
                <Plane className="w-5 h-5 text-blue-600" />
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-bold text-slate-400 leading-none">MEMBER OF</span>
                  <span className="text-sm font-black text-slate-700 dark:text-slate-200 leading-tight">IATA</span>
                </div>
              </motion.div>
              
              {/* Norton Secured */}
              <motion.div whileHover={{ y: -5 }} className="flex items-center justify-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-yellow-500 transition-colors h-14 shadow-sm">
                <Shield className="w-5 h-5 text-yellow-500" />
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-bold text-slate-400 leading-none">SECURED BY</span>
                  <span className="text-sm font-black text-slate-700 dark:text-slate-200 leading-tight">Norton</span>
                </div>
              </motion.div>

              {/* PCI DSS Secure */}
              <motion.div whileHover={{ y: -5 }} className="flex flex-col items-center justify-center p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-green-500 transition-colors h-14 shadow-sm">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-[12px] font-black text-slate-700 dark:text-slate-300">PCI-DSS</span>
                </div>
                <span className="text-[9px] font-bold text-slate-400 tracking-widest mt-0.5">COMPLIANT</span>
              </motion.div>
            </div>
          </motion.div>
          
        </div>

        {/* === BOTTOM FOOTER === */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
            © {currentYear} Kangaroo Airline. {t('allRightsReserved') || 'Tất cả quyền được bảo lưu.'}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {t('designedBy') || 'Thiết kế & Phát triển với ❤️ bởi Huynh Thai | Bảo mật chuẩn OWASP'}
          </p>
        </motion.div>

      </div>
    </footer>
  )
}

export default Footer