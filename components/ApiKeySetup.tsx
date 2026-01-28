
import React from 'react';
import { Key, ShieldCheck, ExternalLink, Trophy } from 'lucide-react';

interface ApiKeySetupProps {
  onComplete: () => void;
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onComplete }) => {
  const handleOpenKeySelector = async () => {
    try {
      if (window.aistudio && window.aistudio.openSelectKey) {
        await window.aistudio.openSelectKey();
        // 키 선택 후 즉시 메인 앱으로 진입
        onComplete();
      }
    } catch (error) {
      console.error("API Key selection failed", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-green-600 to-green-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full p-10 md:p-16 text-center animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
          <Trophy size={48} fill="currentColor" />
        </div>
        
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">
          그린FC 코치 전용<br/>서비스 시작하기
        </h1>
        
        <p className="text-gray-500 mb-10 font-medium leading-relaxed">
          이 서비스는 AI 기능을 위해 구글 Gemini API 키가 필요합니다.<br/>
          코치님의 API 키를 연결하여 점심 선정을 시작하세요.
        </p>

        <div className="space-y-4 mb-10">
          <div className="flex items-start gap-4 text-left bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <ShieldCheck className="text-green-500 shrink-0 mt-1" size={24} />
            <div>
              <p className="font-black text-gray-800 text-sm">보안 안전성</p>
              <p className="text-xs text-gray-400 font-medium">코치님의 키는 안전하게 관리되며 서비스 운영에만 사용됩니다.</p>
            </div>
          </div>
          
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between text-blue-500 bg-blue-50 px-5 py-3 rounded-2xl text-xs font-bold hover:bg-blue-100 transition-colors"
          >
            <span>유료 프로젝트 API 키 생성 안내</span>
            <ExternalLink size={14} />
          </a>
        </div>

        <button
          onClick={handleOpenKeySelector}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-5 rounded-[2rem] text-xl shadow-xl shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <Key size={24} />
          API 키 연결하기
        </button>
      </div>
    </div>
  );
};
