
import React, { useState } from 'react';
import { Key, ShieldCheck, Trophy, Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface ApiKeySetupProps {
  onComplete: (key: string) => void;
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onComplete }) => {
  const [inputKey, setInputKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'validating' | 'error' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = async () => {
    if (!inputKey.trim()) {
      setErrorMsg('API 키를 입력해 주세요.');
      setStatus('error');
      return;
    }

    setStatus('validating');
    setErrorMsg('');

    try {
      const ai = new GoogleGenAI({ apiKey: inputKey.trim() });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "test",
        config: { maxOutputTokens: 1 }
      });

      if (response) {
        setStatus('success');
        setTimeout(() => onComplete(inputKey.trim()), 1000);
      }
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg('유효하지 않은 API 키입니다. 다시 확인해 주세요.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-green-950 flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-white rounded-[4rem] shadow-2xl max-w-2xl w-full p-10 md:p-20 text-center animate-in zoom-in duration-500 border border-green-800/20">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
          <Trophy size={48} fill="currentColor" />
        </div>
        
        <h1 className="text-4xl font-black text-gray-900 mb-6 tracking-tighter">
          그린FC 관리자 인증
        </h1>
        
        <p className="text-gray-500 mb-12 text-lg font-medium leading-relaxed">
          이 앱을 사용하려면 본인의 <strong className="text-green-600">Gemini API 키</strong>가 필요합니다. <br/>
          입력된 키는 브라우저에만 임시 저장됩니다.
        </p>

        <div className="space-y-6 text-left mb-12">
          <div className="relative">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-6 mb-2 block">
              Gemini API Key
            </label>
            <input
              type="password"
              placeholder="API 키를 입력하세요"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className={`w-full bg-gray-50 border-2 rounded-[2rem] px-10 py-6 text-xl focus:outline-none transition-all
                ${status === 'error' ? 'border-red-200 focus:border-red-500' : 'border-gray-100 focus:border-green-500'}
              `}
            />
            <Key className="absolute right-10 top-[3.2rem] text-gray-300" size={24} />
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-3 text-red-500 bg-red-50 p-5 rounded-3xl text-sm font-bold border border-red-100 animate-in slide-in-from-top-2">
              <AlertCircle size={20} />
              <span>{errorMsg}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-3 text-green-600 bg-green-50 p-5 rounded-3xl text-sm font-bold border border-green-100 animate-in slide-in-from-top-2">
              <CheckCircle2 size={20} />
              <span>인증 성공! 대시보드로 이동합니다.</span>
            </div>
          )}

          <div className="bg-gray-50 p-6 rounded-[2rem] flex gap-4 items-start border border-gray-100">
            <ShieldCheck className="text-green-500 mt-1 shrink-0" size={24} />
            <p className="text-xs text-gray-400 font-bold leading-relaxed">
              사용자의 보안을 위해 입력된 키는 외부 서버에 저장되지 않으며 실시간 API 호출에만 사용됩니다.
            </p>
          </div>
        </div>

        <button
          onClick={handleVerify}
          disabled={status === 'validating' || status === 'success'}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white font-black py-6 rounded-[2.5rem] text-2xl shadow-2xl shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-4 group"
        >
          {status === 'validating' ? (
            <Loader2 className="animate-spin" size={28} />
          ) : (
            <>
              인증 및 시작하기
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </>
          )}
        </button>

        <a 
          href="https://aistudio.google.com/app/apikey" 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-8 inline-block text-xs font-bold text-gray-400 hover:text-green-600 transition-colors underline underline-offset-4"
        >
          API 키가 없으신가요? 여기서 무료로 받기
        </a>
      </div>
    </div>
  );
};
