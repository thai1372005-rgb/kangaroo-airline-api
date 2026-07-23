import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, Gift, Sparkles, Heart, Search, Tag, Star, Percent } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { useI18n } from '../context/I18nContext'

const Promotions = () => {
  const { isDarkMode } = useAppContext()
  const { t, formatPrice, convertPrice } = useI18n()

  const [savedCodes, setSavedCodes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('saved_promo_codes') || '[]')
    } catch {
      return []
    }
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedCode, setCopiedCode] = useState(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [showSavedOnly, setShowSavedOnly] = useState(false)

  const promos = [
    {
      id: 1,
      code: 'SUMMER20',
      title: t('promoSummerTitle') || '☀️ Chào hè rực rỡ',
      description: t('promoSummerDesc') || 'Giảm 20% cho tất cả chuyến bay',
      discount: 20,
      type: 'percent',
      category: 'flights',
      minPrice: 500000,
      expiryDate: '2026-06-30',
      usageCount: 2547,
      badge: t('promoHotBadge') || '🔥 HOT',
      shine: true,
      accent: 'from-emerald-600 to-green-700',
    },
    {
      id: 2,
      code: 'VIP50',
      title: t('promoVipTitle') || '👑 VIP Member Exclusive',
      description: t('promoVipDesc') || 'Nhân đôi dặm bay cho thành viên VIP',
      discount: 50,
      type: 'percent',
      category: 'membership',
      minPrice: 0,
      expiryDate: '2026-12-31',
      usageCount: 1203,
      badge: t('promoExclusiveBadge') || '✨ EXCLUSIVE',
      shine: true,
      accent: 'from-emerald-700 to-lime-700',
    },
    {
      id: 3,
      code: 'NEWBIE10',
      title: t('promoNewbieTitle') || '🎉 Chào mừng thành viên mới',
      description: t('promoNewbieDesc') || 'Giảm 10% cho đơn hàng đầu tiên',
      discount: 100000,
      type: 'fixed',
      category: 'flights',
      minPrice: 1000000,
      expiryDate: '2026-08-15',
      usageCount: 5432,
      badge: t('promoNewBadge') || '⭐ NEW',
      shine: false,
      accent: 'from-brown-500 to-amber-700',
    },
    {
      id: 4,
      code: 'LUCKY25',
      title: t('promoLuckyTitle') || '🍀 Quay số may mắn',
      description: t('promoLuckyDesc') || 'Giảm 25% hoặc đến 500K cho dịch vụ phụ',
      discount: 25,
      type: 'percent',
      category: 'services',
      minPrice: 300000,
      expiryDate: '2026-07-20',
      usageCount: 3891,
      badge: t('promoTrendingBadge') || '🎯 TRENDING',
      shine: true,
      accent: 'from-emerald-600 to-green-700',
    },
    {
      id: 5,
      code: 'AIRPORT30',
      title: t('promoAirportTitle') || '🚕 Dịch vụ đưa đón sân bay',
      description: t('promoAirportDesc') || 'Giảm 30% cho tất cả chuyến xe sân bay',
      discount: 30,
      type: 'percent',
      category: 'transfer',
      minPrice: 200000,
      expiryDate: '2026-09-30',
      usageCount: 2156,
      badge: t('promoFastBadge') || '🚀 FAST',
      shine: false,
      accent: 'from-emerald-500 to-lime-600',
    },
    {
      id: 6,
      code: 'CORPORATE15',
      title: t('promoCorporateTitle') || '💼 Corporate Travel',
      description: t('promoCorporateDesc') || 'Giảm 15% cho các nhóm từ 5 người trở lên',
      discount: 15,
      type: 'percent',
      category: 'flights',
      minPrice: 5000000,
      expiryDate: '2026-10-31',
      usageCount: 892,
      badge: t('promoB2BBadge') || '📊 B2B',
      shine: false,
      accent: 'from-brown-600 to-stone-700',
    },
    {
      id: 7,
      code: 'FAMILY40',
      title: t('promoFamilyTitle') || '👨‍👩‍👧‍👦 Gói gia đình',
      description: t('promoFamilyDesc') || 'Giảm 40% cho vé máy bay gia đình (3-4 người)',
      discount: 40,
      type: 'percent',
      category: 'flights',
      minPrice: 2000000,
      expiryDate: '2026-11-15',
      usageCount: 3456,
      badge: t('promoFamilyBadge') || '❤️ FAMILY',
      shine: true,
      accent: 'from-emerald-700 to-green-800',
    },
    {
      id: 8,
      code: 'EARLY60',
      title: t('promoEarlyTitle') || '⏰ Đặt sớm - Tiết kiệm nhiều',
      description: t('promoEarlyDesc') || 'Giảm 60K cho các chuyến bay 30 ngày trước',
      discount: 60000,
      type: 'fixed',
      category: 'flights',
      minPrice: 500000,
      expiryDate: '2026-08-31',
      usageCount: 4203,
      badge: t('promoLimitedBadge') || '⏳ LIMITED',
      shine: true,
      accent: 'from-green-500 to-emerald-700',
    },
  ]

  const filteredPromos = promos.filter((promo) => {
    const term = searchTerm.trim().toUpperCase()
    const matchSearch =
      promo.code.includes(term) ||
      promo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategory = filterCategory === 'all' || promo.category === filterCategory
    const matchSaved = !showSavedOnly || savedCodes.includes(promo.code)

    return matchSearch && matchCategory && matchSaved
  })

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch {
      setCopiedCode(null)
    }
  }

  const handleSaveCode = (code) => {
    const updated = savedCodes.includes(code)
      ? savedCodes.filter((c) => c !== code)
      : [...savedCodes, code]

    setSavedCodes(updated)
    localStorage.setItem('saved_promo_codes', JSON.stringify(updated))
  }

  const categories = [
    { id: 'all', label: t('promoCategoryAll') || '📌 Tất cả' },
    { id: 'flights', label: t('promoCategoryFlights') || '✈️ Vé máy bay' },
    { id: 'transfer', label: t('promoCategoryTransfer') || '🚕 Dịch vụ sân bay' },
    { id: 'services', label: t('promoCategoryServices') || '🎁 Dịch vụ phụ' },
    { id: 'membership', label: t('promoCategoryMembership') || '👑 Thành viên' },
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_24%),linear-gradient(180deg,rgba(248,250,252,1)_0%,rgba(241,245,249,1)_100%)] px-4 py-12 pt-28 transition-colors dark:bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_24%),linear-gradient(180deg,rgba(2,6,23,1)_0%,rgba(15,23,42,1)_100%)]">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="mb-4 inline-block"
          >
            <Sparkles className={`h-12 w-12 ${isDarkMode ? 'text-orange-400' : 'text-blue-600'}`} />
          </motion.div>
          <h1 className="mb-3 text-4xl font-black text-slate-900 dark:text-white md:text-5xl">
            🎉 {t('promoPageTitle') || 'Khuyến Mãi Độc Quyền'}
          </h1>
          <p className="mx-auto max-w-2xl text-base font-bold text-slate-600 dark:text-slate-400 md:text-lg">
            {t('promoPageSubtitle') || 'Tiết kiệm lên đến 60% cho vé máy bay, dịch vụ sân bay và nhiều hơn nữa'}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('promoSearchPlaceholder') || 'Tìm kiếm mã khuyến mãi, tiêu đề...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-200 bg-white py-4 pl-12 pr-4 font-bold text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setFilterCategory(category.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`rounded-xl border-2 px-4 py-2 font-black transition-all ${
                  filterCategory === category.id
                    ? 'border-transparent bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                    : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {category.label}
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 font-black transition-all ${
                showSavedOnly
                  ? 'bg-rose-600 text-white shadow-lg'
                  : 'border-2 border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <Heart className={`h-5 w-5 ${showSavedOnly ? 'fill-white' : ''}`} />
              {t('promoSavedOnly') || 'Mã đã lưu'} ({savedCodes.length})
            </button>
          </div>
        </motion.div>

        {filteredPromos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 text-center"
          >
            <Gift className="mx-auto mb-4 h-16 w-16 text-slate-300 dark:text-slate-600" />
            <h2 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">
              {t('promoNoResults') || 'Không tìm thấy khuyến mãi'}
            </h2>
            <p className="font-bold text-slate-600 dark:text-slate-400">
              {t('promoTrySearch') || 'Thử tìm kiếm hoặc lọc khác'}
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredPromos.map((promo, index) => (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative"
                >
                  {promo.shine && (
                    <motion.div
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
                    />
                  )}

                  <div className="relative flex h-full flex-col rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-2xl dark:border-slate-700 dark:bg-slate-800/90">
                    <div className={`absolute -top-3 -right-3 rounded-full bg-gradient-to-r ${promo.accent} px-4 py-1 text-xs font-black text-white shadow-lg rotate-12`}>
                      {promo.badge}
                    </div>

                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">{promo.title}</h3>
                        <p className="mt-2 text-sm font-bold leading-6 text-slate-600 dark:text-slate-400">
                          {promo.description}
                        </p>
                      </div>
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${promo.accent} text-white shadow-lg`}>
                        <Percent className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="mb-4 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 dark:border-blue-700 dark:from-blue-900/30 dark:to-cyan-900/20">
                      <p className="mb-1 text-xs font-black uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
                        {t('promoDiscountLabel') || 'Mức giảm'}
                      </p>
                      <p className="text-3xl font-black text-blue-600 dark:text-blue-300">
                        {promo.type === 'percent'
                          ? `${promo.discount}%`
                          : formatPrice(convertPrice(promo.discount))}
                      </p>
                      {promo.minPrice > 0 && (
                        <p className="mt-2 text-xs font-bold text-blue-500 dark:text-blue-300/90">
                          {t('promoMinimumOrderLabel') || 'Đơn hàng tối thiểu'}: {formatPrice(convertPrice(promo.minPrice))}
                        </p>
                      )}
                    </div>

                    <div className="mb-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-900/60">
                      <p className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                        {t('promoCodeLabel') || 'Mã'}
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate font-mono text-lg font-black tracking-[0.24em] text-slate-900 dark:text-white">
                          {promo.code}
                        </p>
                        <Tag className="h-4 w-4 shrink-0 text-slate-400" />
                      </div>
                    </div>

                    <div className="mb-5 space-y-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <p>📊 {t('promoUsedLabel') || 'Đã sử dụng'}: {promo.usageCount.toLocaleString('vi-VN')}</p>
                      <p>⏰ {t('promoExpiryLabel') || 'Hết hạn'}: {new Date(promo.expiryDate).toLocaleDateString('vi-VN')}</p>
                    </div>

                    <div className="mt-auto flex gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                      <motion.button
                        onClick={() => handleCopyCode(promo.code)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3 font-black text-white transition-all hover:shadow-lg"
                      >
                        {copiedCode === promo.code ? (
                          <>
                            <Check className="h-4 w-4" /> {t('promoCopied') || 'Đã copy!'}
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" /> {t('promoCopy') || 'Copy'}
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        onClick={() => handleSaveCode(promo.code)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className={`rounded-xl px-4 py-3 font-black transition-all ${
                          savedCodes.includes(promo.code)
                            ? 'bg-rose-600 text-white'
                            : 'border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                        aria-label="Save promo code"
                      >
                        <Heart className={`h-4 w-4 ${savedCodes.includes(promo.code) ? 'fill-white' : ''}`} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 rounded-2xl border-2 border-yellow-200 bg-yellow-50 p-6 text-center dark:border-yellow-700 dark:bg-yellow-900/20"
        >
          <p className="text-sm font-bold text-yellow-800 dark:text-yellow-400">
            ⚠️ {t('promoWarning') || 'Các mã khuyến mãi này chỉ dùng một lần và có thể kết hợp với các chương trình khác. Điều kiện áp dụng có thể thay đổi bất kỳ lúc nào.'}
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Promotions
