
import React, { useState } from 'react';
import { Fabric } from '../types';

interface Props {
  fabric: Fabric;
  onAddToCart: (fabric: Fabric) => void;
}

const FabricCard: React.FC<Props> = ({ fabric, onAddToCart }) => {
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <div className="flex flex-col group animate__animated animate__fadeIn">
      <div className="relative aspect-[3/4.5] overflow-hidden rounded-xl bg-slate-900 border border-slate-900 group-hover:border-orange-600/30 transition-all duration-300">
        <img 
          src={fabric.image} 
          alt={fabric.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        />
        
        {/* Heart Icon (SHEIN Top Right) */}
        <button 
          onClick={(e) => { e.stopPropagation(); setWishlisted(!wishlisted); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white transition-all hover:bg-white hover:text-red-500"
        >
          <i className={`${wishlisted ? 'fa-solid' : 'fa-regular'} fa-heart text-sm`}></i>
        </button>

        {/* Quick Add Overlay (SHEIN Style Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button 
            onClick={() => onAddToCart(fabric)}
            className="w-full bg-orange-600 text-white py-2 rounded-lg font-black text-[10px] uppercase shadow-lg shadow-orange-600/30 active:scale-95 transition-all"
          >
            إضافة +
          </button>
        </div>

        {/* Category Label */}
        <div className="absolute top-2 left-2">
           <span className="bg-slate-950/70 backdrop-blur text-white text-[8px] font-black px-2 py-0.5 rounded-sm">
             {fabric.category}
           </span>
        </div>
      </div>

      <div className="mt-2 space-y-0.5">
        <h3 className="text-slate-400 font-medium text-xs truncate">
          {fabric.name}
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="text-white text-sm font-black">{fabric.price} <small className="text-[8px]">ر.س</small></span>
          <span className="text-slate-700 text-[10px] line-through">{(fabric.price * 1.3).toFixed(0)} ر.س</span>
          <span className="text-red-500 text-[9px] font-bold">-30%</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] text-orange-500">
          <div className="flex">
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star-half-stroke"></i>
          </div>
          <span className="text-slate-600">(450)</span>
        </div>
      </div>
    </div>
  );
};

export default FabricCard;
