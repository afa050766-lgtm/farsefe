
import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_FABRICS } from './constants';
import { Fabric, CartItem } from './types';
import FabricCard from './components/FabricCard';
import { getFabricRecommendation, analyzeDesignImage } from './services/geminiService';

const App: React.FC = () => {
  const [fabrics] = useState<Fabric[]>(INITIAL_FABRICS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const categories = useMemo(() => 
    ['الكل', 'فساتين', 'مخاوير', 'حرير', 'قطن', 'كتان'], 
    []
  );

  const handleAddToCart = (fabric: Fabric) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === fabric.id);
      if (existing) {
        return prev.map(item => item.id === fabric.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...fabric, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const filteredFabrics = useMemo(() => {
    return fabrics.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
                           f.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'الكل' || f.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [fabrics, debouncedSearchTerm, activeCategory]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 md:pb-0">
      {/* Search Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/95 backdrop-blur-md border-b border-slate-800' : 'bg-transparent'}`}>
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center gap-4">
          <div className="text-xl font-black tracking-tighter text-orange-500 whitespace-nowrap">مركز الكنز</div>
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="ابحثي عن فساتين، مخاوير، أو أقمشة..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border-none rounded-full py-2 px-10 text-sm focus:ring-2 focus:ring-orange-600 transition-all"
            />
            <i className="fa-solid fa-magnifying-glass absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
          </div>
          <button onClick={() => setIsCartOpen(true)} className="relative p-2">
            <i className="fa-solid fa-bag-shopping text-xl"></i>
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        {/* Categories Tab Bar */}
        <div className="border-b border-slate-900 bg-slate-950 overflow-x-auto no-scrollbar flex px-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-3 text-sm font-bold whitespace-nowrap transition-all relative ${
                activeCategory === cat ? 'text-orange-500' : 'text-slate-400'
              }`}
            >
              {cat}
              {activeCategory === cat && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full mx-3"></div>}
            </button>
          ))}
        </div>
      </header>

      <main className="pt-32 px-4 max-w-[1600px] mx-auto w-full">
        {/* Banner */}
        <div className="mb-6 relative h-40 md:h-64 rounded-2xl overflow-hidden group">
          <img src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex flex-col justify-end p-6">
            <h1 className="text-2xl md:text-4xl font-black mb-1">أجمل المخاوير الإماراتية</h1>
            <p className="text-orange-500 text-xs font-bold uppercase tracking-widest">تطريز تراثي بلمسة عصرية</p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6 mb-10">
          {filteredFabrics.map((fabric) => (
            <FabricCard key={fabric.id} fabric={fabric} onAddToCart={handleAddToCart} />
          ))}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-900 px-6 py-2 flex justify-between items-center z-[60] md:hidden">
        <button onClick={() => setActiveCategory('الكل')} className={`flex flex-col items-center gap-1 ${activeCategory === 'الكل' ? 'text-orange-500' : 'text-slate-500'}`}>
          <i className="fa-solid fa-house text-lg"></i>
          <span className="text-[10px] font-bold">الرئيسية</span>
        </button>
        <button onClick={() => setActiveCategory('فساتين')} className={`flex flex-col items-center gap-1 ${activeCategory === 'فساتين' ? 'text-orange-500' : 'text-slate-500'}`}>
          <i className="fa-solid fa-person-dress text-lg"></i>
          <span className="text-[10px] font-bold">فساتين</span>
        </button>
        <div className="relative -top-5">
           <button className="bg-orange-600 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white text-xl border-4 border-slate-950">
             <i className="fa-solid fa-gem"></i>
           </button>
        </div>
        <button onClick={() => setActiveCategory('مخاوير')} className={`flex flex-col items-center gap-1 ${activeCategory === 'مخاوير' ? 'text-orange-500' : 'text-slate-500'}`}>
          <i className="fa-solid fa-scroll text-lg"></i>
          <span className="text-[10px] font-bold">مخاوير</span>
        </button>
        <button onClick={() => setIsCartOpen(true)} className="flex flex-col items-center gap-1 text-slate-500">
          <i className="fa-solid fa-bag-shopping text-lg"></i>
          <span className="text-[10px] font-bold">حقيبتي</span>
        </button>
      </nav>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-slate-950 h-full flex flex-col border-r border-slate-900 animate__animated animate__slideInLeft">
            <div className="p-6 border-b border-slate-900 flex justify-between items-center">
              <h2 className="text-xl font-black">حقيبة التسوق</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-500"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 items-center">
                  <img src={item.image} className="w-20 h-24 object-cover rounded-xl border border-slate-900" />
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{item.name}</h4>
                    <p className="text-orange-500 font-black text-sm mt-1">{item.price} ر.س</p>
                    <div className="flex items-center gap-4 mt-2">
                       <span className="text-xs font-bold bg-slate-900 px-2 py-1 rounded">الكمية: {item.quantity}</span>
                       <button onClick={() => removeFromCart(item.id)} className="text-red-900 text-xs">حذف</button>
                    </div>
                  </div>
                </div>
              ))}
              {cart.length === 0 && <div className="text-center py-20 text-slate-700">حقيبتك فارغة حالياً</div>}
            </div>
            {cart.length > 0 && (
              <div className="p-6 border-t border-slate-900 bg-slate-900/50">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-500 font-bold">الإجمالي</span>
                  <span className="text-2xl font-black text-orange-500">{cartTotal} ر.س</span>
                </div>
                <button className="w-full bg-orange-600 text-white py-4 rounded-full font-black hover:bg-orange-500 transition-all shadow-xl shadow-orange-600/20">تأكيد الطلب</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
