import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ScrollToTop from './components/ScrollToTop'
import Footer from './components/Footer'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import { I18nProvider } from './context/I18nContext'
import Flights from './pages/Flights'
import MyTickets from './pages/MyTickets'
import Checkout from './pages/Checkout'
import AirportTransfer from './pages/AirportTransfer'
import Promotions from './pages/Promotions'
import HelpCenter from './pages/HelpCenter'
import TransactionHistory from './pages/TransactionHistory'
import AdminPanel from './pages/AdminPanel'

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <AppProvider>
          <Router>
            <div className="relative flex min-h-screen flex-col overflow-x-hidden font-sans text-slate-900 transition-colors duration-300 dark:text-slate-100">
              <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.10),transparent_24%),linear-gradient(180deg,rgba(248,250,252,0.94)_0%,rgba(241,245,249,0.98)_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.14),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.98)_0%,rgba(15,23,42,0.98)_100%)]" />
              <Navbar />
              <ScrollToTop />
              
              <main className="relative z-10 flex-grow pt-20 sm:pt-20 md:pt-24 lg:pt-28">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/manage" element={<MyTickets />} />
                  <Route path="/flights" element={<Flights />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/support" element={<HelpCenter />} />
                  <Route path="/help-center" element={<HelpCenter />} />
                  <Route path="/offers" element={<Promotions />} />
                  <Route path="/pickup" element={<AirportTransfer />} />
                  <Route path="/transactions" element={<TransactionHistory />} />
                  <Route path="/admin" element={<AdminPanel />} />
                </Routes>
              </main>

              <Footer />
            </div>
          </Router>
        </AppProvider>
      </AuthProvider>
    </I18nProvider>
  )
}

export default App
