import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import API_BASE from '../config/api'

const AuthContext = createContext()

// SECURITY NOTE: Do not hardcode credentials in frontend code
// Credentials must be entered by the user during login
// For demo purposes, admin user exists in backend only

// ============================================
// MOCK DATABASE SYSTEM
// ============================================
// WARNING: Mock data is for frontend-only demo functionality
// Real flight bookings and user data should come from backend API
const initializeMockDB = () => {
  // SECURITY NOTE: This mock database contains DEMO data only
  // Passwords are NOT stored - all authentication is handled by backend API
  // Do not use this mock data for production
  const db = {
    // Mock user data structure (no passwords)
    // Real auth is done through backend API
    users_db: [
      {
        id: 'user_001',
        name: 'Admin',
        email: 'admin@kangaroo.com',
        role: 'admin',
        createdAt: '2026-01-01'
      },
      {
        id: 'user_002',
        name: 'Huynh Thai',
        email: 'test@kangaroo.com',
        role: 'user',
        createdAt: '2026-01-05'
      }
    ],
    tickets_db: [
      {
        id: 'ticket_001',
        userEmail: 'test@kangaroo.com',
        bookingReference: 'KA123ABC',
        flight: {
          flightNumber: 'VJ101',
          airline: 'Kangaroo Airline',
          from: 'Hà Nội (HAN)',
          to: 'Hồ Chí Minh (SGN)',
          departure: '2026-05-15T08:00',
          arrival: '2026-05-15T10:00',
          duration: '2h 15m'
        },
        seats: ['12A', '12B'],
        passengerName: 'Huynh Thai',
        passengerEmail: 'test@kangaroo.com',
        originalPrice: 2500000,
        discountAmount: 0,
        finalPrice: 2500000,
        status: 'CONFIRMED',
        ticketType: 'one-way',
        paymentMethod: 'bank',
        issueDate: '2026-04-01',
        barcode: 'VJ101HAN123ABC',
        invoiceId: 'INV-2026-001'
      }
    ],
    transfers_db: [
      {
        id: 'transfer_001',
        userEmail: 'test@kangaroo.com',
        bookingReference: 'TA001XYZ',
        type: 'taxi',
        pickupLocation: 'Nội Bài Airport',
        dropoffLocation: 'Hà Nội City Center',
        pickupDate: '2026-05-15',
        pickupTime: '08:30',
        passengerCount: 2,
        passengerName: 'Huynh Thai',
        phoneNumber: '0912345678',
        email: 'test@kangaroo.com',
        price: 450000,
        status: 'CONFIRMED',
        issueDate: '2026-04-01',
        invoiceId: 'INV-TRANSFER-001'
      }
    ],
    invoices_db: [
      {
        id: 'INV-2026-001',
        userEmail: 'test@kangaroo.com',
        type: 'flight',
        bookingReference: 'KA123ABC',
        items: [
          { description: 'Vé máy bay HAN-SGN', quantity: 2, unitPrice: 1250000, total: 2500000 }
        ],
        subtotal: 2500000,
        tax: 250000,
        total: 2750000,
        status: 'PAID',
        issueDate: '2026-04-01',
        paymentDate: '2026-04-01'
      },
      {
        id: 'INV-TRANSFER-001',
        userEmail: 'test@kangaroo.com',
        type: 'transfer',
        bookingReference: 'TA001XYZ',
        items: [
          { description: 'Xe đưa đón Nội Bài - City Center', quantity: 1, unitPrice: 450000, total: 450000 }
        ],
        subtotal: 450000,
        tax: 45000,
        total: 495000,
        status: 'PAID',
        issueDate: '2026-04-01',
        paymentDate: '2026-04-01'
      }
    ]
  }

  const stored = localStorage.getItem('kangaroo_mock_db')
  if (!stored) {
    localStorage.setItem('kangaroo_mock_db', JSON.stringify(db))
    return db
  }

  try {
    const existing = JSON.parse(stored)
    // Ensure users_db structure exists
    if (!Array.isArray(existing.users_db)) {
      existing.users_db = db.users_db
    }
    localStorage.setItem('kangaroo_mock_db', JSON.stringify(existing))
    return existing
  } catch {
    localStorage.setItem('kangaroo_mock_db', JSON.stringify(db))
    return db
  }
}

