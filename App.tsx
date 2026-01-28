
import React, { useState, useEffect, useRef } from 'react';
import { MenuGrid } from './components/MenuGrid';
import { ResultView } from './components/ResultView';
import { ApiKeySetup } from './components/ApiKeySetup';
import { getGeminiRecommendation } from './services/geminiService';
import { MENU_ITEMS } from './constants';
import { MenuItem, SelectionMode } from './types';
import { Zap, Dices, Trophy, CloudSun, Receipt, Trash2, Users, Info, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<SelectionMode>(SelectionMode.IDLE);
  const [result, setResult] = useState<{ item: MenuItem, reason: string } | null>(null);
  const [weatherInput, setWeatherInput] = useState<string>('');
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});
  
  useEffect(() => {
    const savedKey = sessionStorage.getItem('GREENFC_SESSION_KEY');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleKeyComplete = (key: string) => {
    setApiKey(key);
    sessionStorage.setItem('GREENFC_SESSION_KEY', key);
  };

  const handleLogout = () => {
    if (window.confirm('인증 세션을 종료하시겠습니까?')) {
      setApiKey(null);
      sessionStorage.removeItem('GREENFC_SESSION_KEY');
    }
  };

  const updateCount = (itemId: string, delta: number) => {
    setOrderCounts(prev => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      const updated = { ...prev };
      if (next === 0) delete updated[itemId];
      else updated[itemId] = next;
      return updated;
    });
  };

  const startAiRecommendation = async () => {
    if (!apiKey) return;
    setMode(SelectionMode.AI_THINKING);
    try {
      const response = await getGeminiRecommendation(weatherInput || "운동 직후 기력 보충", apiKey);
      const found = MENU_ITEMS.find(m => m.name === response.menuName) || MENU_ITEMS[0];
      setResult({ item: found, reason: response.reason });
      setMode(SelectionMode.RESULT);
    } catch (err) {
      console.error(err);
      setMode(SelectionMode.IDLE);
    }
  };

  const startRandomPick = () => {
    setMode(SelectionMode.RANDOM_SPINNING);
    let count = 0;
    const interval = window.setInterval(() => {
      setSelectedId(MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)].id);
      count++;
      if (count > 15) {
        clearInterval(interval);
        const final = MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)];
        setSelectedId(final.id);
        setResult({ item: final, reason: "오늘의 행운 메뉴로 결정되었습니다!" });
        setMode(SelectionMode.RESULT);
      }
    }, 100);
  };

  const total = (Object.values(orderCounts) as number[]).reduce((a, b) => a + b, 0);

  if (!apiKey) {
    return <ApiKeySetup onComplete={handleKeyComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      
      {/* Sidebar - 좌측 배치 */}
      <aside className="w-full lg:w-[450px] bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 z-40 shadow-2xl">
        <div className="p-10 bg-green-600 text-white rounded-br-[4rem] shadow-lg">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="bg-white text-green-600 p-3 rounded-2xl shadow-xl">
                <Trophy size={32} fill="currentColor" />
              </div>
              <div>
                <h1 className="text-2xl font-black">Green FC</h1>
                <p className="text-[10px] font-bold opacity-70 tracking-widest uppercase">Admin Dashboard</p>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <LogOut size={22} />
            </button>
          </div>

          <div className="bg-green-700/40 p-6 rounded-[2.5rem] border border-green-500/30 backdrop-blur-md shadow-inner">
            <div className="flex items-center gap-2 mb-4 text-green-200 text-xs font-black uppercase tracking-tighter">
              <CloudSun size={16} /> AI 코치 영양 상담
            </div>
            <textarea
              placeholder="예: 오늘 훈련이 힘들어서 다들 지쳐있어요."
              className="w-full bg-green-800/40 border border-green-500/30 rounded-2xl p-5 text-lg text-white placeholder:text-green-300/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all h-36 resize-none"
              value={weatherInput}
              onChange={(e) => setWeatherInput(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button onClick={startRandomPick} className="bg-white/10 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border border-white/10 hover:bg-white/20 transition-all">
                <Dices size={20} /> 랜덤 선택
              </button>
              <button onClick={startAiRecommendation} className="bg-white text-green-700 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:bg-green-50 transition-all">
                {mode === SelectionMode.AI_THINKING ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-700 border-t-transparent" /> : <><Zap size={20} fill="currentColor" /> AI 추천</>}
              </button>
            </div>
          </div>
        </div>

        <div className="p-10 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <Receipt size={24} className="text-green-600" /> 주문 집계
            </h2>
            {total > 0 && (
              <button onClick={() => setOrderCounts({})} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-colors">
                <Trash2 size={20} />
              </button>
            )}
          </div>

          {total === 0 ? (
            <div className="bg-gray-50 rounded-[3rem] p-16 border-2 border-dashed border-gray-100 text-center">
              <Users size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-bold leading-relaxed">아직 등록된 주문이<br/>없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(orderCounts).map(([id, count]) => {
                const item = MENU_ITEMS.find(m => m.id === id);
                if (!item) return null;
                return (
                  <div key={id} className="flex items-center justify-between bg-white border border-gray-100 p-5 rounded-[2rem] shadow-sm animate-in slide-in-from-right-4">
                    <div className="flex items-center gap-4">
                      <img src={item.image} className="w-16 h-16 rounded-2xl object-cover shadow-sm" alt={item.name} />
                      <span className="font-black text-gray-800 text-lg">{item.name}</span>
                    </div>
                    <span className="bg-green-50 text-green-700 w-14 h-14 flex items-center justify-center rounded-2xl font-black text-2xl shadow-inner">
                      {count}
                    </span>
                  </div>
                );
              })}
              <div className="pt-10 mt-6 border-t-2 border-dashed border-gray-100 flex items-center justify-between">
                <span className="text-gray-400 font-black text-xl tracking-tight">TOTAL</span>
                <span className="text-6xl font-black text-green-600 tracking-tighter">{total}<small className="text-xl ml-2 text-gray-400 font-bold tracking-normal">개</small></span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Grid - 우측 배치 */}
      <main className="flex-1 p-10 lg:p-20 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <header className="mb-16">
            <div className="inline-flex items-center gap-3 bg-green-50 text-green-600 px-6 py-2 rounded-full text-sm font-black mb-6 border border-green-100">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              훈련 종료! 영양 밸런스를 고려한 식사
            </div>
            <h2 className="text-6xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
              그린FC 선수단의<br/>
              <span className="text-green-600 underline decoration-green-100 decoration-8 underline-offset-12">최고의 한 끼</span>
            </h2>
          </header>

          <MenuGrid 
            onIncrement={(i) => updateCount(i.id, 1)}
            onDecrement={(i) => updateCount(i.id, -1)}
            selectedId={selectedId}
            counts={orderCounts}
          />

          <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-gray-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
              <h3 className="text-3xl font-black mb-6 flex items-center gap-4">
                <Users size={32} className="text-green-400" /> 데이터 기반 분석
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed font-medium">
                오늘의 훈련 강도에 따라 필요한 칼로리와 단백질 함량이 높은 식단을 권장합니다.
              </p>
            </div>
            <div className="bg-white rounded-[3.5rem] p-12 border border-gray-100 shadow-xl flex items-center gap-8">
              <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-[2rem] flex items-center justify-center shrink-0">
                <Info size={36} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">영양 코멘트</h3>
                <p className="text-gray-500 font-medium text-lg leading-relaxed">
                  찌개류는 수분과 나트륨을 동시에 보충하기 좋은 최적의 식단입니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {result && mode === SelectionMode.RESULT && (
        <ResultView 
          item={result.item} 
          reason={result.reason}
          onReset={() => setMode(SelectionMode.IDLE)}
          onAddToOrder={() => updateCount(result.item.id, 1)}
          isAiRecommended={mode === SelectionMode.RESULT}
        />
      )}
    </div>
  );
};

export default App;
