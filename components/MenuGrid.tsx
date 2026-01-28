
import React, { useState } from 'react';
import { MENU_ITEMS } from '../constants';
import { MenuItem } from '../types';
import { Minus, Plus, UtensilsCrossed, Soup, Heart } from 'lucide-react';

interface MenuGridProps {
  onIncrement: (item: MenuItem) => void;
  onDecrement: (item: MenuItem) => void;
  selectedId: string | null;
  counts: Record<string, number>;
}

export const MenuGrid: React.FC<MenuGridProps> = ({ onIncrement, onDecrement, selectedId, counts }) => {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
      {MENU_ITEMS.map((item) => {
        const isHighlighted = selectedId === item.id;
        const count = counts[item.id] || 0;
        const isLoaded = loadedImages[item.id];
        
        return (
          <div key={item.id} className="relative group animate-in fade-in slide-in-from-bottom-8 duration-500">
            <button
              onClick={() => onIncrement(item)}
              className={`
                w-full relative flex flex-col rounded-[3rem] transition-all duration-500
                bg-white overflow-hidden border-2
                ${isHighlighted ? 'ring-8 ring-green-500/10 border-green-500 scale-[1.02] shadow-2xl z-10' : 'border-gray-100 shadow-xl hover:shadow-2xl hover:border-green-200'}
                active:scale-95
              `}
            >
              {/* Image & Illustration Layer */}
              <div className={`w-full aspect-[16/10] relative overflow-hidden`}>
                
                {/* Placeholder Icon */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-200 bg-gray-50">
                   <Soup size={64} className={`${item.color.replace('bg-', 'text-')} opacity-10 animate-pulse`} />
                </div>

                <img 
                  src={item.image} 
                  alt={item.name}
                  onLoad={() => handleImageLoad(item.id)}
                  className={`w-full h-full object-cover transition-all duration-1000 transform group-hover:scale-110 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-125'}`}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                <div className="absolute bottom-6 left-8 text-left">
                  <h3 className="text-3xl font-black text-white tracking-tight mb-2 drop-shadow-md">
                    {item.name}
                  </h3>
                  <div className="flex gap-2">
                    {item.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-black px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white uppercase tracking-wider">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {count > 0 && (
                  <div className="absolute top-6 left-8 bg-red-600 text-white text-lg font-black w-12 h-12 flex items-center justify-center rounded-2xl shadow-xl border-4 border-white animate-in zoom-in">
                    {count}
                  </div>
                )}
                
                <div className="absolute top-6 right-8 text-white/50 group-hover:text-red-400 transition-colors">
                   <Heart size={24} fill={isHighlighted ? "currentColor" : "none"} className={isHighlighted ? "text-red-500" : ""} />
                </div>
              </div>
            </button>

            {/* Decrement Button Overlay */}
            {count > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDecrement(item);
                }}
                className="absolute -bottom-3 -right-3 bg-white text-red-500 border-2 border-red-50 hover:bg-red-50 rounded-3xl p-5 shadow-2xl z-20 transition-transform hover:scale-110 active:scale-90"
              >
                <Minus size={24} strokeWidth={4} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
