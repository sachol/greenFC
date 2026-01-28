
import React, { useState, useEffect } from 'react';
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
  const [result, setResult] = useState<{ item: MenuItem, reason: string, isAi?: boolean } | null>(null);
  const [weatherInput, setWeatherInput] = useState<string>('');
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});
  
  // 1. 초기 로드 시 세션 스토리지 확인
  useEffect(() => {
    const savedKey = sessionStorage.getItem('GREENFC_API_KEY');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleApiKeyComplete = (key: string) => {
    setApiKey(key);
    sessionStorage.setItem('GREENFC_API_KEY', key);
  };

  const handleLogout = () => {
    if (confirm("대시보드 세션을 종료하시겠습니까? (API 키가 초기화됩니다)")) {
      setApiKey(null);
      sessionStorage.removeItem('GREENFC_API_KEY');
      setMode(SelectionMode.IDLE);
      setResult(null);
      setSelectedId(null);
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
    if (mode !== SelectionMode.IDLE || !apiKey) return;
    
    setMode(SelectionMode.AI_THINKING);
    try {
      const response = await getGeminiRecommendation(weatherInput || "오늘 훈련 고생 많으셨습니다!", apiKey);
      const found = MENU_ITEMS.find(m => m.name === response.menuName) || MENU_ITEMS[0];
      setSelectedId(found.id);
      setResult({ item: found, reason: response.reason, isAi: true });
      setMode(SelectionMode.RESULT);
    } catch (err) {
      console.error("Recommendation Error:", err);
      setMode(SelectionMode.IDLE);
      alert("AI 코치와의 연결에 문제가 발생했습니다. 키 유효성을 확인해 주세요.");
    }
  };

  const startRandomPick = () => {
    if (mode !== SelectionMode.IDLE) return;

    setMode(SelectionMode.RANDOM_SPINNING);
    let count = 0;
    const interval = window.setInterval(() => {
      setSelectedId(MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)].id);
      count++;
      if (count > 15) {
        clearInterval(interval);
        const final = MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)];
        setSelectedId(final.id);
        setResult({ item: final, reason: "행운의 랜덤 선택 결과입니다! 선수들과 즐거운 점심 되세요.", isAi: false });
        setMode(SelectionMode.RESULT);
      }
    }, 100);
  };

  const total: number = Object.keys(orderCounts).reduce((acc: number, key: string) => acc + (orderCounts[key] || 0), 0);

  // [보안 게이트웨이] API 키 인증 전에는 무조건 ApiKeySetup 렌더링
  if (!apiKey) {
    return <ApiKeySetup onComplete={handleApiKeyComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row animate-in fade-in duration-700">
      
      {/* Sidebar Dashboard */}
      <aside className="w-full lg:w-[450px] bg-white border-r border-gray-100 flex flex-col h-screen lg:sticky lg:top-0 z-40 shadow-2xl overflow-y-auto">
        {/* Profile Section */}
        <div className="p-10 bg-green-600 text-white lg:rounded-br-[4rem] shadow-lg shrink-0">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="bg-white text-green-600 p-3 rounded-2xl shadow-xl animate-pulse-fast">
                <Trophy size={32} fill="currentColor" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter">Green FC</h1>
                <p className="text-[10px] font-bold opacity-70 tracking-widest uppercase">Management Portal</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-3 bg-white/10 hover:bg-red-500 rounded-2xl transition-all shadow-inner group"
              title="세션 로그아웃"
            >
              <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* AI Control Box */}
          <div className="bg-green-700/40 p-6 rounded-[2.5rem] border border-green-500/30 backdrop-blur-md shadow-inner">
            <div className="flex items-center gap-2 mb-4 text-green-200 text-xs font-black uppercase tracking-tighter">
              <CloudSun size={16} /> AI 영양 코치 실시간 분석
            </div>
            <textarea
              placeholder="예: 비가 와서 훈련이 일찍 끝났어요."
              className="w-full bg-green-800/40 border border-green-500/30 rounded-2xl p-5 text-lg text-white placeholder:text-green-300/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all h-32 resize-none"
              value={weatherInput}
              onChange={(e) => setWeatherInput(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button 
                onClick={startRandomPick} 
                disabled={mode !== SelectionMode.IDLE}
                className="bg-white/10 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 border border-white/10 hover:bg-white/20 transition-all disabled:opacity-50"
              >
                <Dices size={20} /> 랜덤 픽
              </button>
              <button 
                onClick={startAiRecommendation} 
                disabled={mode !== SelectionMode.IDLE}
                className="bg-white text-green-700 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:bg-green-50 transition-all disabled:opacity-50"
              >
                {mode === SelectionMode.AI_THINKING ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-700 border-t-transparent" />
                ) : (
                  <><Zap size={20} fill="currentColor" /> AI 분석 추천</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Orders Aggregation */}
        <div className="p-10 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <Receipt size={24} className="text-green-600" /> 실시간 주문 현황
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
              <p className="text-gray-400 font-bold leading-relaxed">주문 대기 중입니다.</p>
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
                    <span className="bg-green-50 text-green-700 min-w-14 h-14 px-4 flex items-center justify-center rounded-2xl font-black text-2xl shadow-inner">
                      {count}
                    </span>
                  </div>
                );
              })}
              <div className="pt-10 mt-6 border-t-4 border-double border-gray-100 flex items-center justify-between">
                <span className="text-gray-400 font-black text-xl tracking-tight uppercase">TOTAL MEALS</span>
                <span className="text-6xl font-black text-green-600 tracking-tighter">{total}<small className="text-xl ml-2 text-gray-400 font-bold tracking-normal">인분</small></span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Grid Content */}
      <main className="flex-1 p-10 lg:p-20 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <header className="mb-20">
            <div className="inline-flex items-center gap-3 bg-green-50 text-green-600 px-6 py-2 rounded-full text-sm font-black mb-6 border border-green-100 shadow-sm">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              Green FC Recovery Session
            </div>
            <h2 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter leading-[0.9] mb-4">
              최고의 선수,<br/>
              <span className="text-green-600 underline decoration-green-100 decoration-8 underline-offset-12">최고의 식단</span>
            </h2>
            <p className="text-gray-400 text-xl font-medium tracking-tight">운동 직후 근회복과 영양 밸런스를 위한 최적의 메뉴를 선택하세요.</p>
          </header>

          <MenuGrid 
            onIncrement={(i) => updateCount(i.id, 1)}
            onDecrement={(i) => updateCount(i.id, -1)}
            selectedId={selectedId}
            counts={orderCounts}
          />

          {/* Bottom Info Section */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-gray-900 rounded-[4rem] p-14 text-white relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-1000" />
              <h3 className="text-3xl font-black mb-6 flex items-center gap-4">
                <Users size={32} className="text-green-400" /> 팀 리커버리 가이드
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed font-medium">
                그린FC 영양 코칭 스태프는 강도 높은 훈련 후 손실된 나트륨과 전해질 보충을 위해 따뜻한 찌개 및 해장국류 섭취를 강력히 권장합니다.
              </p>
            </div>
            <div className="bg-white rounded-[4rem] p-14 border border-gray-100 shadow-xl flex items-center gap-10">
              <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-[2.5rem] flex items-center justify-center shrink-0 shadow-inner">
                <Info size={44} />
              </div>
              <div>
                <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">영양 정보</h3>
                <p className="text-gray-500 font-medium text-lg leading-relaxed">
                  찌개 속의 단백질과 따뜻한 국물은 근육 긴장 완화와 소화 흡수율을 높여 다음 훈련 준비를 돕습니다.
                </p>
              </div>
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
            setSelectedId(null);
            setResult(null);
          }}
          onAddToOrder={() => updateCount(result.item.id, 1)}
          isAiRecommended={!!result.isAi}
        />
      )}
    </div>
  );
};

export default App;
