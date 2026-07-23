import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import API_BASE from '../config/api'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '../context/I18nContext'
import FlightSearch from '../components/FlightSearch'
import {
  PlaneTakeoff,
  Coffee,
  Wifi,
  Users,
  Zap,
  Headphones,
  Shield,
  Map,
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  Utensils,
  ChefHat,
  Wine,
  Crown,
  Copy,
  CheckCircle2,
  Sparkles,
  Rocket,
  Gift
} from 'lucide-react'
import imgWagyu from '../assets/food/bo_wagyu.jpg'
import imgTomHum from '../assets/food/tom_hum.jpg'
import imgRuouVang from '../assets/food/ruou_vang.jpg'
import imgCaviar from '../assets/food/caviar.jpg'

const Home = () => {
  const navigate = useNavigate()
  const { t, formatPrice, convertPrice } = useI18n()

  const [flights, setFlights] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentFoodImg, setCurrentFoodImg] = useState(0)
  const [copiedCode, setCopiedCode] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [hoveredFlight, setHoveredFlight] = useState(null)
  const sliderRef = useRef(null)

  const foodImages = [imgWagyu, imgTomHum, imgRuouVang, imgCaviar]

  const DESTINATIONS = [
    { id: 1, name: t('tokyo') || 'Tokyo', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop', discount: '15%', rating: '4.8', price: '8.5M' },
    { id: 2, name: t('singapore') || 'Singapore', img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1952&auto=format&fit=crop', discount: '20%', rating: '4.9', price: '5.2M' },
    { id: 3, name: t('seoul') || 'Seoul', img: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=2070&auto=format&fit=crop', discount: '12%', rating: '4.7', price: '6.8M' },
    { id: 4, name: t('paris') || 'Paris', img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2020&auto=format&fit=crop', discount: '25%', rating: '5.0', price: '12.5M' },
    { id: 5, name: t('sydney') || 'Sydney', img: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=2070&auto=format&fit=crop', discount: '18%', rating: '4.8', price: '10.2M' },
    { id: 6, name: t('bali') || 'Bali', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2070&auto=format&fit=crop', discount: '22%', rating: '4.9', price: '3.5M' },
    { id: 7, name: t('london') || 'London', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070&auto=format&fit=crop', discount: '10%', rating: '4.8', price: '11.5M' },
    { id: 8, name: t('newyork') || 'New York', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2070&auto=format&fit=crop', discount: '30%', rating: '4.9', price: '15.0M' },
    { id: 9, name: t('bangkok') || 'Bangkok', img: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=2070&auto=format&fit=crop', discount: '15%', rating: '4.6', price: '2.8M' },
    { id: 10, name: t('taipei') || 'Taipei', img: 'https://images.unsplash.com/photo-1552912003-882209635562?q=80&w=2070&auto=format&fit=crop', discount: '20%', rating: '4.7', price: '4.5M' },
  ]

  const AMENITIES = [
    { icon: Wifi, label: t('wifiLabel') || 'WiFi 5G', color: 'from-emerald-700 to-stone-700' },
    { icon: Coffee, label: t('cafeLabel') || 'Premium Café', color: 'from-amber-700 to-stone-600' },
    { icon: Users, label: t('loungeLabel') || 'Lounge Access', color: 'from-stone-600 to-emerald-700' },
    { icon: Zap, label: t('chargingLabel') || 'USB Charging', color: 'from-emerald-700 to-stone-700' },
    { icon: Headphones, label: t('entertainmentLabel') || 'Entertainment', color: 'from-stone-700 to-emerald-700' },
    { icon: Shield, label: t('insuranceLabel') || 'Travel Insurance', color: 'from-emerald-700 to-stone-700' },
  ]

  const featuredPromos = [
    {
      badge: t('promoHotBadge') || '🔥 HOT',
      title: t('promo1'),
      sub: t('promo1Sub'),
      code: 'SUMMER26',
      img: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070',
      overlay: 'from-emerald-950/90 to-stone-700/50',
      hasCode: true,
    },
    {
      badge: t('promoExclusiveBadge') || '👑 EXCLUSIVE',
      title: t('promo2'),
      sub: t('promo2Sub'),
      code: '',
      img: 'https://images.unsplash.com/photo-1540339832862-4745ea79cebd?q=80&w=2070',
      overlay: 'from-stone-900/90 to-amber-800/50',
      hasCode: false,
    },
    {
      badge: t('promoFastBadge') || '⚡ FLASH',
      title: t('promo3') || 'Bay Đêm Tiết Kiệm',
      sub: t('promo3Sub') || 'Giảm ngay 30% vé các chuyến bay khởi hành sau 22h mỗi ngày.',
      code: 'NIGHTOWL',
      img: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144',
      overlay: 'from-emerald-950/90 to-stone-800/45',
      hasCode: true,
    },
    {
      badge: t('promoFamilyBadge') || '👨‍👩‍👧‍👦 FAMILY',
      title: t('promo4') || 'Trọn Gói Gia Đình',
      sub: t('promo4Sub') || 'Mua 3 tặng 1 vé cho hành khách bay cùng trẻ em dưới 12 tuổi.',
      code: 'FAMILYFLY',
      img: 'https://images.unsplash.com/photo-1506869640319-ce1a44867630?q=80&w=2070',
      overlay: 'from-emerald-950/90 to-stone-700/50',
      hasCode: true,
    },
  ]

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const toggleFavorite = (destId) => {
    setFavorites((prev) => (prev.includes(destId) ? prev.filter((id) => id !== destId) : [...prev, destId]))
  }

  const scrollLeft = () => sliderRef.current?.scrollBy({ left: -350, behavior: 'smooth' })
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 350, behavior: 'smooth' })

  useEffect(() => {
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          sliderRef.current.scrollBy({ left: 350, behavior: 'smooth' })
        }
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFoodImg((prev) => (prev + 1) % foodImages.length)
    }, 4000)

    return () => clearInterval(timer)
  }, [foodImages.length])

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/flights`)
      .then((res) => setFlights(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const displayFlights =
    flights.length > 0
      ? flights
      : [
          { id: 991, flight_number: 'KGR-888', price: 1500000, departure_airport: { code: 'SGN', city: 'Hồ Chí Minh' }, arrival_airport: { code: 'HAN', city: 'Hà Nội' } },
          { id: 992, flight_number: 'KGR-999', price: 2200000, departure_airport: { code: 'DAD', city: 'Đà Nẵng' }, arrival_airport: { code: 'PQC', city: 'Phú Quốc' } },
          { id: 993, flight_number: 'KGR-666', price: 5400000, departure_airport: { code: 'SGN', city: 'Hồ Chí Minh' }, arrival_airport: { code: 'SIN', city: 'Singapore' } },
        ]

  return (
    /* Thêm overflow-x-hidden vào class root để tuyệt đối không bị thanh cuộn ngang */
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-stone-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300 pb-20 pt-20 sm:pt-24 lg:pt-28">
      <section className="relative h-[80vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center">
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute inset-0"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/60 via-stone-950/55 to-emerald-900/60" />

        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-20 right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-10 left-10 w-60 h-60 bg-stone-500/10 rounded-full blur-3xl"
        />


        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md"
          >
            <Rocket className="w-4 h-4" />
            <span className="text-sm font-bold uppercase tracking-widest">{t('summerBadge')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-6 text-center text-6xl font-black leading-tight tracking-tighter md:text-8xl"
          >
            {t('heroTitle')} <br />
            <span className="bg-gradient-to-r from-emerald-300 via-stone-200 to-amber-300 bg-clip-text text-transparent">
              {t('heroSubtitle')}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-10 max-w-2xl text-center text-xl font-medium text-slate-200 md:text-2xl"
          >
            {t('heroDesc')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <button
              onClick={() => navigate('/flights')}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-700 to-stone-700 px-10 py-4 text-lg font-black text-white shadow-2xl transition-all hover:from-emerald-800 hover:to-stone-800 hover:shadow-3xl active:scale-95"
            >
              <PlaneTakeoff className="h-6 w-6" />
              {t('search')}
            </button>
            <button
              onClick={() => navigate('/offers')}
              className="rounded-2xl border border-white/30 bg-white/10 px-10 py-4 text-lg font-black text-white backdrop-blur-md transition-all hover:bg-white/20 hover:shadow-xl"
            >
              {t('offers')}
            </button>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <div className="text-sm font-bold text-white/60">{t('scrollDown')}</div>
            <div className="mx-auto mt-2 h-8 w-[2px] bg-gradient-to-b from-white/60 to-transparent" />
          </motion.div>
        </div>
      </section>

      <section className="relative z-30 mt-6 px-4 sm:mt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-visible rounded-[2rem] bg-white/85 shadow-[0_20px_80px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70 backdrop-blur-xl dark:bg-slate-800/85 dark:ring-slate-700/70">
          <FlightSearch />
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-6xl px-4 py-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
          {AMENITIES.map((amenity, idx) => {
            const IconComponent = amenity.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8, scale: 1.05 }}
                className={`group cursor-pointer rounded-2xl bg-gradient-to-br ${amenity.color} p-6 text-center text-white shadow-lg transition-all transform`}
              >
                <IconComponent className="mx-auto mb-2 h-8 w-8 transition-transform group-hover:scale-110" />
                <p className="text-sm font-black">{amenity.label}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Đã xóa w-screen và left-1/2 để chống tràn viền */}
      <section className="relative mx-auto mt-24 w-full max-w-7xl px-4 lg:px-8">
        <div className="mb-12 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-700 to-stone-700 p-3">
              <Map className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t('popularDestinations')}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('hotnestDestinations')}</p>
            </div>
          </motion.div>
          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={scrollLeft} className="rounded-full bg-white p-3 shadow-lg transition-all hover:shadow-xl dark:bg-slate-800">
              <ChevronLeft className="h-5 w-5 text-slate-800 dark:text-white" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={scrollRight} className="rounded-full bg-white p-3 shadow-lg transition-all hover:shadow-xl dark:bg-slate-800">
              <ChevronRight className="h-5 w-5 text-slate-800 dark:text-white" />
            </motion.button>
          </div>
        </div>

        <div ref={sliderRef} className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-8 scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {DESTINATIONS.map((dest) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -12 }}
              className="relative h-80 min-w-[300px] flex-shrink-0 snap-start cursor-pointer overflow-hidden rounded-3xl shadow-lg group md:min-w-[350px]"
            >
              <img src={dest.img} alt={dest.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/30 to-transparent" />

              <motion.div whileHover={{ scale: 1.15 }} className="absolute right-4 top-4 rounded-2xl bg-emerald-700/90 px-4 py-2 backdrop-blur-md shadow-lg shadow-emerald-700/20">
                <p className="text-lg font-black text-white">{dest.discount}</p>
              </motion.div>

              <div className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-md">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-bold text-white">{dest.rating}</span>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="mb-2 text-3xl font-black text-white">{dest.name}</h3>
                <p className="mb-4 text-lg font-bold text-emerald-200">{t('priceFromLabel') || 'Từ'} {dest.price}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate('/flights')}
                    className="flex-1 rounded-xl bg-emerald-700 py-2.5 font-black text-white transition-all hover:bg-emerald-800 shadow-lg shadow-emerald-700/20"
                  >
                    {t('bookNowButton')}
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleFavorite(dest.id)}
                      className={`rounded-xl p-2.5 transition-all ${
                      favorites.includes(dest.id) ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-700/20' : 'bg-stone-700/20 text-white hover:bg-stone-700/30'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${favorites.includes(dest.id) ? 'fill-current' : ''}`} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto mt-24 w-full max-w-7xl overflow-hidden px-4 lg:px-8">
        <div className="mb-12 flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-stone-700 to-emerald-700 p-3">
            <PlaneTakeoff className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t('featuredFlights')}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('featuredFlightsSubtitle') || 'Các chuyến bay được yêu thích hôm nay'}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="h-14 w-14 rounded-full border-4 border-emerald-100 border-t-emerald-700 dark:border-slate-700 dark:border-t-stone-400"
            />
          </div>
        ) : (
          <>
            <style>{`
              @keyframes marqueeFlights {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-marquee-flights {
                display: flex;
                width: max-content;
                animation: marqueeFlights 200s linear infinite;
              }
              .animate-marquee-flights:hover {
                animation-play-state: paused;
              }
            `}</style>

            <div className="flex w-full overflow-hidden py-6">
              <div className="animate-marquee-flights gap-8 pr-8">
                {[...(displayFlights || []), ...(displayFlights || [])].map((f, index) => (
              <motion.div
                key={f?.id ? `${f.id}-${index}` : index}
                onHoverStart={() => setHoveredFlight(f?.id)}
                onHoverEnd={() => setHoveredFlight(null)}
                whileHover={{ scale: 1.05, y: -8 }}
                className="group flex w-[340px] shrink-0 cursor-pointer flex-col justify-between gap-4 rounded-[2.5rem] border border-stone-100 bg-gradient-to-br from-stone-50 to-white p-6 shadow-lg transition-all duration-300 hover:shadow-2xl dark:border-slate-700 dark:from-slate-800 dark:to-slate-900 md:w-[500px]"
              >
                    <div className="flex flex-1 items-center justify-between gap-4 md:gap-6">
                      <div className="min-w-[60px] text-center">
                        <p className="text-2xl font-black text-slate-900 dark:text-white md:text-3xl">{f?.departure_airport?.code || '---'}</p>
                        <p className="mt-1 text-[10px] font-bold uppercase text-slate-400">{f?.departure_airport?.city || 'City'}</p>
                      </div>

                      <div className="flex flex-1 flex-col items-center gap-2">
                        <span className="whitespace-nowrap rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700 shadow-sm dark:border-slate-600 dark:bg-slate-700 dark:text-emerald-400">
                          {f?.flight_number || 'N/A'}
                        </span>
                        <div className="relative h-[2px] w-full bg-gradient-to-r from-slate-200 via-emerald-500 to-stone-300 dark:from-slate-600 dark:via-emerald-500 dark:to-stone-600">
                          <motion.div
                            animate={hoveredFlight === f?.id ? { x: [0, 8, 0] } : {}}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute left-1/2 -top-1.5 h-3 w-3 -translate-x-1/2 rounded-full bg-emerald-500 shadow-lg"
                          />
                        </div>
                      </div>

                      <div className="min-w-[60px] text-center">
                        <p className="text-2xl font-black text-slate-900 dark:text-white md:text-3xl">{f?.arrival_airport?.code || '---'}</p>
                        <p className="mt-1 text-[10px] font-bold uppercase text-slate-400">{f?.arrival_airport?.city || 'City'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">{t('priceFromLabel') || 'Giá từ'}</p>
                        <div className="mt-1 flex items-baseline gap-1">
                          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 md:text-3xl">
                            {f?.price && !isNaN(f.price) ? formatPrice(convertPrice(Number(f.price))) : '---'}
                          </p>
                          <span className="text-xs font-bold text-slate-400">{t('currencyLabel') || 'VNĐ'}</span>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/flights')}
                        className="rounded-2xl bg-gradient-to-r from-emerald-700 to-stone-700 px-6 py-3 font-black text-white transition-all hover:shadow-xl"
                      >
                        {t('bookNowButton') || 'Đặt'}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      {/* Đã xóa w-screen và quy hoạch lại thành max-w-7xl để không bị tràn viền */}
      <section className="relative mx-auto mt-24 w-full max-w-7xl px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          className="group flex w-full flex-col overflow-hidden rounded-[3rem] border border-stone-100 bg-gradient-to-br from-stone-50 to-white shadow-2xl dark:border-slate-700 dark:from-slate-800 dark:to-slate-900 md:flex-row md:gap-12"
          >
          <div className="relative h-[400px] overflow-hidden bg-slate-900 md:h-auto md:w-[45%]">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentFoodImg}
                src={foodImages[currentFoodImg]}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                alt="Michelin Meal"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent md:bg-gradient-to-r md:from-slate-900/20" />

            <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {foodImages.map((_, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setCurrentFoodImg(idx)}
                  whileHover={{ scale: 1.2 }}
                  className={`rounded-full transition-all duration-500 ${idx === currentFoodImg ? 'h-2 w-6 bg-white' : 'h-2 w-2 bg-white/50'}`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center p-6 md:w-[55%] md:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex w-max items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-xs font-black uppercase tracking-widest text-stone-700 dark:bg-stone-500/20 dark:text-stone-300"
            >
              <Crown className="h-4 w-4" /> {t('signatureDiningLabel') || 'Kangaroo Signature Dining'}
            </motion.div>

            <h2 className="mb-6 text-3xl font-black leading-tight text-slate-900 dark:text-white md:text-4xl lg:text-5xl">
              {t('signatureDiningTitle') || 'Thưởng Vị Đỉnh Cao'} <br />
              <span className="bg-gradient-to-r from-emerald-700 to-stone-700 bg-clip-text text-transparent">
                {t('signatureDiningSubtitle') || 'Giữa Chín Tầng Mây'}
              </span>
            </h2>

            <p className="mb-10 text-base md:text-lg font-medium leading-relaxed text-slate-600 dark:text-slate-300">
              Trải nghiệm thực đơn hoàng gia được thiết kế riêng bởi các siêu đầu bếp Michelin, kết hợp cùng nguyên liệu thượng hạng tươi mới mỗi ngày.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`flex items-start gap-4 rounded-2xl p-4 transition-all duration-500 ${
                  currentFoodImg === 0 ? 'bg-stone-50 shadow-lg dark:bg-slate-700' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <div className="shrink-0 rounded-2xl bg-emerald-100 p-3 dark:bg-slate-600">
                  <Utensils className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
                </div>
                <div>
                  <p className={`text-base md:text-lg font-black transition-colors ${currentFoodImg === 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
                    {t('diningItem1Title') || 'Bò Wagyu A5 Cổ Điển'}
                  </p>
                  <p className="mt-2 text-xs md:text-sm text-slate-600 dark:text-slate-400">{t('diningItem1Desc') || 'Thăn nội bò Nhật Bản thượng hạng nướng than hoa, dùng kèm sốt nấm Truffle đen quý hiếm.'}</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`flex items-start gap-4 rounded-2xl p-4 transition-all duration-500 ${
                  currentFoodImg === 1 ? 'bg-stone-50 shadow-lg dark:bg-slate-700' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <div className="shrink-0 rounded-2xl bg-stone-100 p-3 dark:bg-slate-600">
                  <ChefHat className="h-6 w-6 text-stone-700 dark:text-stone-300" />
                </div>
                <div>
                  <p className={`text-base md:text-lg font-black transition-colors ${currentFoodImg === 1 ? 'text-stone-700 dark:text-stone-300' : 'text-slate-800 dark:text-white'}`}>
                    {t('diningItem2Title') || 'Tôm Hùm Alaska'}
                  </p>
                  <p className="mt-2 text-xs md:text-sm text-slate-600 dark:text-slate-400">{t('diningItem2Desc') || 'Tôm hùm tươi rói đánh bắt trong ngày, phủ phô mai Gruyère bỏ lò béo ngậy.'}</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`flex items-start gap-4 rounded-2xl p-4 transition-all duration-500 ${
                  currentFoodImg === 2 ? 'bg-rose-50 shadow-lg dark:bg-slate-700' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <div className="shrink-0 rounded-2xl bg-rose-100 p-3 dark:bg-slate-600">
                  <Wine className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <p className={`text-base md:text-lg font-black transition-colors ${currentFoodImg === 2 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-white'}`}>
                    {t('diningItem3Title') || 'Vang Đỏ Grand Cru'}
                  </p>
                  <p className="mt-2 text-xs md:text-sm text-slate-600 dark:text-slate-400">{t('diningItem3Desc') || 'Tuyển tập rượu vang trứ danh từ hầm rượu Bordeaux, Pháp mượt mà mọi giác quan.'}</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`flex items-start gap-4 rounded-2xl p-4 transition-all duration-500 ${
                  currentFoodImg === 3 ? 'bg-slate-100 shadow-lg dark:bg-slate-700' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <div className="shrink-0 rounded-2xl bg-slate-200 p-3 dark:bg-slate-600">
                  <Crown className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <p className={`text-base md:text-lg font-black transition-colors ${currentFoodImg === 3 ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-white'}`}>
                    {t('diningItem4Title') || 'Caviar Beluga'}
                  </p>
                  <p className="mt-2 text-xs md:text-sm text-slate-600 dark:text-slate-400">{t('diningItem4Desc') || 'Món khai vị hoàng gia phục vụ trên bánh blini Nga cùng Champagne hảo hạng.'}</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mt-24 mb-20 w-full overflow-hidden relative">
        <div className="mx-auto mb-12 flex max-w-7xl px-4 lg:px-8 items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-700 to-stone-700 p-3">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t('promoSection')}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('limitedOffersNote') || 'Ưu đãi giới hạn - Nhanh lên!'}</p>
            </div>
          </motion.div>
          <motion.button whileHover={{ x: 5 }} onClick={() => navigate('/offers')} className="flex items-center gap-2 text-sm font-bold text-emerald-700 hover:underline dark:text-emerald-400">
            {t('viewAll') || 'Xem tất cả'} <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>

        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: flex;
            width: max-content;
            animation: marquee 45s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>

        {/* Đã gỡ bỏ class "hidden" - Ưu đãi độc quyền chính thức quay lại! */}
        <div className="w-full overflow-hidden">
          <div className="animate-marquee gap-8 px-4">
            {[...featuredPromos, ...featuredPromos].map((promo, index) => (
              <motion.div
                key={`${promo.code || promo.title}-${index}`}
                whileHover={{ y: -10 }}
                className="group relative h-[320px] w-[350px] shrink-0 cursor-pointer overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl md:w-[450px]"
              >
                <img src={promo.img} alt={promo.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className={`absolute inset-0 bg-gradient-to-r ${promo.overlay}`} />

                <div className="relative z-10 flex h-full flex-col justify-between p-8">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white shadow-sm backdrop-blur-md">
                      {promo.badge}
                    </span>
                    <h3 className="mt-5 mb-2 text-2xl font-black leading-tight text-white md:text-3xl">{promo.title}</h3>
                    <p className="w-full text-sm font-medium text-white/80 md:text-base">{promo.sub}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    {promo.hasCode ? (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handleCopyCode(promo.code)}
                        className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-5 py-3 backdrop-blur-md transition-all active:scale-95 hover:bg-white/20"
                      >
                        <span className="mr-2 border-r border-white/20 pr-4 font-black tracking-widest text-white">{promo.code}</span>
                        {copiedCode === promo.code ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                            <span className="text-xs font-bold text-white">Đã lưu!</span>
                          </motion.div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Copy className="h-5 w-5 text-white" />
                            <span className="text-xs font-bold text-white">Copy</span>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/offers')}
                        className="rounded-2xl bg-white px-8 py-3.5 font-black text-slate-900 shadow-xl transition-all hover:bg-slate-100"
                      >
                        THAM GIA
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
