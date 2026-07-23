import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Search, RotateCcw, ArrowLeft, Zap, Shield, Gift, Star, TrendingUp, Wifi } from 'lucide-react'
import axios from 'axios'
import API_BASE from '../config/api'
import { motion, AnimatePresence } from 'framer-motion'
import SeatMap from '../components/SeatMap'
import { useI18n } from '../context/I18nContext'

// ========================================================
// SEEDED PSEUDO-RANDOM: tránh trùng lặp giữa các chuyến bay
// ========================================================
const seededRand = (seed) => {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

const Flights = () => {
  const { t, convertPrice, formatPriceWithCode } = useI18n()

  const AIRLINES = [
    { code: 'VN', name: 'Vietnam Airlines',    logo: '🇻🇳' },
    { code: 'VJ', name: 'VietJet Air',          logo: '✈️'  },
    { code: 'BA', name: 'British Airways',      logo: '🇬🇧' },
    { code: 'TG', name: 'Thai Airways',         logo: '🇹🇭' },
    { code: 'SQ', name: 'Singapore Airlines',   logo: '🇸🇬' },
    { code: 'CX', name: 'Cathay Pacific',       logo: '🇭🇰' },
    { code: 'KA', name: 'Kangaroo Airline',     logo: '🦘'  },
    { code: 'AK', name: 'Air Asia',             logo: '🚁'  },
    { code: 'UA', name: 'United Airlines',      logo: '🇺🇸' },
    { code: 'AF', name: 'Air France',           logo: '🇫🇷' },
  ]

  // =====================================================
  // AIRCRAFT TYPES: mở rộng lên 18 loại
  // =====================================================
  const AIRCRAFT_TYPES = [
    { code: 'B787', name: 'Boeing 787 Dreamliner',   capacity: 242 },
    { code: 'A380', name: 'Airbus A380',              capacity: 555 },
    { code: 'A350', name: 'Airbus A350-900',          capacity: 325 },
    { code: 'B777', name: 'Boeing 777-300ER',         capacity: 396 },
    { code: 'A330', name: 'Airbus A330-300',          capacity: 295 },
    { code: 'B737', name: 'Boeing 737 MAX 9',         capacity: 189 },
    { code: 'A320', name: 'Airbus A320neo',           capacity: 194 },
    { code: 'A321', name: 'Airbus A321neo XLR',       capacity: 244 },
    { code: 'B767', name: 'Boeing 767-400ER',         capacity: 375 },
    { code: 'Q400', name: 'Bombardier Q400',          capacity: 76  },
    { code: 'E195', name: 'Embraer E195-E2',          capacity: 146 },
    { code: 'CRJ9', name: 'Bombardier CRJ-900',       capacity: 90  },
    { code: 'B748', name: 'Boeing 747-8 Intercontinental', capacity: 467 },
    { code: 'A220', name: 'Airbus A220-300',          capacity: 160 },
    { code: 'B788', name: 'Boeing 787-9 Dreamliner',  capacity: 296 },
    { code: 'A359', name: 'Airbus A350-1000',         capacity: 369 },
    { code: 'B789', name: 'Boeing 787-10',            capacity: 330 },
    { code: 'ATR7', name: 'ATR 72-600',               capacity: 78  },
  ]

  // =====================================================
  // ENRICH: đảm bảo MỌI chuyến bay (kể cả từ API thật)
  // đều có aircraft, seats_available, rating hợp lệ
  // Dùng seed từ flight_number → ổn định, không nhảy số
  // =====================================================
  const enrichFlight = (f) => {
    // Tạo seed từ chuỗi flight_number (hoặc id) để ổn định
    const str = String(f.flight_number || f.id || 'x')
    let seed = 0
    for (let i = 0; i < str.length; i++) seed = seed * 31 + str.charCodeAt(i)
    const rand = seededRand(Math.abs(seed))

    const aircraftIdx    = Math.floor(rand() * AIRCRAFT_TYPES.length)
    const aircraft       = AIRCRAFT_TYPES[aircraftIdx]
    const seatsAvailable = 5  + Math.floor(rand() * 76)           // 5 – 80
    const rating         = (3.0 + rand() * 2.0).toFixed(1)        // 3.0 – 5.0

    return {
      ...f,
      aircraft:        f.aircraft        || aircraft.name,
      aircraft_code:   f.aircraft_code   || aircraft.code,
      seats_available: f.seats_available != null ? f.seats_available : seatsAvailable,
      rating:          f.rating          != null ? f.rating          : rating,
    }
  }

  // =====================================================
  // MOCK DATA: mỗi chuyến dùng seed riêng → KHÔNG trùng
  // =====================================================
  const generateMockFlights = () => {
    const mockFlights = []
    const baseRoutes = [
      { from: 'SGN', to: 'HAN', fromName: 'Hồ Chí Minh', toName: 'Hà Nội'      },
      { from: 'SGN', to: 'DAD', fromName: 'Hồ Chí Minh', toName: 'Đà Nẵng'     },
      { from: 'HAN', to: 'SGN', fromName: 'Hà Nội',       toName: 'Hồ Chí Minh' },
      { from: 'DAD', to: 'SGN', fromName: 'Đà Nẵng',      toName: 'Hồ Chí Minh' },
      { from: 'SGN', to: 'PQC', fromName: 'Hồ Chí Minh', toName: 'Phú Quốc'    },
      { from: 'HAN', to: 'DAD', fromName: 'Hà Nội',       toName: 'Đà Nẵng'     },
    ]

    baseRoutes.forEach((route, routeIdx) => {
      AIRLINES.forEach((airline, airlineIdx) => {
        // Seed dựa trên vị trí → mỗi chuyến có bộ số ngẫu nhiên ổn định nhưng khác nhau
        const flightSeed = routeIdx * 1000 + airlineIdx * 37 + 42
        const rand = seededRand(flightSeed)

        const depHour  = 5 + Math.floor(rand() * 18)          // 05:00 – 22:xx
        const depMin   = Math.floor(rand() * 60)
        const depTime  = new Date(2026, 4, 15, depHour, depMin)
        const duration = 1.5 + rand() * 3.5                   // 1.5h – 5h
        const arrTime  = new Date(depTime.getTime() + duration * 3600000)

        // Aircraft: random thực sự từ toàn bộ 18 loại
        const aircraftIdx = Math.floor(rand() * AIRCRAFT_TYPES.length)
        const aircraft    = AIRCRAFT_TYPES[aircraftIdx]

        // Ghế còn trống: phân bố rộng 5 – 80
        const seatsAvailable = 5 + Math.floor(rand() * 76)

        // Rating: 3.0 – 5.0, bước 0.1
        const rating = (3.0 + rand() * 2.0).toFixed(1)

        // Giá: phân tán theo loại máy bay (hạng to = đắt hơn)
        const basePrice = 800000 + rand() * 4500000 + aircraft.capacity * 500

        const flightNum = `${airline.code}${Math.floor(rand() * 900 + 100)}`

        mockFlights.push({
          id: `${routeIdx * 100 + airlineIdx}`,
          flight_number: flightNum,
          airline: airline.name,
          airline_code: airline.code,
          airline_logo: airline.logo,
          aircraft: aircraft.name,
          aircraft_code: aircraft.code,
          aircraft_capacity: aircraft.capacity,
          price: Math.round(basePrice),
          departure_airport: { code: route.from, city: route.fromName },
          arrival_airport:   { code: route.to,   city: route.toName   },
          departure_time: depTime.toISOString(),
          arrival_time:   arrTime.toISOString(),
          duration: `${Math.floor(duration)}h ${Math.round((duration % 1) * 60)}m`,
          seats_available: seatsAvailable,
          rating,
        })
      })
    })

    return mockFlights
  }

  // =====================================================
  // STATE
  // =====================================================
  const [selectedFlight, setSelectedFlight] = useState(null)
  const location = useLocation()
  const [flights, setFlights]         = useState([])
  const [airports, setAirports]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [searchParams, setSearchParams] = useState({
    departure_id: '',
    arrival_id:   '',
    travel_date:  '2026-05-01',
  })

  const initData = async () => {
    setLoading(true)
    try {
      const airportsRes = await axios.get(`${API_BASE}/api/airports`)
      setAirports(airportsRes.data)
      if (location.state?.departure) {
        const { departure, arrival, date } = location.state
        setSearchParams({ departure_id: departure, arrival_id: arrival, travel_date: date || '2026-05-01' })
        try {
          const res = await axios.get(`${API_BASE}/api/flights/search`, {
            params: { dep_id: departure, arr_id: arrival, flight_date: date },
          })
          setFlights(res.data.map(enrichFlight))
        } catch { setFlights(generateMockFlights()) }
        setIsSearching(true)
      } else {
        try {
          const res = await axios.get(`${API_BASE}/api/flights`)
          setFlights(res.data.map(enrichFlight))
        } catch { setFlights(generateMockFlights()) }
        setIsSearching(false)
      }
    } catch { setFlights(generateMockFlights()) }
    finally { setLoading(false) }
  }

  useEffect(() => { initData() }, [location.state])

  const handleManualSearch = async () => {
    if (!searchParams.departure_id || !searchParams.arrival_id) return
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/api/flights/search`, {
        params: {
          dep_id:       searchParams.departure_id,
          arr_id:       searchParams.arrival_id,
          flight_date:  searchParams.travel_date,
        },
      })
      setFlights(res.data.map(enrichFlight))
    } catch { setFlights(generateMockFlights()) }
    finally { setIsSearching(true); setLoading(false) }
  }

  // =====================================================
  // HELPER: màu sắc cho số ghế
  // =====================================================
  const seatsColor = (n) => {
    if (n <= 10) return 'text-red-500'
    if (n <= 30) return 'text-orange-500'
    return 'text-green-500'
  }

  // =====================================================
  // SƠ ĐỒ GHẾ
  // =====================================================
  if (selectedFlight) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-28 pb-20 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <button
            onClick={() => setSelectedFlight(null)}
            className="flex items-center gap-2 mb-8 text-blue-600 font-bold hover:text-blue-700 hover:underline transition-all bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl shadow-sm w-fit uppercase"
          >
            <ArrowLeft className="w-5 h-5" /> {t('backToSearch') || 'QUAY LẠI'}
          </button>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <SeatMap flight={selectedFlight} />
          </motion.div>
        </div>
      </div>
    )
  }

  // =====================================================
  // QUẢNG CÁO: dữ liệu cho 2 cột bên
  // =====================================================
  const LEFT_ADS = [
    {
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      tag: 'HOT DEAL',
      tagColor: 'bg-red-500',
      title: 'Flash Sale 50%',
      desc: 'Vé nội địa chỉ từ 199K – áp dụng đến 23:59 hôm nay!',
      cta: 'Săn ngay',
      gradient: 'from-orange-500 to-red-600',
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-300" />,
      tag: 'BẢO HIỂM',
      tagColor: 'bg-blue-500',
      title: 'Bảo hiểm Du Lịch',
      desc: 'An tâm bay với gói bảo hiểm toàn diện từ 29K/chuyến.',
      cta: 'Tìm hiểu',
      gradient: 'from-blue-600 to-indigo-700',
    },
    {
      icon: <Wifi className="w-6 h-6 text-green-300" />,
      tag: 'TIỆN ÍCH',
      tagColor: 'bg-green-600',
      title: 'eSIM Du Lịch',
      desc: 'Kết nối không giới hạn tại 50+ quốc gia, dùng ngay khi hạ cánh.',
      cta: 'Mua eSIM',
      gradient: 'from-emerald-500 to-teal-600',
    },
  ]

  const RIGHT_ADS = [
    {
      icon: <Gift className="w-6 h-6 text-pink-300" />,
      tag: 'ƯU ĐÃI',
      tagColor: 'bg-pink-500',
      title: 'Combo Khách Sạn',
      desc: 'Đặt vé + khách sạn tiết kiệm đến 35% – hơn 2.000 khách sạn đối tác.',
      cta: 'Xem combo',
      gradient: 'from-pink-500 to-rose-600',
    },
    {
      icon: <Star className="w-6 h-6 text-amber-300" />,
      tag: 'THÀNH VIÊN',
      tagColor: 'bg-amber-500',
      title: 'Tích Điểm VIP',
      desc: 'Mỗi vé tích 500 điểm – đổi vé miễn phí sau 10 chuyến bay.',
      cta: 'Đăng ký',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-purple-300" />,
      tag: 'GIÁ TỐT',
      tagColor: 'bg-purple-600',
      title: 'Theo Dõi Giá',
      desc: 'Nhận thông báo khi giá vé bạn muốn giảm xuống mức kỳ vọng.',
      cta: 'Bật cảnh báo',
      gradient: 'from-purple-600 to-violet-700',
    },
  ]

  const AdCard = ({ ad }) => (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative bg-gradient-to-br ${ad.gradient} rounded-2xl p-4 text-white shadow-lg overflow-hidden cursor-pointer select-none`}
    >
      {/* decorative circles */}
      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />

      <span className={`inline-block ${ad.tagColor} text-[9px] font-black px-2 py-0.5 rounded-full mb-2 uppercase tracking-widest`}>
        {ad.tag}
      </span>
      <div className="flex items-center gap-2 mb-1">
        {ad.icon}
        <span className="font-black text-sm leading-tight">{ad.title}</span>
      </div>
      <p className="text-[11px] text-white/80 leading-snug mb-3">{ad.desc}</p>
      <button className="text-[11px] font-black bg-white/20 hover:bg-white/30 transition px-3 py-1 rounded-xl">
        {ad.cta} →
      </button>
    </motion.div>
  )

  // =====================================================
  // RENDER CHÍNH
  // =====================================================
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-28 pb-20 transition-colors">
      {/* === LAYOUT 3 CỘT === */}
      <div className="max-w-[1600px] mx-auto px-4 flex gap-6 items-start">

        {/* ---- CỘT TRÁI: QUẢNG CÁO ---- */}
        <aside className="hidden xl:flex flex-col gap-4 w-52 shrink-0 sticky top-28">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center mb-1">Quảng cáo</p>
          {LEFT_ADS.map((ad, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }}>
              <AdCard ad={ad} />
            </motion.div>
          ))}

          {/* Banner dọc nhỏ */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-b from-slate-800 to-slate-900 dark:from-slate-700 rounded-2xl p-4 text-center text-white shadow-lg border border-slate-700"
          >
            <div className="text-3xl mb-2">🌏</div>
            <p className="text-[11px] font-black uppercase tracking-wide">Khám phá</p>
            <p className="text-[10px] text-slate-400 mt-1">50+ điểm đến hot nhất 2026</p>
            <button className="mt-3 text-[10px] font-black bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-xl w-full transition">
              Xem ngay
            </button>
          </motion.div>
        </aside>

        {/* ---- CỘT GIỮA: NỘI DUNG CHÍNH ---- */}
        <main className="flex-1 min-w-0">

          {/* THANH TÌM KIẾM */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-xl mb-12 flex flex-wrap gap-4 items-end border border-slate-100 dark:border-slate-700">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-black text-slate-400 ml-2 uppercase tracking-widest">{t('departurePoint')}</label>
              <select
                value={searchParams.departure_id}
                onChange={(e) => setSearchParams({ ...searchParams, departure_id: e.target.value })}
                className="w-full mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-bold"
              >
                <option value="">{t('selectAirport')}</option>
                {airports.map(ap => <option key={ap.id} value={ap.id}>{ap.city} ({ap.code})</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-black text-slate-400 ml-2 uppercase tracking-widest">{t('arrivalPoint')}</label>
              <select
                value={searchParams.arrival_id}
                onChange={(e) => setSearchParams({ ...searchParams, arrival_id: e.target.value })}
                className="w-full mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-bold"
              >
                <option value="">{t('selectAirport')}</option>
                {airports.map(ap => <option key={ap.id} value={ap.id}>{ap.city} ({ap.code})</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs font-black text-slate-400 ml-2 uppercase tracking-widest">{t('date')}</label>
              <input
                type="date"
                value={searchParams.travel_date}
                onChange={(e) => setSearchParams({ ...searchParams, travel_date: e.target.value })}
                className="w-full mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-bold"
              />
            </div>
            <button
              onClick={handleManualSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 transition-all shadow-lg"
            >
              <Search className="w-5 h-5" /> {t('searchAgain')}
            </button>
          </div>

          {/* HEADER DANH SÁCH */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {isSearching ? `📍 ${t('searchResults') || 'Kết quả tìm kiếm'}` : `✈️ ${t('allFlights')}`}
            </h2>
            {flights.length > 0 && (
              <button onClick={() => setIsSearching(false)} className="flex items-center gap-2 text-blue-600 font-bold uppercase">
                <RotateCcw className="w-4 h-4" /> {t('clearFilters')}
              </button>
            )}
          </div>

          {/* LOADING */}
          {loading && (
            <div className="text-center py-32">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              <p className="mt-4 text-slate-500 font-bold">{t('loadingFlights') || 'Đang tải chuyến bay...'}</p>
            </div>
          )}

          {/* DANH SÁCH CHUYẾN BAY */}
          {!loading && (
            <div className="space-y-4">
              {flights?.length > 0 ? flights.map((f, idx) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-lg hover:shadow-2xl transition-all border border-slate-100 dark:border-slate-700 flex flex-col lg:flex-row items-center justify-between gap-6"
                >
                  {/* Hãng bay */}
                  <div className="flex flex-col items-center min-w-[80px]">
                    <div className="text-3xl mb-2">{f.airline_logo || f.airline_code}</div>
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 text-center leading-tight">
                      {f.airline || 'Unknown'}
                    </div>
                    <div className="bg-blue-600 text-white px-2 py-1 rounded-lg font-black text-xs mt-2">
                      {f.flight_number}
                    </div>
                  </div>

                  {/* Thời gian & Route */}
                  <div className="flex items-center gap-8 flex-1">
                    <div className="text-center">
                      <div className="text-2xl font-black dark:text-white">
                        {new Date(f.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs font-black text-blue-600 uppercase">{f.departure_airport?.code}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{f.departure_airport?.city}</div>
                    </div>
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <div className="w-full h-[2px] bg-slate-200 dark:bg-slate-700 relative">
                        <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_blue]" />
                      </div>
                      <div className="text-[10px] font-bold text-slate-500">{f.duration}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black dark:text-white">
                        {new Date(f.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-xs font-black text-orange-500 uppercase">{f.arrival_airport?.code}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{f.arrival_airport?.city}</div>
                    </div>
                  </div>

                  {/* Máy bay / Ghế / Đánh giá */}
                  <div className="hidden md:flex items-center gap-5">
                    <div className="text-center">
                      <div className="text-[10px] font-black text-slate-400 uppercase mb-1">{t('aircraft')}</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">{f.aircraft_code}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 max-w-[80px] leading-tight">{f.aircraft}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] font-black text-slate-400 uppercase mb-1">{t('seatsAvailable')}</div>
                      <div className={`text-lg font-black ${seatsColor(f.seats_available)}`}>
                        {f.seats_available}
                      </div>
                      {f.seats_available <= 10 && (
                        <div className="text-[9px] text-red-500 font-bold">Sắp hết!</div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] font-black text-slate-400 uppercase mb-1">{t('rating')}</div>
                      <div className="text-lg font-black text-yellow-500">⭐ {f.rating}</div>
                    </div>
                  </div>

                  {/* Giá & Nút đặt */}
                  <div className="flex items-center gap-6 w-full lg:w-auto lg:flex-col xl:flex-row">
                    <div className="text-right flex-1 lg:flex-none">
                      <div className="text-[10px] font-black text-slate-400 uppercase">{t('ticketPrice')}</div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white whitespace-nowrap">
                        {formatPriceWithCode(convertPrice(f.price))}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFlight(f)}
                      className="bg-slate-900 dark:bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-600 dark:hover:bg-blue-700 transition-all active:scale-95 shadow-xl whitespace-nowrap"
                    >
                      {t('bookNow')}
                    </button>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-32 bg-white dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-slate-400 font-black text-xl mb-4">{t('noFlightsFound') || 'Không tìm thấy chuyến nào rồi.'}</p>
                  <button onClick={initData} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700">
                    {t('viewAllFlights') || 'XEM LẠI TOÀN BỘ CHUYẾN BAY'}
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* ---- CỘT PHẢI: QUẢNG CÁO ---- */}
        <aside className="hidden xl:flex flex-col gap-4 w-52 shrink-0 sticky top-28">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center mb-1">Đề xuất</p>
          {RIGHT_ADS.map((ad, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }}>
              <AdCard ad={ad} />
            </motion.div>
          ))}

          {/* Widget thời tiết giả */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl p-4 text-white shadow-lg"
          >
            <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-2">Thời tiết điểm đến</p>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-black text-lg">Hà Nội</p>
                <p className="text-[11px] opacity-80">Nhiều mây</p>
              </div>
              <span className="text-3xl">⛅</span>
            </div>
            <p className="text-2xl font-black">28°C</p>
            <div className="flex gap-3 mt-2 text-[10px] opacity-80">
              <span>💧 72%</span>
              <span>💨 15 km/h</span>
            </div>
          </motion.div>
        </aside>

      </div>
    </div>
  )
}

export default Flights