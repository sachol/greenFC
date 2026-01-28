
import React, { useState, useEffect, useRef } from 'react';
import { MenuGrid } from './components/MenuGrid';
import { ResultView } from './components/ResultView';
import { ApiKeySetup } from './components/ApiKeySetup';
import { getGeminiRecommendation } from './services/geminiService';
import { MENU_ITEMS } from './constants';
import { MenuItem, SelectionMode } from './types';
import { Zap, Dices, Trophy, CloudSun, Receipt, Trash2, ChevronRight, Settings, Users } from 'lucide-react';

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<SelectionMode>(SelectionMode.IDLE);
  const [result, setResult] = useState<{ item: MenuItem, reason: string } | null>(null);
  const [weatherInput, setWeatherInput] = useState<string>('');
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});
  
  const spinIntervalRef = useRef<number | null>(null);

  // API 키 유무 확인
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const isSelected = await window.aistudio.hasSelectedApiKey();
        setHasKey(isSelected);
      } else {
        // Fallback for non-aistudio environment (assume key is in process.env)
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const updateCount = (itemId: string, delta: number) => {
    setOrderCounts(prev => {
      const current = prev[itemId] || 0;
      const newCount = Math.max(0, current + delta);
      const newCounts = { ...prev };
      if (newCount === 0) {
        delete newCounts[itemId];
      } else {
        newCounts[itemId] = newCount;
      }
      return newCounts;
    });
  };

  const handleIncrement = (item: MenuItem) => updateCount(item.id, 1);
  const handleDecrement = (item: MenuItem) => updateCount(item.id, -1);
  
  const resetOrders = () => {
    if (window.confirm('주문 내역을 모두 지우시겠습니까?')) {
      setOrderCounts({});
    }
  };

  const startRandomPick = () => {
    setMode(SelectionMode.RANDOM_SPINNING);
    setWeatherInput('');
    let counter = 0;
    const maxSpins = 12;

    if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);

    spinIntervalRef.current = window.setInterval(() => {
      const randomIndex = Math.floor(Math.random() * MENU_ITEMS.length);
      setSelectedId(MENU_ITEMS[randomIndex].id);
      counter++;

      if (counter >= maxSpins) {
        if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
        const finalItem = MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)];
        setSelectedId(finalItem.id);
        
        setTimeout(() => {
          setResult({ item: finalItem, reason: "오늘의 행운 메뉴입니다! 맛있게 드시고 득점하세요!" });
          setMode(SelectionMode.RESULT);
        }, 500);
      }
    }, 150);
  };

  const startAiRecommendation = async () => {
    setMode(SelectionMode.AI_THINKING);
    setSelectedId(null);

    try {
      const condition = weatherInput.trim() || "운동 후 체력 소모가 큼";
      const response = await getGeminiRecommendation(condition);
      const foundItem = MENU_ITEMS.find(item => item.name === response.menuName);
      
      if (foundItem) {
        setResult({ item: foundItem, reason: response.reason });
        setMode(SelectionMode.RESULT);
      } else {
        startRandomPick(); 
      }
    } catch (error) {
      console.error(error);
      setMode(SelectionMode.ERROR);
      setTimeout(() => setMode(SelectionMode.IDLE), 2000);
    }
  };

  const totalCount = (Object.values(orderCounts) as number[]).reduce((sum, c) => sum + c, 0);

  if (hasKey === false) {
    return <ApiKeySetup onComplete={() => setHasKey(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      
      {/* Sidebar - 왼쪽 배치 */}
      <aside className="w-full lg:w-96 bg-white border-r border-gray-100 flex flex-col h-auto lg:h-screen sticky top-0 z-40 overflow-y-auto">
        
        {/* Logo & Header */}
        <div className="p-8 bg-green-600 text-white rounded-br-[3rem]">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-white text-green-600 p-3 rounded-2xl shadow-xl">
              <Trophy size={32} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Green FC</h1>
              <p className="text-xs text-green-100 font-bold opacity-80 uppercase tracking-widest">Lunch Manager Pro</p>
            </div>
          </div>
          
          {/* AI Input Section */}
          <div className="bg-green-700/50 p-5 rounded-3xl border border-green-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3 text-green-200 text-[10px] font-black uppercase tracking-widest">
              <CloudSun size={14} />
              <span>AI 코치에게 요청하기</span>
            </div>
            <textarea 
              placeholder="예: 오늘 비가 오는데 시원한게 땡겨요"
              className="w-full bg-green-800/50 border border-green-500/30 rounded-2xl p-4 text-sm text-white placeholder:text-green-300/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all resize-none h-24"
              value={weatherInput}
              onChange={(e) => setWeatherInput(e.target.value)}
              disabled={mode !== SelectionMode.IDLE}
            />
            <div className="grid grid-cols-2 gap-3 mt-4">
               <button
                  onClick={startRandomPick}
                  className="bg-white/10 hover:bg-white/20 text-white py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all"
               >
                 <Dices size={16} /> 랜덤
               </button>
               <button
                  onClick={startAiRecommendation}
                  disabled={mode !== SelectionMode.IDLE}
                  className="bg-white text-green-700 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
               >
                 {mode === SelectionMode.AI_THINKING ? <div className="w-4 h-4 border-2 border-green-700 border-t-transparent animate-spin rounded-full" /> : <><Zap size={16} fill="currentColor" /> 추천</>}
               </button>
            </div>
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="p-8 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
               <Receipt size={20} className="text-green-600" />
               주문 현황
            </h2>
            {totalCount > 0 && (
              <button onClick={resetOrders} className="text-red-400 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            )}
          </div>

          {totalCount === 0 ? (
            <div className="bg-gray-50 rounded-3xl p-8 border-2 border-dashed border-gray-100 text-center">
              <Users size={32} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm font-medium leading-relaxed">아직 주문이 없습니다.<br/>메뉴를 선택해 주세요!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(orderCounts).map(([id, count]) => {
                const item = MENU_ITEMS.find(m => m.id === id);
                if (!item) return null;
                return (
                  <div key={id} className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-sm group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm">
                         <img src={item.image} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-gray-800">{item.name}</span>
                    </div>
                    <span className="bg-green-50 text-green-700 w-10 h-10 flex items-center justify-center rounded-xl font-black text-lg">
                      {count}
                    </span>
                  </div>
                );
              })}
              <div className="pt-6 border-t-2 border-dashed border-gray-100 flex items-center justify-between">
                <span className="text-gray-400 font-bold">합계</span>
                <span className="text-3xl font-black text-green-600">{totalCount}<small className="text-sm ml-1 text-gray-400 font-bold">개</small></span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Nav / Info */}
        <div className="p-8 mt-auto border-t border-gray-50 text-center">
            <p className="text-gray-300 text-[10px] font-black uppercase tracking-[0.2em]">Green FC Official Application</p>
        </div>
      </aside>

      {/* Main Content Area - 오른쪽 배치 */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-xs font-black mb-4 border border-green-100">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                오늘의 훈련 완료: {new Date().toLocaleDateString('ko-KR')}
              </div>
              <h2 className="text-5xl font-black text-gray-900 tracking-tight leading-tight">
                훈련 후 최고의 보양,<br/>
                <span className="text-green-600 underline decoration-green-100 underline-offset-8">무엇을 먹을까요?</span>
              </h2>
            </div>
            
            <button className="flex items-center gap-2 text-gray-400 hover:text-green-600 font-bold transition-all bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
               <Settings size={18} />
               <span>설정 관리</span>
            </button>
          </div>

          {/* Menu Selection Grid */}
          <MenuGrid 
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            selectedId={selectedId}
            counts={orderCounts}
          />

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
             <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
                   <Users className="text-green-400" />
                   선수단 추천 지표
                </h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">최근 7일간 그린FC 선수들이 가장 많이 선택한 메뉴는 <strong>순두부찌개</strong>입니다. 단백질 함량이 높아 근육 회복에 탁월합니다.</p>
                <button className="text-xs font-black uppercase tracking-widest text-green-400 flex items-center gap-2">
                   리포트 보기 <ChevronRight size={14} />
                </button>
             </div>

             <div className="bg-white p-8 rounded-[3rem] shadow-lg border border-gray-100 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                    <CloudSun size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">영양 코치 팁</h3>
                    <p className="text-xs text-gray-400">Vitamin & Energy Info</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">운동 후 30분 이내에 탄수화물과 단백질을 함께 섭취하면 글리코겐 보충 속도가 빨라집니다. 찌개류와 밥은 최적의 조합입니다!</p>
             </div>
          </div>
        </div>
      </main>

      {/* Result Modal */}
      {result && (mode === SelectionMode.RESULT) && (
        <ResultView 
          item={result.item} 
          reason={result.reason}
          onReset={() => {
            setMode(SelectionMode.IDLE);
            setResult(null);
            setSelectedId(null);
          }}
          onAddToOrder={() => updateCount(result.item.id, 1)}
          isAiRecommended={!!weatherInput || result.reason.length > 30}
        />
      )}
    </div>
  );
};

export default App;
