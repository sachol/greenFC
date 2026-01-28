
import React, { useState } from 'react';
import { Key, ShieldCheck, Trophy, Loader2, AlertCircle, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';
import { validateApiKey } from '../services/geminiService';

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

    const isValid = await validateApiKey(inputKey.trim());

    if (isValid) {
      setStatus('success');
      // 성공 피드백을 위해 약간의 지연 후 대시보드 진입
      setTimeout(() => onComplete(inputKey.trim()), 1000);
    } else {
      setStatus('error');
      setErrorMsg('유효하지 않은 API 키입니다. 다시 확인해 주세요.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-green-950 flex items-center justify-center p-6 overflow-y-auto">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-green-500 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-green-400 rounded-full blur-[120px]" />
      </div>

      <div className="bg-white rounded-[4rem] shadow-2xl max-w-2xl w-full p-10 md:p-20 text-center animate-in zoom-in duration-500 relative z-10 border border-green-800/10">
        <div className="w-24 h-24 bg-green-600 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl animate-bounce-slow">
          <Trophy size={48} fill="currentColor" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tighter">
          그린FC 관리자 포털
        </h1>
        
        <p className="text-gray-500 mb-12 text-lg font-medium leading-relaxed">
          대시보드 운영 및 AI 코치 활성화를 위해 <br/>
          <strong className="text-green-600">Gemini API 키</strong> 인증이 필요합니다.
        </p>

        <div className="space-y-6 text-left mb-12">
          <div className="relative group">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-6 mb-2 block">
              Gemini API Key Authentication
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="API 키를 여기에 붙여넣으세요"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                className={`w-full bg-gray-50 border-2 rounded-[2rem] px-12 py-6 text-xl focus:outline-none transition-all
                  ${status === 'error' ? 'border-red-200 focus:border-red-500 bg-red-50/30' : 'border-gray-100 focus:border-green-600'}
                `}
              />
              <Key className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${status === 'error' ? 'text-red-400' : 'text-gray-300'}`} size={20} />
            </div>
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-3 text-red-500 bg-red-50 p-5 rounded-3xl text-sm font-bold border border-red-100 animate-in slide-in-from-top-2">
              <AlertCircle size={20} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-3 text-green-600 bg-green-50 p-5 rounded-3xl text-sm font-bold border border-green-100 animate-in slide-in-from-top-2">
              <CheckCircle2 size={20} className="shrink-0" />
              <span>인증 성공! 대시보드를 활성화합니다.</span>
            </div>
          )}

          <div className="bg-gray-50 p-6 rounded-[2rem] flex gap-4 items-center border border-gray-100">
            <ShieldCheck className="text-green-500 shrink-0" size={24} />
            <p className="text-[11px] text-gray-400 font-bold leading-tight">
              입력된 데이터는 브라우저의 로컬 세션에만 임시 보관되며, <br/>
              외부 서버로 절대 전송되지 않습니다.
            </p>
          </div>
        </div>

        <button
          onClick={handleVerify}
          disabled={status === 'validating' || status === 'success'}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white font-black py-6 rounded-[2.5rem] text-2xl shadow-2xl shadow-green-200 transition-all active:scale-[0.98] flex items-center justify-center gap-4 group"
        >
          {status === 'validating' ? (
            <div className="flex items-center gap-3">
              <Loader2 className="animate-spin" size={28} />
              <span>연결 확인 중...</span>
            </div>
          ) : (
            <>
              인증 및 대시보드 진입
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </>
          )}
        </button>

        <a 
          href="https://aistudio.google.com/app/apikey" 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-green-600 transition-colors underline underline-offset-4"
        >
          API 키 발급받기 (무료) <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
};
