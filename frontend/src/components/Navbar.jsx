import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Globe, Menu, Moon, Plane, Sun, Ticket, X, MapPin } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'
import UserSidebar from './UserSidebar'

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useAppContext()
  const { user } = useAuth()
  const {
    t,
    language,
    changeLanguage,
    currency,
    changeCurrency,
    availableLanguages,
    availableCurrencies,
  } = useI18n()
  const location = useLocation()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserSidebarOpen, setIsUserSidebarOpen] = useState(false)
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false)
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false)

  const navItems = [
    { label: t('explore'), path: '/', icon: Globe },
    { label: t('flights'), path: '/flights', icon: Plane },
    { label: t('offers'), path: '/offers', icon: Ticket },
    { label: t('pickUp'), path: '/pickup', icon: MapPin },
    { label: t('manage'), path: '/manage', icon: Ticket },
    { label: t('support'), path: '/support', icon: Globe },
  ]

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsLangDropdownOpen(false)
    setIsCurrencyDropdownOpen(false)
  }, [location.pathname])

  const isActive = (path) => location.pathname === path

  const navLinkClass = (path) =>
    `group inline-flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-[0.95rem] font-bold transition-all duration-300 xl:px-6 xl:py-3 ${
      isActive(path)
        ? 'bg-emerald-100 text-emerald-950 shadow-sm ring-1 ring-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:ring-emerald-700/40'
        : 'text-slate-700 hover:bg-stone-100 hover:text-stone-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
    }`

  const mobileNavLinkClass = (path) =>
    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
      isActive(path)
        ? 'bg-emerald-100 text-emerald-950 shadow-sm ring-1 ring-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:ring-emerald-700/40'
        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
    }`

  const dropdownButtonClass =
    'inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/90 px-3 py-2 text-sm font-bold text-slate-600 shadow-sm backdrop-blur-md transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800'

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-stone-200 bg-white/95 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-[0_10px_40px_rgba(0,0,0,0.28)]">
        <div className="mx-auto max-w-[1920px] px-5 sm:px-6 lg:px-10">
          <div className="flex items-center gap-4 py-4">
            <Link to="/" className="group flex shrink-0 items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-200 bg-white shadow-sm shadow-stone-200/70 transition-transform group-hover:scale-105 dark:border-slate-700 dark:bg-slate-900 dark:shadow-slate-900/30">
                <Plane className="h-6 w-6 rotate-45 text-emerald-700 dark:text-emerald-400" />
              </div>
              <div className="leading-tight">
                <div className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-950 dark:text-emerald-300">
                  Kangaroo
                </div>
                <div className="text-base font-black tracking-tight text-stone-950 dark:text-white sm:text-lg">
                  Airline
                </div>
              </div>
            </Link>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <div className="relative hidden lg:block">
                <button
                  type="button"
                  onClick={() => {
                    setIsLangDropdownOpen((value) => !value)
                    setIsCurrencyDropdownOpen(false)
                  }}
                  className={dropdownButtonClass}
                >
                  <Globe className="h-4 w-4" />
                  {language.toUpperCase()}
                  <ChevronDown className={`h-4 w-4 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isLangDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      className="absolute right-0 top-full z-50 mt-2 min-w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
                    >
                      {availableLanguages.map((lang) => (
                        <button
                          type="button"
                          key={lang}
                          onClick={() => {
                            changeLanguage(lang)
                            setIsLangDropdownOpen(false)
                          }}
                          className={`block w-full px-4 py-3 text-left text-sm font-bold transition-colors ${
                            language === lang
                              ? 'bg-blue-600 text-white dark:bg-orange-500'
                              : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                          }`}
                        >
                          {lang === 'vi' ? '🇻🇳 Tiếng Việt' : lang === 'en' ? '🇬🇧 English' : '🇨🇳 中文'}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative hidden lg:block">
                <button
                  type="button"
                  onClick={() => {
                    setIsCurrencyDropdownOpen((value) => !value)
                    setIsLangDropdownOpen(false)
                  }}
                  className={dropdownButtonClass}
                >
                  {currency}
                  <ChevronDown className={`h-4 w-4 transition-transform ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isCurrencyDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      className="absolute right-0 top-full z-50 mt-2 min-w-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
                    >
                      {availableCurrencies.map((curr) => (
                        <button
                          type="button"
                          key={curr}
                          onClick={() => {
                            changeCurrency(curr)
                            setIsCurrencyDropdownOpen(false)
                          }}
                          className={`block w-full px-4 py-3 text-left text-sm font-bold transition-colors ${
                            currency === curr
                              ? 'bg-blue-600 text-white dark:bg-orange-500'
                              : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                          }`}
                        >
                          {curr}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5" />}
              </button>

              {user ? (
                <button
                  type="button"
                  onClick={() => setIsUserSidebarOpen(true)}
                  className="hidden items-center gap-3 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md lg:flex dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-xs font-black text-white dark:from-orange-500 dark:to-orange-600">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="pr-2 text-left">
                    <div className="text-xs font-bold text-slate-400">{t('manage')}</div>
                    <div className="max-w-28 truncate text-sm font-black text-slate-700 dark:text-slate-200">
                      {user.name?.split(' ')?.[0] || t('profile') || 'User'}
                    </div>
                  </div>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="hidden rounded-full bg-gradient-to-r from-emerald-700 to-stone-700 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-700/20 transition-all hover:-translate-y-0.5 hover:shadow-xl dark:from-emerald-600 dark:to-amber-800 dark:shadow-emerald-600/20 md:inline-flex"
                >
                  {t('login')}
                </Link>
              )}

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((value) => !value)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md md:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Open menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="hidden lg:block pb-4">
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-[1.75rem] border border-slate-200/80 bg-white px-4 py-4 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.path} to={item.path} className={navLinkClass(item.path)}>
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -12, height: 0 }}
              className="md:hidden"
            >
              <div className="border-t border-slate-200 bg-white px-4 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/98">
                <div className="mx-auto max-w-7xl space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={mobileNavLinkClass(item.path)}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/70">
                    <div className="space-y-2">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                        {t('language')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {availableLanguages.map((lang) => (
                          <button
                            type="button"
                            key={lang}
                            onClick={() => changeLanguage(lang)}
                            className={`rounded-xl px-3 py-2 text-xs font-black transition-all ${
                              language === lang
                                ? 'bg-blue-600 text-white dark:bg-orange-500'
                                : 'bg-white text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {lang.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                        {t('currency')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {availableCurrencies.map((curr) => (
                          <button
                            type="button"
                            key={curr}
                            onClick={() => changeCurrency(curr)}
                            className={`rounded-xl px-3 py-2 text-xs font-black transition-all ${
                              currency === curr
                                ? 'bg-blue-600 text-white dark:bg-orange-500'
                                : 'bg-white text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {curr}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {user ? (
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false)
                          setIsUserSidebarOpen(true)
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-700 to-stone-700 px-4 py-3 font-black text-white shadow-lg dark:from-emerald-600 dark:to-amber-800"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-sm font-black text-white">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="text-left">
                          <div className="text-xs uppercase tracking-[0.2em] text-white/70">{t('manage')}</div>
                          <div className="truncate">{user.name}</div>
                        </div>
                      </button>

                      <Link
                        to="/manage"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        {t('manage')}
                      </Link>
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-700 to-stone-700 px-4 py-3 font-black text-white shadow-lg dark:from-emerald-600 dark:to-amber-800"
                    >
                      {t('login')}
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <UserSidebar isOpen={isUserSidebarOpen} onClose={() => setIsUserSidebarOpen(false)} />
    </>
  )
}

export default Navbar
