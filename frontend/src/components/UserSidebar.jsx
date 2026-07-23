import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Settings, Ticket, MapPin, LogOut, Globe, Palette, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'
import { useNavigate } from 'react-router-dom'

const UserSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth()
  const { t, language, changeLanguage, currency, changeCurrency, availableLanguages, availableCurrencies } = useI18n()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    onClose()
    navigate('/')
  }

  const handleNavigate = (path) => {
    navigate(path)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* SIDEBAR */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className="fixed right-0 top-0 w-full max-w-sm h-screen bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col overflow-y-auto"
          >
            {/* === HEADER === */}
            <div className="sticky top-0 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-orange-500 dark:to-orange-600 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">{t('manage')}</h3>
                <p className="text-blue-100 text-sm font-bold mt-1">
                  {user ? user.name : t('login')}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* === CONTENT === */}
            <div className="flex-grow p-6 space-y-6">
              {user ? (
                <>
                  {/* === USER INFO === */}
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-black text-xl">
                        {((user.name && user.name.charAt(0)) || (user.email && user.email.charAt(0)) || 'U').toString().toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-bold">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* === MENU ITEMS === */}
                  <div className="space-y-2">
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleNavigate('/admin')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors text-left font-bold text-red-600 dark:text-red-400"
                      >
                        <Shield className="w-5 h-5" />
                        Admin Panel
                      </button>
                    )}

                    <button
                      onClick={() => handleNavigate('/manage')}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left font-bold text-slate-700 dark:text-slate-300"
                    >
                      <Ticket className="w-5 h-5 text-blue-600 dark:text-orange-500" />
                      {t('myTickets')}
                    </button>

                    <button
                      onClick={() => handleNavigate('/pickup')}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left font-bold text-slate-700 dark:text-slate-300"
                    >
                      <MapPin className="w-5 h-5 text-blue-600 dark:text-orange-500" />
                      {t('pickUp')}
                    </button>

                    <button
                      onClick={() => handleNavigate('/support')}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left font-bold text-slate-700 dark:text-slate-300"
                    >
                      <Settings className="w-5 h-5 text-blue-600 dark:text-orange-500" />
                      {t('support')}
                    </button>
                  </div>

                  {/* === LOGOUT BUTTON === */}
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-colors mt-auto"
                  >
                    <LogOut className="w-5 h-5" />
                    {t('logout')}
                  </button>
                </>
              ) : (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 font-bold mb-6">{t('loginSubtitle')}</p>
                  <button
                    onClick={() => handleNavigate('/login')}
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white py-3 rounded-xl font-black transition-colors"
                  >
                    {t('login')}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default UserSidebar
