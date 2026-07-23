import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Plane, ArrowUpToLine, ArrowDownToLine } from 'lucide-react'
import { useNavigate } from 'react-router-dom' 
import { useI18n } from '../context/I18nContext'

const SeatMap = ({ flight, onConfirm }) => {
  const { t, formatPrice, convertPrice } = useI18n()
  const navigate = useNavigate()

  // ==========================================
  // 1. KHỞI TẠO DỮ LIỆU & STATE 
  // ==========================================
  const [selectedSeats, setSelectedSeats] = useState([])
  const [currentDeck, setCurrentDeck] = useState('lower') 

  // Giả lập ghế đã có người đặt
  const occupiedSeats = ['L-1A', 'L-5C', 'L-12F', 'U-2A', 'U-3F']

  // Ép kiểu giá gốc
  const basePrice = Number(flight?.price) || 0

  // ==========================================
  // 2. CẤU HÌNH SƠ ĐỒ 2 TẦNG
  // ==========================================
  const lowerDeckRows = 20
  const lowerDeckCols = ['A', 'B', 'C', 'D', 'E', 'F']
  
  const upperDeckRows = 10
  const upperDeckCols = ['A', 'C', 'D', 'F']

  // ==========================================
  // 3. HÀM XỬ LÝ LOGIC
  // ==========================================
  const toggleSeat = (seatId) => {
    if (occupiedSeats.includes(seatId)) return 

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId))
    } else {
      setSelectedSeats([...selectedSeats, seatId])
    }
  }

  const getSeatPrice = (seatId) => {
    const isUpper = seatId.startsWith('U-')
    const rowNum = parseInt(seatId.split('-')[1]) 

    if (isUpper) return basePrice * 3 
    if (rowNum <= 4) return basePrice * 2 
    return basePrice 
  }

  const totalPrice = selectedSeats.reduce((sum, seatId) => sum + getSeatPrice(seatId), 0)

  // --- HÀM XỬ LÝ THANH TOÁN ---
  const handleCheckoutClick = () => {
    if (selectedSeats.length === 0) return

    const draftBooking = { flight, selectedSeats, totalPrice }
    localStorage.setItem('draft_booking', JSON.stringify(draftBooking))
    
    const hasToken = localStorage.getItem('kangaroo_access_token') || localStorage.getItem('kangaroo_token')
    
    if (hasToken) {
      navigate('/checkout')
    } else {
      navigate('/login')
    }
  }

  if (!flight) return null

  // ==========================================
  // 4. GIAO DIỆN (RENDER)
  // ==========================================
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-700 max-w-5xl mx-auto overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase flex justify-center items-center gap-3">
          <Plane className="w-8 h-8 text-blue-600" /> {t('seatMapTitle')} {flight.flight_number}
        </h3>
        <p className="text-slate-400 font-bold mt-2">{t('aircraftType')}</p>
      </div>

      {/* --- BẢNG ĐIỀU KHIỂN CHỌN TẦNG --- */}
      <div className="flex justify-center gap-4 mb-8">
        <button 
          onClick={() => setCurrentDeck('upper')}
          className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all ${currentDeck === 'upper' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40 scale-105' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200'}`}
        >
          <ArrowUpToLine className="w-5 h-5" /> {t('upperDeck')}
        </button>
        <button 
          onClick={() => setCurrentDeck('lower')}
          className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all ${currentDeck === 'lower' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 scale-105' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200'}`}
        >
          <ArrowDownToLine className="w-5 h-5" /> {t('lowerDeck')}
        </button>
      </div>

      {/* --- CHÚ THÍCH (LEGEND) --- */}
      <div className="flex justify-center gap-8 mb-12 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
          <span className="text-xs font-bold text-slate-500">{t('available')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-600 rounded-md"></div>
          <span className="text-xs font-bold text-slate-500">{t('selected')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-slate-400 rounded-md"></div>
          <span className="text-xs font-bold text-slate-500">{t('sold')}</span>
        </div>
        <div className="flex items-center gap-2 ml-4 pl-4 border-l-2 border-slate-200">
          <div className="w-5 h-5 border-2 border-orange-300 bg-orange-50 rounded-md"></div>
          <span className="text-xs font-bold text-slate-500">{t('vipSeat')}</span>
        </div>
      </div>

      {/* --- BẢN ĐỒ MÁY BAY CHÍNH --- */}
      <div className="relative mx-auto w-fit mt-12 mb-40">
        
        {/* CÁC BỘ PHẬN MÁY BAY (CÁNH, ĐUÔI...) */}
        <div className="absolute top-[35%] -left-[140px] w-[160px] h-[300px] bg-slate-200 dark:bg-slate-700 rounded-tl-[120px] rounded-bl-3xl -skew-y-[30deg] shadow-lg -z-10 border-l-8 border-t-8 border-white/60"></div>
        <div className="absolute top-[35%] -right-[140px] w-[160px] h-[300px] bg-slate-200 dark:bg-slate-700 rounded-tr-[120px] rounded-br-3xl skew-y-[30deg] shadow-lg -z-10 border-r-8 border-t-8 border-white/60"></div>
        <div className="absolute bottom-10 -left-[80px] w-[100px] h-[120px] bg-slate-200 dark:bg-slate-700 rounded-tl-[60px] rounded-bl-xl -skew-y-[35deg] shadow-lg -z-10"></div>
        <div className="absolute bottom-10 -right-[80px] w-[100px] h-[120px] bg-slate-200 dark:bg-slate-700 rounded-tr-[60px] rounded-br-xl skew-y-[35deg] shadow-lg -z-10"></div>

        {/* THÂN CHÍNH MÁY BAY */}
        <motion.div 
          key={currentDeck}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="relative z-10 bg-white dark:bg-slate-800 border-[14px] border-slate-200 dark:border-slate-700 rounded-t-[250px] rounded-b-[200px] px-8 py-20 shadow-[0_30px_60px_rgba(0,0,0,0.15)] min-w-[360px]"
        >
          
          {/* BUỒNG LÁI */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-14 bg-blue-50 dark:bg-slate-900 rounded-t-[60px] rounded-b-2xl border-b-4 border-slate-300 dark:border-slate-600 shadow-inner overflow-hidden flex justify-center gap-1">
             <div className="w-1/3 h-full bg-blue-300/40 dark:bg-blue-500/30 skew-x-[25deg]"></div>
             <div className="w-1/3 h-full bg-blue-300/40 dark:bg-blue-500/30"></div>
             <div className="w-1/3 h-full bg-blue-300/40 dark:bg-blue-500/30 -skew-x-[25deg]"></div>
          </div>

          {/* NHÃN TÊN KHOANG */}
          <div className="text-center mt-2 mb-10 text-xs font-black text-slate-300 tracking-widest uppercase">
            {currentDeck === 'lower' ? t('economyCabin') : t('businessCabin')}
          </div>

          {/* SƠ ĐỒ GHẾ NGỒI THEO TẦNG */}
          <div className="space-y-5">
            {[...Array(currentDeck === 'lower' ? lowerDeckRows : upperDeckRows)].map((_, rowIndex) => {
              const rowNum = rowIndex + 1
              const isVIP = currentDeck === 'upper' || rowNum <= 4
              const cols = currentDeck === 'lower' ? lowerDeckCols : upperDeckCols
              const prefix = currentDeck === 'lower' ? 'L' : 'U'

              return (
                <div key={rowNum} className="flex items-center justify-between gap-3">
                  
                  {/* Cụm ghế bên Trái */}
                  <div className="flex gap-2">
                    {cols.slice(0, cols.length / 2).map(col => {
                      const seatId = `${prefix}-${rowNum}${col}`
                      const isOccupied = occupiedSeats.includes(seatId)
                      const isSelected = selectedSeats.includes(seatId)

                      return (
                        <button
                          key={seatId}
                          onClick={() => toggleSeat(seatId)}
                          className={`
                            ${currentDeck === 'lower' ? 'w-10 h-10' : 'w-14 h-14'} 
                            rounded-xl flex items-center justify-center transition-all font-black
                            ${isOccupied ? 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed text-slate-500' : 
                              isSelected ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)] scale-110' : 
                              isVIP ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 border-2 border-orange-200 hover:bg-orange-100' : 
                              'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200'}
                            active:scale-95
                          `}
                        >
                          <span className={currentDeck === 'lower' ? 'text-[10px]' : 'text-sm'}>{rowNum}{col}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* LỐI ĐI Ở GIỮA */}
                  <div className="text-[10px] font-black text-slate-400 w-8 text-center bg-slate-50 dark:bg-slate-800/80 rounded-full py-2 shadow-inner">
                    {rowNum}
                  </div>

                  {/* Cụm ghế bên Phải */}
                  <div className="flex gap-2">
                    {cols.slice(cols.length / 2, cols.length).map(col => {
                      const seatId = `${prefix}-${rowNum}${col}`
                      const isOccupied = occupiedSeats.includes(seatId)
                      const isSelected = selectedSeats.includes(seatId)

                      return (
                        <button
                          key={seatId}
                          onClick={() => toggleSeat(seatId)}
                          className={`
                            ${currentDeck === 'lower' ? 'w-10 h-10' : 'w-14 h-14'} 
                            rounded-xl flex items-center justify-center transition-all font-black
                            ${isOccupied ? 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed text-slate-500' : 
                              isSelected ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)] scale-110' : 
                              isVIP ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 border-2 border-orange-200 hover:bg-orange-100' : 
                              'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200'}
                            active:scale-95
                          `}
                        >
                          <span className={currentDeck === 'lower' ? 'text-[10px]' : 'text-sm'}>{rowNum}{col}</span>
                        </button>
                      )
                    })}
                  </div>

                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* --- THANH THANH TOÁN TẠM TÍNH --- */}
      <AnimatePresence>
        {selectedSeats.length > 0 && (
          <motion.div 
            key="payment-bar"
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-slate-900 dark:bg-blue-600 text-white p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex justify-between items-center z-40 border-4 border-white/10 backdrop-blur-lg"
          >
            <div>
              <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">
                {t('selectedSeatsLabel')}: {selectedSeats.length} ({selectedSeats.join(', ')})
              </p>
              <h4 className="text-3xl font-black text-orange-400 dark:text-white">{formatPrice(convertPrice(totalPrice))}</h4>
            </div>
            <button 
              onClick={handleCheckoutClick}
              className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black hover:bg-slate-100 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              {t('continueToPayment')} <CheckCircle2 className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SeatMap
