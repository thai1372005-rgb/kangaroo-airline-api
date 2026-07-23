import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, Mail, Lock, User as UserIcon, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'
import API_BASE from '../config/api'

// Mảng chứa các hình ảnh phong cảnh và hàng không siêu nét
const sliderImages = [
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop", // Máy bay trên bầu trời
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2038&auto=format&fit=crop", // Phong cảnh Bali
  "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=2070&auto=format&fit=crop", // Dãy núi hùng vĩ
  "https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=2070&auto=format&fit=crop"  // Cánh máy bay ngắm hoàng hôn
]

const Register = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // State quản lý hình ảnh đang hiển thị
  const [currentImgIndex, setCurrentImgIndex] = useState(0)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Effect chạy Slider tự động mỗi 4 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImgIndex((prevIndex) => (prevIndex + 1) % sliderImages.length)
    }, 4000)
    return () => clearInterval(timer) // Dọn dẹp timer khi chuyển trang
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu nhập lại không khớp!")
      return
    }

    setLoading(true)
    try {
      const res = await axios.post(`${API_BASE}/api/auth/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password
      })
      
      alert("Đăng ký thành công! Quay lại trang đăng nhập nhé.")
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || "Đăng ký thất bại, thử lại sau nhé!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 pt-24 transition-colors duration-300">
      {/* CỘT TRÁI: FORM ĐĂNG KÝ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md bg-white dark:bg-slate-800/50 p-8 rounded-3xl shadow-xl dark:shadow-none border border-slate-100 dark:border-slate-800 backdrop-blur-sm">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Gia nhập Kangaroo 🦘</h2>
          <p className="text-slate-500 mb-8 font-medium dark:text-slate-400">Khám phá bầu trời cùng hàng ngàn ưu đãi.</p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/50 rounded-2xl font-bold text-sm text-center">
              {error}
            </motion.div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Họ và Tên</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input type="text" placeholder="VD: Ziagg" className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 dark:text-white transition-all" 
                  onChange={(e) => setFormData({...formData, username: e.target.value})} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input type="email" placeholder="name@company.com" className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 dark:text-white transition-all"
                  onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input type="password" placeholder="••••••••" className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 dark:text-white transition-all"
                    onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nhập lại</label>
                <div className="relative">
                  <CheckCircle className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input type="password" placeholder="••••••••" className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 dark:text-white transition-all"
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required />
                </div>
              </div>
            </div>

            <button disabled={loading} className="w-full mt-4 bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? "ĐANG TẠO TÀI KHOẢN..." : "ĐĂNG KÝ NGAY"} <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <p className="text-center mt-8 text-slate-500 font-medium dark:text-slate-400">
            Đã là thành viên? <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Đăng nhập</Link>
          </p>
        </motion.div>
      </div>

      {/* CỘT PHẢI: SLIDER HÌNH ẢNH (CHẠY VÒNG TRÒN) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-slate-900 rounded-l-[40px] shadow-2xl my-4 mr-4">
        {/* Render các hình ảnh */}
        {sliderImages.map((imgSrc, index) => (
          <img 
            key={index}
            src={imgSrc} 
            alt={`Aviation slide ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out
              ${index === currentImgIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}
            `} 
          />
        ))}
        
        {/* Lớp phủ Gradient cho chữ dễ đọc nếu muốn chèn thêm chữ */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80"></div>

        {/* CÁC CHẤM TRÒN ĐIỀU HƯỚNG (CIRCLE INDICATORS) */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-3 z-20">
          {sliderImages.map((_, index) => (
            <button 
              key={index}
              onClick={() => setCurrentImgIndex(index)}
              className={`transition-all duration-300 rounded-full 
                ${index === currentImgIndex 
                  ? 'w-8 h-2 bg-blue-500' // Nút active sẽ dãn dài ra một chút
                  : 'w-2 h-2 bg-white/50 hover:bg-white/80' // Nút bình thường là hình tròn
                }
              `}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Text Slogan bay bổng */}
        <div className="absolute bottom-24 left-12 right-12 z-20 text-center">
          <motion.h3 
            key={currentImgIndex} // Đổi key để trigger animation mỗi khi đổi ảnh
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-black text-white mb-2"
          >
            Sải Cánh Cùng Kangaroo Airline
          </motion.h3>
          <p className="text-slate-300 font-medium">Bắt đầu hành trình chinh phục bầu trời và những vùng đất mới ngay hôm nay.</p>
        </div>
      </div>
    </div>
  )
}

export default Register