
import React, { useState, useEffect, useRef } from 'react';
import { MenuGrid } from './components/MenuGrid';
import { ResultView } from './components/ResultView';
import { ApiKeySetup } from './components/ApiKeySetup';
import { getGeminiRecommendation } from './services/geminiService';
import { MENU_ITEMS } from './constants';
import { MenuItem, SelectionMode } from './types';
import { Zap, Dices, Trophy, CloudSun, Receipt, Trash2, ChevronRight, Settings, Users, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<SelectionMode>(SelectionMode.IDLE);
  const [result, setResult] = useState<{ item: MenuItem, reason: string } | null>(null);
  const [weatherInput, setWeatherInput] = useState<string>('');
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});
  
  const spinIntervalRef = useRef<number | null>(null);

  // 세션 스토리지에서 키 복구 시도 (새로고침 시 편의성)
  useEffect(() => {
    const savedKey = sessionStorage.getItem('GREEN_FC_API_KEY');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleKeySetup = (key: string) => {
    setApiKey(key);
    sessionStorage.setItem('GREEN_FC_API_KEY', key);
  };

  const logout = () => {
    if (window.confirm('인증 정보를 해제하시겠습니까?')) {
      setApiKey(null);
      sessionStorage.removeItem('GREEN_FC_API_KEY');
    }
  };

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
    if (!apiKey) return;
    setMode(SelectionMode.AI_THINKING);
    setSelectedId(null);

    try {
      const condition = weatherInput.trim() || "운동 후 체력 소모가 큼";
      const response = await getGeminiRecommendation(condition, apiKey);
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

  if (!apiKey) {
    return <ApiKeySetup onComplete={handleKeySetup} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      
      {/* Sidebar - 왼쪽 배치 */}
      <aside className="w-full lg:w-[400px] bg-white border-r border-gray-100 flex flex-col h-auto lg:h-screen sticky top-0 z-40">
        
        {/* Logo & Header */}
        <div className="p-8 bg-green-600 text-white rounded-br-[3rem] shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-white text-green-600 p-3 rounded-2xl shadow-xl">
                <Trophy size={32} fill="currentColor" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">Green FC</h1>
                <p className="text-xs text-green-100 font-bold opacity-80 uppercase tracking-widest">Lunch Manager Pro</p>
              </div>
            </div>
            <button onClick={logout} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <LogOut size={20} />
            </button>
          </div>
          
          {/* AI Input Section */}
          <div className="bg-green-700/50 p-6 rounded-3xl border border-green-500/30 backdrop-blur-sm shadow-inner">
            <div className="flex items-center gap-2 mb-3 text-green-200 text-[10px] font-black uppercase tracking-widest">
              <CloudSun size={14} />
              <span>AI 코치에게 요청하기</span>
            </div>
            <textarea 
              placeholder="예: 오늘 비가 오는데 시원한게 땡겨요"
              className="w-full bg-green-800/50 border border-green-500/30 rounded-2xl p-4 text-base text-white placeholder:text-green-300/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all resize-none h-28"
              value={weatherInput}
              onChange={(e) => setWeatherInput(e.target.value)}
              disabled={mode !== SelectionMode.IDLE}
            />
            <div className="grid grid-cols-2 gap-4 mt-5">
               <button
                  onClick={startRandomPick}
                  className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all border border-white/10"
               >
                 <Dices size={18} /> 랜덤
               </button>
               <button
                  onClick={startAiRecommendation}
                  disabled={mode !== SelectionMode.IDLE}
                  className="bg-white text-green-700 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 hover:bg-green-50"
               >
                 {mode === SelectionMode.AI_THINKING ? <div className="w-5 h-5 border-2 border-green-700 border-t-transparent animate-spin rounded-full" /> : <><Zap size={18} fill="currentColor" /> 추천</>}
               </button>
            </div>
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="p-8 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
               <Receipt size={24} className="text-green-600" />
               주문 현황
            </h2>
            {totalCount > 0 && (
              <button onClick={resetOrders} className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-xl">
                <Trash2 size={20} />
              </button>
            )}
          </div>

          {totalCount === 0 ? (
            <div className="bg-gray-50 rounded-[2.5rem] p-12 border-2 border-dashed border-gray-100 text-center flex flex-col items-center justify-center">
              <Users size={48} className="text-gray-200 mb-4" />
              <p className="text-gray-400 text-base font-bold leading-relaxed">아직 주문이 없습니다.<br/>메뉴를 선택해 주세요!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(orderCounts).map(([id, count]) => {
                const item = MENU_ITEMS.find(m => m.id === id);
                if (!item) return null;
                return (
                  <div key={id} className="flex items-center justify-between bg-white border border-gray-100 p-5 rounded-[2rem] shadow-sm animate-in slide-in-from-right-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm ring-2 ring-gray-50">
                         <img src={item.image} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-black text-gray-800 text-lg">{item.name}</span>
                    </div>
                    <span className="bg-green-50 text-green-700 min-w-[3.5rem] h-14 flex items-center justify-center rounded-[1.25rem] font-black text-2xl shadow-inner">
                      {count}
                    </span>
                  </div>
                );
              })}
              <div className="pt-8 mt-4 border-t-2 border-dashed border-gray-100 flex items-center justify-between">
                <span className="text-gray-400 font-black text-lg">합계</span>
                <span className="text-5xl font-black text-green-600 tracking-tighter">{totalCount}<small className="text-xl ml-2 text-gray-400 font-bold tracking-normal">개</small></span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area - 오른쪽 배치 */}
      <main className="flex-1 p-8 lg:p-16 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
            <div>
              <div className="inline-flex items-center gap-3 bg-green-50 text-green-600 px-5 py-2 rounded-full text-sm font-black mb-6 border border-green-100 shadow-sm">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                그린FC 영양 관리 모드 가동 중
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight">
                훈련 후 최고의 보양,<br/>
                <span className="text-green-600 underline decoration-green-100 underline-offset-8 decoration-8">무엇을 먹을까요?</span>
              </h2>
            </div>
            
            <button className="flex items-center gap-3 text-gray-400 hover:text-green-600 font-black transition-all bg-white px-8 py-4 rounded-[2rem] border border-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-1">
               <Settings size={22} />
               <span>시스템 정보</span>
            </button>
          </div>

          {/* Menu Selection Grid */}
          <div className="mb-20">
            <MenuGrid 
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              selectedId={selectedId}
              counts={orderCounts}
            />
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
             <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-10 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
                <h3 className="text-3xl font-black mb-6 flex items-center gap-4">
                   <Users className="text-green-400" size={32} />
                   선수단 추천 지표
                </h3>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed font-medium">
                  최근 7일간 그린FC 선수들이 가장 많이 선택한 메뉴는 <strong className="text-white">순두부찌개</strong>입니다. <br/>
                  고강도 훈련 후 단백질 섭취는 근섬유 회복에 필수적입니다.
                </p>
                <button className="text-sm font-black uppercase tracking-widest text-green-400 flex items-center gap-3 hover:translate-x-2 transition-transform">
                   전체 리포트 보기 <ChevronRight size={20} />
                </button>
             </div>

             <div className="bg-white p-10 rounded-[4rem] shadow-xl border border-gray-50 flex flex-col justify-center relative group hover:border-green-100 transition-colors">
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-[2rem] flex items-center justify-center shadow-inner">
                    <CloudSun size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">영양 코치 팁</h3>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Sport Nutrition Guide</p>
                  </div>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed font-medium italic">
                  "운동 후 30분 이내에 탄수화물과 단백질을 함께 섭취하면 글리코겐 보충 속도가 빨라집니다. 찌개류와 따뜻한 밥 한 그릇은 그린FC를 위한 최적의 에너지 조합입니다!"
                </p>
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
