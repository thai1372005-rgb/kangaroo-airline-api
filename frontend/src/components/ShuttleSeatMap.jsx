import { useState } from 'react'
import { motion } from 'framer-motion'

const ShuttleSeatMap = ({ onSeatsChange }) => {
  // Config: 4 hàng, 2 ghế mỗi hàng = 8 ghế
  const ROWS = 4
  const SEATS_PER_ROW = 2
  const SEAT_LAYOUT = ['A', 'B']

  // Danh sách ghế: mỗi ghế có id, status (available/selected/sold)
  const [seats, setSeats] = useState(
    Array.from({ length: ROWS }, (_, rowIdx) =>
      SEAT_LAYOUT.map((col, colIdx) => ({
        id: `${rowIdx + 1}${col}`,
        row: rowIdx + 1,
        col: col,
        status: 'available', // available | selected | sold
      }))
    ).flat()
  )

  // Giả lập: một số ghế đã bán
  const [soldSeats] = useState(['2A', '3B'])

  // Khởi tạo: set sold seats
  const initialSeats = seats.map(seat =>
    soldSeats.includes(seat.id) ? { ...seat, status: 'sold' } : seat
  )
  const [seatStates, setSeatStates] = useState(initialSeats)

  // Hàm click ghế
  const handleSeatClick = (seatId) => {
    const seat = seatStates.find(s => s.id === seatId)
    if (seat.status === 'sold') return // Không cho click ghế đã bán

    setSeatStates(prev =>
      prev.map(s =>
        s.id === seatId
          ? { ...s, status: s.status === 'selected' ? 'available' : 'selected' }
          : s
      )
    )

    // Callback: trả về danh sách ghế đã chọn
    const selectedSeats = seatStates
      .filter(s => s.status === 'selected' || s.id === seatId)
      .map(s => s.id)
    onSeatsChange?.(selectedSeats)
  }

  const selectedCount = seatStates.filter(s => s.status === 'selected').length

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">
          🪑 Chọn ghế xe khách
        </h3>

        {/* LEGEND */}
        <div className="flex gap-6 mb-8 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded border-2 border-slate-400 dark:border-slate-500"></div>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Có sẵn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded border-2 border-blue-700"></div>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Đã chọn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded border-2 border-red-700 opacity-50"></div>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Đã bán</span>
          </div>
        </div>

        {/* SEAT GRID */}
        <div className="inline-block bg-slate-50 dark:bg-slate-900 p-8 rounded-2xl border-2 border-slate-200 dark:border-slate-700">
          <div className="space-y-4">
            {Array.from({ length: ROWS }, (_, rowIdx) => (
              <motion.div
                key={`row-${rowIdx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: rowIdx * 0.1 }}
                className="flex items-center gap-6"
              >
                {/* ROW LABEL */}
                <span className="font-black text-slate-600 dark:text-slate-400 w-8 text-center">
                  {rowIdx + 1}
                </span>

                {/* SEATS */}
                <div className="flex gap-4">
                  {SEAT_LAYOUT.map((col) => {
                    const seatId = `${rowIdx + 1}${col}`
                    const seatState = seatStates.find(s => s.id === seatId)

                    return (
                      <motion.button
                        key={seatId}
                        whileHover={seatState?.status !== 'sold' ? { scale: 1.1 } : {}}
                        whileTap={seatState?.status !== 'sold' ? { scale: 0.95 } : {}}
                        onClick={() => handleSeatClick(seatId)}
                        disabled={seatState?.status === 'sold'}
                        className={`w-10 h-10 rounded font-black text-sm transition-all border-2 ${
                          seatState?.status === 'selected'
                            ? 'bg-blue-600 border-blue-700 text-white shadow-lg shadow-blue-600/50'
                            : seatState?.status === 'sold'
                            ? 'bg-red-600 border-red-700 opacity-50 cursor-not-allowed'
                            : 'bg-slate-300 dark:bg-slate-600 border-slate-400 dark:border-slate-500 text-slate-900 dark:text-white hover:bg-slate-400 dark:hover:bg-slate-500'
                        }`}
                      >
                        {col}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
        <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
          ✓ Đã chọn <span className="text-lg font-black">{selectedCount}</span> ghế
        </p>
      </div>
    </div>
  )
}

export default ShuttleSeatMap
