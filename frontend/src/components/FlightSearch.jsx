import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Calendar, ChevronDown, MapPin, PlaneTakeoff, Search, Shuffle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../context/I18nContext'

const AIRPORTS = [
  { id: 1, code: 'SGN', city: 'Hồ Chí Minh', name: 'Tân Sơn Nhất' },
  { id: 2, code: 'HAN', city: 'Hà Nội', name: 'Nội Bài' },
  { id: 3, code: 'DAD', city: 'Đà Nẵng', name: 'Đà Nẵng' },
  { id: 4, code: 'PQC', city: 'Phú Quốc', name: 'Phú Quốc' },
  { id: 5, code: 'CXR', city: 'Nha Trang', name: 'Cam Ranh' },
  { id: 6, code: 'VDO', city: 'Quảng Ninh', name: 'Vân Đồn' },
  { id: 7, code: 'HUI', city: 'Huế', name: 'Phú Bài' },
  { id: 8, code: 'DLI', city: 'Đà Lạt', name: 'Liên Khương' },
  { id: 9, code: 'VCA', city: 'Cần Thơ', name: 'Cần Thơ' },
  { id: 10, code: 'HPH', city: 'Hải Phòng', name: 'Cát Bi' },
  { id: 11, code: 'VII', city: 'Vinh', name: 'Vinh' },
  { id: 12, code: 'UIH', city: 'Quy Nhơn', name: 'Phù Cát' },
  { id: 13, code: 'THD', city: 'Thanh Hóa', name: 'Thọ Xuân' },
  { id: 14, code: 'BMV', city: 'Buôn Ma Thuột', name: 'BMT' },
  { id: 15, code: 'PXU', city: 'Pleiku', name: 'Pleiku' },
  { id: 16, code: 'TBB', city: 'Tuy Hòa', name: 'Tuy Hòa' },
  { id: 17, code: 'VKG', city: 'Rạch Giá', name: 'Rạch Giá' },
  { id: 18, code: 'VCS', city: 'Côn Đảo', name: 'Côn Đảo' },
  { id: 19, code: 'DIN', city: 'Điện Biên', name: 'Điện Biên' },
  { id: 20, code: 'VCL', city: 'Chu Lai', name: 'Chu Lai' },
  { id: 21, code: 'SIN', city: 'Singapore', name: 'Changi Intl' },
  { id: 22, code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi' },
  { id: 23, code: 'ICN', city: 'Seoul', name: 'Incheon Intl' },
  { id: 24, code: 'NRT', city: 'Tokyo', name: 'Narita Intl' },
  { id: 25, code: 'HKG', city: 'Hong Kong', name: 'Hong Kong Intl' },
  { id: 26, code: 'TPE', city: 'Đài Bắc', name: 'Taoyuan Intl' },
  { id: 27, code: 'SYD', city: 'Sydney', name: 'Kingsford Smith' },
  { id: 28, code: 'MEL', city: 'Melbourne', name: 'Melbourne Airport' },
  { id: 29, code: 'LHR', city: 'London', name: 'Heathrow' },
  { id: 30, code: 'CDG', city: 'Paris', name: 'Charles de Gaulle' },
  { id: 31, code: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport' },
  { id: 32, code: 'JFK', city: 'New York', name: 'JFK' },
  { id: 33, code: 'LAX', city: 'Los Angeles', name: 'LAX Intl' },
  { id: 34, code: 'DXB', city: 'Dubai', name: 'Dubai Intl' },
  { id: 35, code: 'KUL', city: 'Kuala Lumpur', name: 'KUL Intl' },
  { id: 36, code: 'MNL', city: 'Manila', name: 'Ninoy Aquino' },
  { id: 37, code: 'DPS', city: 'Bali', name: 'Ngurah Rai' },
  { id: 38, code: 'HND', city: 'Tokyo', name: 'Haneda Airport' },
  { id: 39, code: 'PEK', city: 'Bắc Kinh', name: 'Beijing Capital' },
  { id: 40, code: 'PVG', city: 'Thượng Hải', name: 'Pudong Intl' },
  { id: 41, code: 'BNE', city: 'Brisbane', name: 'Brisbane Airport' },
  { id: 42, code: 'AKL', city: 'Auckland', name: 'Auckland Airport' },
  { id: 43, code: 'AMS', city: 'Amsterdam', name: 'Schiphol' },
  { id: 44, code: 'SFO', city: 'San Francisco', name: 'SFO Intl' },
  { id: 45, code: 'ORD', city: 'Chicago', name: "O'Hare Intl" },
  { id: 46, code: 'DOH', city: 'Doha', name: 'Hamad Intl' },
  { id: 47, code: 'KIX', city: 'Osaka', name: 'Kansai Intl' },
  { id: 48, code: 'CNX', city: 'Chiang Mai', name: 'Chiang Mai Intl' },
  { id: 49, code: 'BKI', city: 'Kota Kinabalu', name: 'Kota Kinabalu' },
  { id: 50, code: 'USM', city: 'Koh Samui', name: 'Samui Airport' },
]

const SearchableDropdown = ({ label, value, onChange, placeholder, icon: Icon = MapPin }) => {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef(null)

  const filteredAirports = useMemo(() => {
    return AIRPORTS.filter((airport) => {
      const keyword = search.toLowerCase()
      return airport.city.toLowerCase().includes(keyword) || airport.code.toLowerCase().includes(keyword)
    })
  }, [search])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="w-full rounded-3xl border border-slate-200 bg-white/95 px-4 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900/80"
      >
        <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
          <Icon className="h-4 w-4" />
          {label}
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-base font-black text-slate-900 dark:text-white">
            {value ? `${value.city} (${value.code})` : placeholder}
          </p>
          <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute left-0 top-[calc(100%+12px)] z-50 w-full min-w-[280px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('airportSearchPlaceholder') || 'Tìm thành phố hoặc mã...'}
                className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />
            </div>

            <div className="max-h-72 overflow-y-auto p-2">
              {filteredAirports.length > 0 ? (
                filteredAirports.map((airport) => (
                  <button
                    key={airport.code}
                    type="button"
                    onClick={() => {
                      onChange(airport)
                      setIsOpen(false)
                      setSearch('')
                    }}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-colors hover:bg-blue-50 dark:hover:bg-slate-800"
                  >
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">{airport.city}</p>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{airport.name}</p>
                    </div>
                    <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-black text-blue-600 dark:bg-slate-800 dark:text-orange-400">
                      {airport.code}
                    </span>
                  </button>
                ))
              ) : (
                <p className="px-4 py-8 text-center text-sm font-bold text-slate-500 dark:text-slate-400">
                  {t('noAirportsFound') || 'Không tìm thấy!'}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const FlightSearch = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [dep, setDep] = useState(AIRPORTS[0])
  const [arr, setArr] = useState(AIRPORTS[1])
  const [date, setDate] = useState('2026-05-01')
  const [tripType, setTripType] = useState('one-way')
  const [returnDate, setReturnDate] = useState('2026-05-08')

  const handleSwap = () => {
    setDep(arr)
    setArr(dep)
  }

  const handleSearch = () => {
    if (!dep || !arr) return
    navigate('/flights', {
      state: {
        departure: dep.id,
        arrival: arr.id,
        date,
        tripType,
        returnDate: tripType === 'round-trip' ? returnDate : null,
      },
    })
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative -mt-16 overflow-hidden rounded-[2rem] border border-white/60 bg-white/90 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/85 sm:p-6"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-orange-500" />

        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 dark:border-slate-700 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20 dark:from-orange-500 dark:to-orange-600">
              <PlaneTakeoff className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
                {t('featuredFlights')}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                {t('subSlogan')}
              </p>
            </div>
          </div>

          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">
            <button
              type="button"
              onClick={() => setTripType('one-way')}
              className={`rounded-full px-4 py-2 text-sm font-black transition-all ${
                tripType === 'one-way'
                  ? 'bg-blue-600 text-white shadow-md dark:bg-orange-500'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {t('oneWay')}
            </button>
            <button
              type="button"
              onClick={() => setTripType('round-trip')}
              className={`rounded-full px-4 py-2 text-sm font-black transition-all ${
                tripType === 'round-trip'
                  ? 'bg-blue-600 text-white shadow-md dark:bg-orange-500'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {t('roundTrip')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr_1fr_auto] lg:items-end">
          <SearchableDropdown
            label={t('from')}
            value={dep}
            onChange={setDep}
            placeholder={t('selectDeparture')}
          />

          <div className="flex justify-center lg:pb-4">
            <button
              type="button"
              onClick={handleSwap}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:text-blue-600 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              aria-label="Swap airports"
            >
              <Shuffle className="h-5 w-5" />
            </button>
          </div>

          <SearchableDropdown
            label={t('to')}
            value={arr}
            onChange={setArr}
            placeholder={t('selectArrival')}
          />

          <div className="rounded-3xl border border-slate-200 bg-white/95 px-4 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
              <Calendar className="h-4 w-4" />
              {t('date')}
            </div>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full bg-transparent text-base font-black text-slate-900 outline-none [color-scheme:light] dark:text-white dark:[color-scheme:dark]"
            />
          </div>

          <motion.button
            type="button"
            onClick={handleSearch}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex min-h-[72px] items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 text-base font-black text-white shadow-lg shadow-orange-500/20 transition-all hover:shadow-xl"
          >
            <Search className="h-5 w-5" />
            {t('search')}
            <ArrowRight className="h-5 w-5" />
          </motion.button>

          {tripType === 'round-trip' && (
            <div className="rounded-3xl border border-slate-200 bg-white/95 px-4 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 lg:col-start-5">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                <Calendar className="h-4 w-4" />
                {t('returnDate')}
              </div>
              <input
                type="date"
                value={returnDate}
                onChange={(event) => setReturnDate(event.target.value)}
                className="w-full bg-transparent text-base font-black text-slate-900 outline-none [color-scheme:light] dark:text-white dark:[color-scheme:dark]"
              />
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 dark:bg-slate-800">
            <MapPin className="h-4 w-4" />
            {dep.city} → {arr.city}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 dark:bg-slate-800">
            <PlaneTakeoff className="h-4 w-4" />
            {tripType === 'round-trip' ? t('roundTripTicket') : t('oneWayTicket')}
          </span>
        </div>
      </motion.div>
    </div>
  )
}

export default FlightSearch
