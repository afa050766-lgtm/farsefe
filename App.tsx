
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { INITIAL_FABRICS } from './constants';
import { Fabric, CartItem } from './types';
import FabricCard from './components/FabricCard';
import { analyzeDesignImage } from './services/geminiService';

const App: React.FC = () => {
  const [fabrics] = useState<Fabric[]>(INITIAL_FABRICS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [scrolled, setScrolled] = useState(false);

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    ['الكل', 'مخاوير', 'كلف', 'فصوص', 'فساتين', 'حرير', 'قطن'], 
    []
  );

  const startCamera = async () => {
    setIsCameraOpen(true);
    setCapturedImage(null);
    setAnalysisResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("يرجى منح إذن الكاميرا لتصوير القماش");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      analyzeFabric(dataUrl);
    }
  };

  const analyzeFabric = async (base64: string) => {
    setIsAnalyzing(true);
    const pureBase64 = base64.split(',')[1];
    const result = await analyzeDesignImage(pureBase64, "حلل القماش واقترح أفضل الكلف وقطع الفصوص (الكريستال) المناسبة لتزيينه.");
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

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
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/95 backdrop-blur-md border-b border-slate-800' : 'bg-transparent'}`}>
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center gap-4">
          <div className="text-xl font-black tracking-tighter text-orange-500 whitespace-nowrap">مركز الكنز</div>
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="ابحثي عن أقمشة، كلف أو فصوص..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border-none rounded-full py-2 px-10 text-sm focus:ring-2 focus:ring-orange-600 transition-all placeholder:text-slate-600"
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
        <div className="mb-6 relative h-48 md:h-72 rounded-2xl overflow-hidden group">
          <img src="https://images.unsplash.com/photo-1596944210900-3467b346d299?auto=format&fit=crop&q=80" alt="Banner" className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-8">
            <h1 className="text-3xl md:text-5xl font-black mb-2 text-white">فخامة التفاصيل</h1>
            <p className="text-orange-500 text-sm font-bold uppercase tracking-[0.2em]">أرقى الأقمشة والكلف وأجمل الفصوص</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8 mb-16">
          {filteredFabrics.map((fabric) => (
            <FabricCard key={fabric.id} fabric={fabric} onAddToCart={handleAddToCart} />
          ))}
        </div>
      </main>

      {/* Camera Feature */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col">
          <div className="p-4 flex justify-between items-center bg-black/60 border-b border-white/10">
             <button onClick={stopCamera} className="text-white w-10 h-10 flex items-center justify-center bg-white/10 rounded-full"><i className="fa-solid fa-xmark"></i></button>
             <h3 className="font-bold text-orange-500 tracking-tighter">مساعد التنسيق الذكي</h3>
             <div className="w-10"></div>
          </div>
          <div className="flex-1 relative bg-slate-900">
            {!capturedImage ? (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            ) : (
              <img src={capturedImage} className="w-full h-full object-cover" />
            )}
            
            {analysisResult && (
              <div className="absolute bottom-0 left-0 right-0 bg-slate-950/95 p-8 rounded-t-[2rem] border-t border-orange-500/30 animate__animated animate__slideInUp">
                <div className="space-y-4">
                  <h4 className="text-orange-500 font-black">تحليل وتنسيق القطعة:</h4>
                  <div className="text-sm text-slate-300 bg-slate-900 p-4 rounded-xl border border-slate-800 leading-relaxed">
                    {analysisResult}
                  </div>
                  <button onClick={() => setCapturedImage(null)} className="w-full py-4 bg-slate-800 rounded-xl font-bold">تصوير قماش آخر</button>
                </div>
              </div>
            )}
          </div>
          {!capturedImage && (
            <div className="p-12 flex justify-center bg-black/80">
              <button onClick={capturePhoto} className="w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center active:scale-95 transition-all">
                <div className="w-14 h-14 bg-white rounded-full border-2 border-black"></div>
              </button>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-900 px-6 py-3 flex justify-between items-center z-[60] md:hidden">
        <button onClick={() => setActiveCategory('الكل')} className={`flex flex-col items-center gap-1.5 ${activeCategory === 'الكل' ? 'text-orange-500' : 'text-slate-500'}`}>
          <i className="fa-solid fa-store text-xl"></i>
          <span className="text-[10px] font-black">الرئيسية</span>
        </button>
        <button onClick={() => setActiveCategory('فصوص')} className={`flex flex-col items-center gap-1.5 ${activeCategory === 'فصوص' ? 'text-orange-500' : 'text-slate-500'}`}>
          <i className="fa-solid fa-gem text-xl"></i>
          <span className="text-[10px] font-black">فصوص</span>
        </button>
        <div className="relative -top-7">
           <button onClick={startCamera} className="bg-orange-600 w-16 h-16 rounded-full shadow-[0_5px_20px_rgba(234,88,12,0.4)] flex items-center justify-center text-white border-4 border-slate-950 active:scale-90 transition-all">
             <i className="fa-solid fa-camera text-2xl"></i>
           </button>
        </div>
        <button onClick={() => setActiveCategory('كلف')} className={`flex flex-col items-center gap-1.5 ${activeCategory === 'كلف' ? 'text-orange-500' : 'text-slate-500'}`}>
          <i className="fa-solid fa-scissors text-xl"></i>
          <span className="text-[10px] font-black">كلف</span>
        </button>
        <button onClick={() => setIsCartOpen(true)} className="flex flex-col items-center gap-1.5 text-slate-500">
          <i className="fa-solid fa-bag-shopping text-xl"></i>
          <span className="text-[10px] font-black">الحقيبة</span>
        </button>
      </nav>

      {isCartOpen && (
        <div className="fixed inset-0 z-[300] flex justify-end">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-slate-950 h-full flex flex-col border-r border-slate-900 animate__animated animate__slideInLeft">
            <div className="p-8 border-b border-slate-900 flex justify-between items-center">
              <h2 className="text-2xl font-black">حقيبة التسوق</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-500"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 items-center">
                  <img src={item.image} className="w-16 h-20 object-cover rounded-lg border border-slate-800" />
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{item.name}</h4>
                    <p className="text-orange-500 font-bold">{item.price} ر.س</p>
                    <p className="text-[10px] text-slate-500">الكمية: {item.quantity}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-900 bg-red-900/10 px-3 py-1 rounded-md text-[10px] font-bold">حذف</button>
                </div>
              ))}
              {cart.length === 0 && <p className="text-center text-slate-600 py-20">لا توجد قطع في الحقيبة</p>}
            </div>
            <div className="p-8 border-t border-slate-900 bg-slate-900/30">
              <div className="flex justify-between mb-4">
                <span className="text-slate-400">الإجمالي:</span>
                <span className="font-black text-xl text-orange-500">{cartTotal} ر.س</span>
              </div>
              <button className="w-full bg-orange-600 py-4 rounded-xl font-black text-white shadow-lg hover:bg-orange-500 transition-all">إرسال الطلب عبر واتساب</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
