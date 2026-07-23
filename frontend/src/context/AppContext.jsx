import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

// BỘ TỪ ĐIỂN ĐA NGÔN NGỮ
const translations = {
  vi: {
    explore: "Khám phá", 
    flights: "Chuyến bay", 
    offers: "Khuyến mãi", 
    manage: "Quản lý vé", 
    support: "Hỗ trợ",
    login: "Đăng nhập", 
    search: "TÌM CHUYẾN",
    from: "Điểm đi", 
    to: "Điểm đến", 
    date: "Ngày bay",
    slogan: "Thế giới trong", 
    sloganHighlight: "tầm tay bạn",
    subSlogan: "Trải nghiệm bay đẳng cấp 5 sao cùng Kangaroo Airline",
    featuredFlights: "Chuyến bay nổi bật", 
    priceFrom: "Giá vé từ", 
    bookNow: "CHỌN CHỖ",
    promoTitle: "Khuyến mãi ngập tràn", 
    promoSub: "Đừng bỏ lỡ những ưu đãi độc quyền dành riêng cho thành viên.",
    serviceTitle: "Dịch vụ đẳng cấp",
    service1: "Phòng chờ thương gia", service1Sub: "Nghỉ ngơi thoải mái trước mỗi chuyến bay.",
    service2: "Wi-Fi tốc độ cao", service2Sub: "Giữ kết nối xuyên suốt hành trình.",
    service3: "Hành lý siêu trọng", service3Sub: "Thoải mái mang theo cả thế giới.",
    popularDestinations: "Điểm đến thịnh hành",
    tokyo: "Tokyo, Nhật Bản",
    singapore: "Singapore",
    seoul: "Seoul, Hàn Quốc",
    promoSection: "Ưu đãi độc quyền",
    promo1: "Chào hè rực rỡ - Giảm 20%",
    promo1Sub: "Áp dụng cho mọi chặng bay quốc tế từ nay đến 30/06.",
    promo2: "Thành viên VIP - Nhân đôi dặm bay",
    promo2Sub: "Đăng ký hội viên ngay hôm nay để nhận đặc quyền vô hạn.",
    copyRight: "© 2026 Kangaroo Airline. Đồ án của tôi.",
    diningTitle: "Tinh hoa ẩm thực trên không",
    diningSub: "Thưởng thức thực đơn đa dạng được chuẩn bị bởi các siêu đầu bếp quốc tế.",
    dining1: "Món chính chuẩn vị",
    dining2: "Thức uống hảo hạng",
    dining3: "Tráng miệng ngọt ngào",
    pickUp: "Dịch vụ đưa đón", // Thêm dòng này
    support: "Hỗ trợ",
  },
  en: {
    explore: "Explore", 
    flights: "Flights", 
    offers: "Offers", 
    manage: "Manage Booking", 
    support: "Support",
    login: "Login", 
    search: "SEARCH",
    from: "From", 
    to: "To", 
    date: "Date",
    slogan: "The world at", 
    sloganHighlight: "your fingertips",
    subSlogan: "Experience 5-star premium flights with Kangaroo Airline",
    featuredFlights: "Featured Flights", 
    priceFrom: "From", 
    bookNow: "BOOK NOW",
    promoTitle: "Exclusive Offers", 
    promoSub: "Don't miss out on exclusive deals for our members.",
    serviceTitle: "Premium Services",
    service1: "Business Lounge", service1Sub: "Relax comfortably before your flight.",
    service2: "High-Speed Wi-Fi", service2Sub: "Stay connected throughout your journey.",
    service3: "Extra Baggage", service3Sub: "Travel freely with all your essentials.",
    popularDestinations: "Popular Destinations",
    tokyo: "Tokyo, Japan",
    singapore: "Singapore",
    seoul: "Seoul, South Korea",
    promoSection: "Exclusive Offers",
    promo1: "Hello Summer - 20% Off",
    promo1Sub: "Valid for all international flights until June 30.",
    promo2: "VIP Member - Double Miles",
    promo2Sub: "Register today to unlock endless privileges.",
    copyRight: "© 2026 Kangaroo Airline. A project by me.",
    diningTitle: "In-flight Culinary Excellence",
    diningSub: "Savor a diverse menu prepared by world-class chefs.",
    dining1: "Authentic Main Courses",
    dining2: "Premium Beverages",
    dining3: "Sweet Desserts",
    pickUp: "Airport Transfer", // Thêm dòng này
    support: "Support",
  }
};

export const AppProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lang, setLang] = useState('vi');
  
  // 1. STATE QUẢN LÝ NGƯỜI DÙNG
  const [user, setUser] = useState(null); // null nghĩa là chưa đăng nhập

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleLang = () => setLang(lang === 'vi' ? 'en' : 'vi');
  const t = (key) => translations[lang][key] || key;

  // 2. HÀM ĐĂNG NHẬP / ĐĂNG XUẤT
  const loginApp = (userData) => {
    setUser(userData);
    // Thực tế sẽ lưu Token vào localStorage ở đây
  };

  const logoutApp = () => {
    setUser(null);
  };

  return (
    // Truyền thêm user, loginApp, logoutApp ra toàn ứng dụng
    <AppContext.Provider value={{ isDarkMode, toggleTheme, lang, toggleLang, t, user, loginApp, logoutApp }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);