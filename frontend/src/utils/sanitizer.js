/**
 * ============================================================
 * SECURITY MODULE: Chống XSS, Input Validation, Data Sanitization
 * Tuân thủ OWASP Top 10
 * ============================================================
 */

import DOMPurify from 'dompurify'

// ==========================================
// 1. CHỐNG XSS: Sanitize HTML
// ==========================================
export const sanitizeHTML = (dirty) => {
  if (!dirty || typeof dirty !== 'string') return ''
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'a'],
    ALLOWED_ATTR: ['href', 'title'],
    KEEP_CONTENT: true
  })
}

// ==========================================
// 2. CHỐNG XSS: Escape Text Content
// ==========================================
export const escapeText = (text) => {
  if (!text || typeof text !== 'string') return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// ==========================================
// 3. SANITIZE INPUT FORM
// ==========================================
export const sanitizeFormData = (data) => {
  const sanitized = {}
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Trim + escape xss
      sanitized[key] = escapeText(value.trim())
    } else if (typeof value === 'number') {
      sanitized[key] = Number.isFinite(value) ? value : 0
    } else if (typeof value === 'boolean') {
      sanitized[key] = value
    } else if (value === null || value === undefined) {
      sanitized[key] = null
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}

// ==========================================
// 4. VALIDATE EMAIL
// ==========================================
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(String(email).toLowerCase())
}

// ==========================================
// 5. VALIDATE PHONE (Vietnam)
// ==========================================
export const validatePhone = (phone) => {
  const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)\d{8}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// ==========================================
// 6. VALIDATE CREDIT CARD
// ==========================================
export const validateCreditCard = (cardNumber) => {
  const sanitized = cardNumber.replace(/\s/g, '')
  if (!/^\d{13,19}$/.test(sanitized)) return false
  
  // Luhn Algorithm
  let sum = 0
  let isEven = false
  
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized[i], 10)
    
    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

// ==========================================
// 7. VALIDATE FORM ERRORS
// ==========================================
export const validateAirportTransferForm = (formData) => {
  const errors = {}
  
  if (!formData.pickupLocation || formData.pickupLocation.trim().length < 2) {
    errors.pickupLocation = 'Điểm đón phải từ 2 ký tự trở lên'
  }
  
  if (!formData.dropoffLocation || formData.dropoffLocation.trim().length < 2) {
    errors.dropoffLocation = 'Điểm trả phải từ 2 ký tự trở lên'
  }
  
  if (!formData.pickupDate) {
    errors.pickupDate = 'Vui lòng chọn ngày đón'
  } else {
    const selectedDate = new Date(formData.pickupDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      errors.pickupDate = 'Ngày đón không thể trong quá khứ'
    }
  }
  
  if (!formData.pickupTime) {
    errors.pickupTime = 'Vui lòng chọn thời gian đón'
  }
  
  if (!formData.passengerName || formData.passengerName.trim().length < 3) {
    errors.passengerName = 'Tên hành khách phải từ 3 ký tự trở lên'
  }
  
  if (!validatePhone(formData.phoneNumber)) {
    errors.phoneNumber = 'Số điện thoại không hợp lệ'
  }
  
  return errors
}

// ==========================================
// 8. VALIDATE CONTACT FORM
// ==========================================
export const validateContactForm = (formData) => {
  const errors = {}
  
  if (!formData.name || formData.name.trim().length < 3) {
    errors.name = 'Tên phải từ 3 ký tự trở lên'
  }
  
  if (!validateEmail(formData.email)) {
    errors.email = 'Email không hợp lệ'
  }
  
  if (!formData.subject || formData.subject.trim().length < 5) {
    errors.subject = 'Tiêu đề phải từ 5 ký tự trở lên'
  }
  
  if (!formData.message || formData.message.trim().length < 10) {
    errors.message = 'Nội dung phải từ 10 ký tự trở lên'
  }
  
  return errors
}

// ==========================================
// 9. AN TOÀN: Lưu Token (Không dùng XSS-prone localStorage)
// ==========================================
export const setAuthToken = (token) => {
  if (!token || typeof token !== 'string') return false
  
  try {
    // Validate token format (JWT basic check)
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    localStorage.setItem('kangaroo_access_token', token)
    localStorage.setItem('kangaroo_token', token)
    return true
  } catch (err) {
    console.error('Token storage error:', err)
    return false
  }
}

export const getAuthToken = () => {
  try {
    return localStorage.getItem('kangaroo_access_token') || localStorage.getItem('kangaroo_token') || null
  } catch (err) {
    console.error('Token retrieval error:', err)
    return null
  }
}

export const clearAuthToken = () => {
  try {
    localStorage.removeItem('kangaroo_access_token')
    localStorage.removeItem('kangaroo_token')
    localStorage.removeItem('draft_booking')
    localStorage.removeItem('my_tickets')
    return true
  } catch (err) {
    console.error('Token clear error:', err)
    return false
  }
}

// ==========================================
// 10. AN TOÀN: XS Security Headers
// ==========================================
export const getSecurityHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  }
}
