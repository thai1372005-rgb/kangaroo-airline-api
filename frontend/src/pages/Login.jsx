import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'

const Login = () => {
  const { login, register, error, setError } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  
  // Trạng thái chuyển đổi giữa form Đăng nhập và Đăng ký
  const [isLoginView, setIsLoginView] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // Dữ liệu Form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Field errors
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear field error khi user bắt đầu nhập
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }))
    }
    // Clear general error
    if (error) {
      setError('')
    }
  }

  // ======================================
  // VALIDATE PASSWORD
  // ======================================
  const validateLoginForm = () => {
    const errors = {}
    
    if (!formData.email.trim()) {
      errors.email = t('email') + ' ' + t('passwordRequired').toLowerCase()
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('invalidEmail')
    }

    if (!formData.password) {
      errors.password = t('passwordRequired')
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateRegisterForm = () => {
    const errors = {}

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errors.name = t('fullName') + ' phải tối thiểu 3 ký tự'
    }

    if (!formData.email.trim()) {
      errors.email = t('email') + ' ' + t('passwordRequired').toLowerCase()
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('invalidEmail')
    }

    if (!formData.password) {
      errors.password = t('passwordRequired')
    } else if (formData.password.length < 8) {
      errors.password = t('passwordMinLength')
    } else if (!/[a-zA-Z]/.test(formData.password)) {
      errors.password = t('passwordNeedsLetter')
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = t('passwordNeedsNumber')
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = t('confirmPassword') + ' ' + t('passwordRequired').toLowerCase()
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('passwordMismatch')
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ======================================
  // HANDLE SUBMIT
  // ======================================
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    // Validate
    if (isLoginView) {
      if (!validateLoginForm()) return
    } else {
      if (!validateRegisterForm()) return
    }

    setIsLoading(true)

    try {
      let success = false

      if (isLoginView) {
        // ĐĂNG NHẬP
        success = await login(formData.email.trim(), formData.password)
        if (success) {
          setSuccessMsg(t('loginSuccess'))
          setTimeout(() => {
            navigate('/')
          }, 1000)
        }
      } else {
        // ĐĂNG KÝ
        success = await register(formData.name.trim(), formData.email.trim(), formData.password)
        if (success) {
          setSuccessMsg(t('registerSuccess'))
          setTimeout(() => {
            navigate('/')
          }, 1000)
        }
      }
    } catch (err) {
      console.error(err)
      setError(t('genericError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-900 pt-28 pb-12 transition-colors">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              {isLoginView ? t('loginTitle') : t('registerTitle')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {isLoginView ? t('loginSubtitle') : t('registerSubtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 rounded-xl font-bold text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-200 rounded-xl font-bold text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              {successMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit} autoComplete="on">
            {/* FIELD: FULL NAME (chỉ hiện khi ĐĂNG KÝ) */}
            {!isLoginView && (
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {t('fullName')}
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    autoComplete="name"
                    placeholder="Huynh Thai"
                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 rounded-2xl focus:outline-none transition-all font-medium dark:text-white ${
                      fieldErrors.name 
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                        : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-600'
                    }`}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {fieldErrors.name}
                  </p>
                )}
              </div>
            )}

            {/* FIELD: EMAIL */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  autoComplete="email"
                  placeholder="name@company.com"
                  className={`w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 rounded-2xl focus:outline-none transition-all font-medium dark:text-white ${
                    fieldErrors.email 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                      : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-600'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {fieldErrors.email}
                </p>
              )}
            </div>

            {/* FIELD: PASSWORD */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  autoComplete={isLoginView ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 rounded-2xl focus:outline-none transition-all font-medium dark:text-white ${
                    fieldErrors.password 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                      : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-600'
                  }`}
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {fieldErrors.password}
                </p>
              )}
              {isLoginView && (
                <div className="flex justify-end mt-2">
                  <span className="text-sm font-bold text-blue-600 dark:text-orange-400 hover:underline cursor-pointer">
                    {t('forgotPassword')}
                  </span>
                </div>
              )}
            </div>

            {/* FIELD: CONFIRM PASSWORD (chỉ hiện khi ĐĂNG KÝ) */}
            {!isLoginView && (
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {t('confirmPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input 
                  type="password" 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  autoComplete="new-password"
                  placeholder="••••••••"
                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 rounded-2xl focus:outline-none transition-all font-medium dark:text-white ${
                      fieldErrors.confirmPassword 
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500' 
                        : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-600'
                    }`}
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button 
              disabled={isLoading} 
              type="submit" 
              className="w-full bg-blue-600 dark:bg-orange-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 dark:hover:bg-orange-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('processing') : (isLoginView ? t('loginBtn') : t('registerBtn'))} 
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* TOGGLE LOGIN/REGISTER */}
          <p className="text-center mt-10 text-slate-500 dark:text-slate-400 font-medium">
            {isLoginView ? t('dontHaveAccount') : t('alreadyHaveAccount')}{' '}
            <button 
              type="button"
              onClick={() => {
                setIsLoginView(!isLoginView)
                setFieldErrors({})
                setError('')
                setSuccessMsg('')
                setFormData({ name: '', email: '', password: '', confirmPassword: '' })
              }}
              className="text-blue-600 dark:text-orange-400 font-bold hover:underline"
            >
              {isLoginView ? t('createNow') : t('loginNow')}
            </button>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE IMAGE */}
      <div className="hidden lg:block lg:w-1/2 relative bg-slate-900">
        <img 
          src="https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=2070&auto=format&fit=crop" 
          alt="Travel" 
          className="absolute inset-0 w-full h-full object-cover opacity-80" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
      </div>
    </div>
  )
}

export default Login