// Hàm lấy DB từ localStorage
const getMockDB = () => {
  const stored = localStorage.getItem('kangaroo_mock_db')
  return stored ? JSON.parse(stored) : initializeMockDB()
}

// Hàm lưu DB vào localStorage
const saveMockDB = (db) => {
  localStorage.setItem('kangaroo_mock_db', JSON.stringify(db))
}

// ============================================
// AUTH CONTEXT PROVIDER
// ============================================
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loginAttempts, setLoginAttempts] = useState({}) // Chống brute force
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Khởi tạo DB khi component mount
  useEffect(() => {
    initializeMockDB()
    
    // Kiểm tra session hiện tại
    const savedUser = localStorage.getItem('kangaroo_current_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (err) {
        console.error('Lỗi khôi phục user:', err)
      }
    }
    
    setLoading(false)
  }, [])

  // ============================================
  // HÀM VALIDATE PASSWORD
  // ============================================
  const validatePassword = (password) => {
    if (password.length < 8) {
      return { valid: false, error: 'Mật khẩu phải tối thiểu 8 ký tự' }
    }
    if (!/[a-zA-Z]/.test(password)) {
      return { valid: false, error: 'Mật khẩu phải có chữ cái' }
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, error: 'Mật khẩu phải có số' }
    }
    return { valid: true }
  }

  // ============================================
  // CHỨC NĂNG ĐĂNG NHẬP
  // ============================================
  const login = async (email, password) => {
    setError('')

    // Kiểm tra Brute Force
    const key = `login_attempt_${email}`
    const attempts = loginAttempts[key] || { count: 0, lockedUntil: 0 }
    
    if (Date.now() < attempts.lockedUntil) {
      setError('Tài khoản đã bị khóa tạm thời. Vui lòng thử lại sau.')
      return false
    }

    if (attempts.count >= 5) {
      const lockUntil = Date.now() + 5 * 60 * 1000 // Khóa 5 phút
      setLoginAttempts(prev => ({
        ...prev,
        [key]: { count: attempts.count, lockedUntil: lockUntil }
      }))
      setError('Quá nhiều lần đăng nhập sai. Tài khoản khóa 5 phút.')
      return false
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Always attempt backend authentication first
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, {
        email: email.trim(),
        password: password
      })

      const accessToken = res?.data?.access_token || res?.data?.Access_Token
      if (accessToken) {
        localStorage.setItem('kangaroo_access_token', accessToken)
        localStorage.setItem('kangaroo_current_user', JSON.stringify({
          id: res.data.id,
          email: email,
          role: res.data.role || 'user'
        }))
        setUser({
          id: res.data.id,
          name: email,
          email: email,
          role: res.data.role || 'user'
        })
        setError('')
        return true
      }
    } catch (err) {
      // Backend authentication failed
      setError(err.response?.data?.detail || 'Invalid email or password')
      return false
    }

    return false
  }

  // ============================================
  // CHỨC NĂNG ĐĂNG KÝ
  // ============================================
  const register = async (name, email, password) => {
    setError('')

    // Validate
    if (!name || name.trim().length < 3) {
      setError('Tên phải tối thiểu 3 ký tự')
      return false
    }

    const passwordCheck = validatePassword(password)
    if (!passwordCheck.valid) {
      setError(passwordCheck.error)
      return false
    }

    try {
      // Gọi API Backend .NET 8 để đăng ký
      const res = await axios.post(`${API_BASE}/api/auth/register`, {
        username: name.trim(),
        email: email.trim(),
        password: password
      })

      // Lưu user info từ response
      if (res.data) {
        const userData = {
          id: res.data.id,
          name: res.data.username || name.trim(),
          email: res.data.email,
          role: res.data.role || 'user'
        }
        setUser(userData)
        localStorage.setItem('kangaroo_current_user', JSON.stringify(userData))
        localStorage.setItem('kangaroo_token', `token_${userData.id}_${Date.now()}`)
      }

      return true
    } catch (err) {
      setError(err.response?.data?.detail || 'Đăng ký thất bại, thử lại sau nhé!')
      return false
    }
  }

  // ============================================
  // CHỨC NĂNG ĐĂNG XUẤT
  // ============================================
  const logout = () => {
    setUser(null)
    localStorage.removeItem('kangaroo_current_user')
    localStorage.removeItem('kangaroo_token')
    setError('')
  }

  // ============================================
  // CHỨC NĂNG LẤY VÉ CỦA USER
  // ============================================
  const getUserTickets = () => {
    if (!user) return []
    const db = getMockDB()
    return db.tickets_db.filter(ticket => ticket.userEmail === user.email)
  }

  // ============================================
  // CHỨC NĂNG LẤY VÉ ĐẦU ĐÓN CỦA USER
  // ============================================
  const getUserTransfers = () => {
    if (!user) return []
    const db = getMockDB()
    return db.transfers_db.filter(transfer => transfer.userEmail === user.email)
  }

  // ============================================
  // CHỨC NĂNG LẤY HÓA ĐƠN CỦA USER
  // ============================================
  const getUserInvoices = () => {
    if (!user) return []
    const db = getMockDB()
    return db.invoices_db.filter(invoice => invoice.userEmail === user.email)
  }

  // ============================================
  // CHỨC NĂNG THÊM VÉ MỚI
  // ============================================
  const addTicket = (ticketData) => {
    if (!user) return false
    
    const db = getMockDB()
    const newTicket = {
      ...ticketData,
      id: `ticket_${Date.now()}`,
      userEmail: user.email,
      status: 'CONFIRMED',
      issueDate: new Date().toLocaleDateString('vi-VN')
    }

    db.tickets_db.push(newTicket)
    saveMockDB(db)
    return true
  }

  // ============================================
  // CHỨC NĂNG THÊM VÉ ĐẦU ĐÓN MỚI
  // ============================================
  const addTransfer = (transferData) => {
    if (!user) return false
    
    const db = getMockDB()
    const newTransfer = {
      ...transferData,
      id: `transfer_${Date.now()}`,
      userEmail: user.email,
      status: 'CONFIRMED',
      issueDate: new Date().toLocaleDateString('vi-VN')
    }

    db.transfers_db.push(newTransfer)
    saveMockDB(db)
    return true
  }

  // ============================================
  // CHỨC NĂNG XÓA VÉ
  // ============================================
  const deleteTicket = (ticketId) => {
    if (!user) return false
    
    const db = getMockDB()
    db.tickets_db = db.tickets_db.filter(t => t.id !== ticketId || t.userEmail !== user.email)
    saveMockDB(db)
    return true
  }

  // ============================================
  // CHỨC NĂNG XÓA VÉ ĐẦU ĐÓN
  // ============================================
  const deleteTransfer = (transferId) => {
    if (!user) return false
    
    const db = getMockDB()
    db.transfers_db = db.transfers_db.filter(t => t.id !== transferId || t.userEmail !== user.email)
    saveMockDB(db)
    return true
  }

  // ============================================
  // CHỨC NĂNG THÊM HÓA ĐƠN
  // ============================================
  const addInvoice = (invoiceData) => {
    if (!user) return false
    
    const db = getMockDB()
    const newInvoice = {
      ...invoiceData,
      id: `INV-${Date.now()}`,
      userEmail: user.email,
      status: 'PAID',
      issueDate: new Date().toLocaleDateString('vi-VN'),
      paymentDate: new Date().toLocaleDateString('vi-VN')
    }

    db.invoices_db.push(newInvoice)
    saveMockDB(db)
    return true
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      setError,
      login,
      register,
      logout,
      getUserTickets,
      getUserTransfers,
      getUserInvoices,
      addTicket,
      addTransfer,
      deleteTicket,
      deleteTransfer,
      addInvoice,
      validatePassword
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
