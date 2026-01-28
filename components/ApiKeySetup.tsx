
import React, { useState } from 'react';
import { Key, ShieldCheck, ExternalLink, Trophy, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface ApiKeySetupProps {
  onComplete: (key: string) => void;
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onComplete }) => {
  const [inputKey, setInputKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'validating' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateAndStart = async () => {
    if (!inputKey.trim()) {
      setErrorMessage('API 키를 입력해주세요.');
      setStatus('error');
      return;
    }

    setStatus('validating');
    setErrorMessage('');

    try {
      // API 유효성 검증을 위해 간단한 테스트 호출 실행
      const ai = new GoogleGenAI({ apiKey: inputKey.trim() });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "hi",
        config: { maxOutputTokens: 5 }
      });

      if (response.text) {
        setStatus('success');
        setTimeout(() => {
          onComplete(inputKey.trim());
        }, 800);
      }
    } catch (error: any) {
      console.error("Validation failed", error);
      setStatus('error');
      setErrorMessage('유효하지 않은 API 키입니다. 다시 확인해주세요.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-green-600 to-green-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-[3rem] shadow-2xl max-w-xl w-full p-10 md:p-16 text-center animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
          <Trophy size={48} fill="currentColor" />
        </div>
        
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">
          그린FC 코치 인증
        </h1>
        
        <p className="text-gray-500 mb-10 font-medium leading-relaxed">
          Vercel 배포 버전입니다. 안전한 이용을 위해<br/>
          코치님의 개인 Gemini API 키를 입력해 주세요.
        </p>

        <div className="space-y-6 mb-10">
          <div className="relative">
            <input
              type="password"
              placeholder="Google Gemini API Key를 입력하세요"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className={`w-full bg-gray-50 border-2 rounded-[2rem] px-8 py-5 text-lg focus:outline-none transition-all
                ${status === 'error' ? 'border-red-200 focus:border-red-500' : 'border-gray-100 focus:border-green-500'}
              `}
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300">
              <Key size={24} />
            </div>
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-500 bg-red-50 px-6 py-3 rounded-2xl text-sm font-bold animate-in slide-in-from-top-2">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-6 py-3 rounded-2xl text-sm font-bold animate-in slide-in-from-top-2">
              <CheckCircle2 size={18} />
              <span>인증 성공! 잠시 후 앱을 시작합니다.</span>
            </div>
          )}

          <div className="flex items-start gap-4 text-left bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <ShieldCheck className="text-green-500 shrink-0 mt-1" size={24} />
            <div className="text-xs text-gray-400 font-medium leading-relaxed">
              코치님의 키는 서버에 저장되지 않으며 오직 현재 브라우저의 메모리상에서만 작동합니다. 보안상 매우 안전합니다.
            </div>
          </div>
          
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-blue-500 font-bold hover:underline text-sm"
          >
            <span>API 키가 없으신가요? 여기서 생성하기</span>
            <ExternalLink size={14} />
          </a>
        </div>

        <button
          onClick={validateAndStart}
          disabled={status === 'validating' || status === 'success'}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white font-black py-5 rounded-[2rem] text-xl shadow-xl shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          {status === 'validating' ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              유효성 검증 중...
            </>
          ) : (
            <>
              인증 및 앱 시작하기
            </>
          )}
        </button>
      </div>
    </div>
  );
};
