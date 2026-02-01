
import React, { useState, useEffect } from 'react';
import { Language, Level, Question, Step, QuizState, QuizHistoryEntry } from './types';
import { generateQuizQuestions } from './services/gemini';
import { 
  ChevronRight, Volume2, RefreshCcw, CheckCircle, 
  XCircle, Loader2, Trophy, MessageSquare, ArrowLeft, Home, 
  History, BookOpen, Trash2, Sparkles, Globe, ArrowRight
} from 'lucide-react';

const LANGUAGES: Language[] = [
  'English', 'Russian', 'German', 'French', 'Spanish', 
  'Turkish', 'Arabic', 'Korean', 'Japanese', 'Chinese'
];
const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2'];
const UNITS = Array.from({ length: 12 }, (_, i) => i + 1);

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('START');
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);
  const [quiz, setQuiz] = useState<QuizState>({
    languages: [], level: null, unit: null, questions: [],
    currentIndex: 0, score: 0, isComplete: false, userAnswers: []
  });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('istanbul_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('istanbul_history', JSON.stringify(history));
  }, [history]);

  // TTS Funksiyasi
  const speak = (text: string, langName: string = 'Turkish') => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Til kodlarini xaritasi
    const langMap: Record<string, string> = {
      'English': 'en-US', 'Russian': 'ru-RU', 'Turkish': 'tr-TR',
      'German': 'de-DE', 'French': 'fr-FR', 'Spanish': 'es-ES',
      'Arabic': 'ar-SA', 'Korean': 'ko-KR', 'Japanese': 'ja-JP', 'Chinese': 'zh-CN'
    };
    
    utterance.lang = langMap[langName] || 'tr-TR';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const startQuiz = async () => {
    setError(null);
    setStep('LOADING');
    try {
      const q = await generateQuizQuestions(quiz.languages, quiz.level!, quiz.unit!);
      if (!q || q.length === 0) throw new Error("Savollar topilmadi");
      setQuiz(prev => ({ ...prev, questions: q, currentIndex: 0, score: 0 }));
      setStep('QUIZ');
    } catch (e) {
      console.error(e);
      setError("AI'dan javob olishda xatolik. Iltimos, qaytadan urinib ko'ring.");
      setStep('UNIT_SELECT');
    }
  };

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
    
    const currentQuestion = quiz.questions[quiz.currentIndex];
    // To'g'ri javobni avtomatik o'qish
    speak(currentQuestion.options[currentQuestion.correctIndex].text, quiz.languages[0]);

    if (idx === currentQuestion.correctIndex) {
      setQuiz(prev => ({ ...prev, score: prev.score + 1 }));
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    } else {
      if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    if (quiz.currentIndex + 1 < quiz.questions.length) {
      setQuiz(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
    } else {
      const entry: QuizHistoryEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        languages: quiz.languages,
        level: quiz.level!,
        unit: quiz.unit!,
        score: quiz.score,
        total: quiz.questions.length
      };
      setHistory(prev => [entry, ...prev]);
      setStep('RESULTS');
    }
  };

  const clearHistory = () => {
    if (confirm("Natijalarni o'chirmoqchimisiz?")) {
      setHistory([]);
      localStorage.removeItem('istanbul_history');
    }
  };

  const BotMsg = ({ children }: { children: React.ReactNode }) => (
    <div className="flex gap-2 mb-4 animate-in fade-in slide-in-from-left-2 duration-300">
      <div className="w-8 h-8 rounded-full telegram-blue flex items-center justify-center text-white shrink-0 shadow-lg border-2 border-white/20">
        <Sparkles size={16} />
      </div>
      <div className="bg-white p-4 chat-bubble-ai shadow-sm text-sm text-slate-800 border border-gray-100 max-w-[85%] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-1 opacity-5">
          <Globe size={40} />
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div className="h-screen max-w-lg mx-auto flex flex-col relative bg-[#f0f2f5] overflow-hidden">
      {/* Header */}
      <header className="telegram-blue text-white p-4 flex items-center justify-between shadow-md z-50">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl">
            <BookOpen size={20} className="animate-pulse" />
          </div>
          <div>
            <h1 className="font-black text-base leading-tight">Istanbul Poliglot</h1>
            <p className="text-[9px] opacity-70 uppercase font-black tracking-widest">AI Core • TTS Enabled</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {step !== 'START' && (
            <button onClick={() => setStep('START')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Home size={20}/>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar pb-20">
        {step === 'START' && (
          <div className="space-y-6">
            <BotMsg>
              <p className="font-black text-blue-600 text-base mb-1">Xush kelibsiz! 👋</p>
              Ushbu bot orqali har bir so'zning talaffuzini eshitib, o'z bilimingizni sinashingiz mumkin.
            </BotMsg>

            <button 
              onClick={() => setStep('LANG_SELECT')} 
              className="w-full py-6 telegram-blue text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-blue-700"
            >
              DAVOM ETISH <ChevronRight size={24} />
            </button>

            {history.length > 0 && (
              <div className="bg-white/70 backdrop-blur-sm p-5 rounded-[2rem] border border-white shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[11px] font-black uppercase text-gray-400 flex items-center gap-2">
                    <History size={14}/> Tarix
                  </p>
                  <button onClick={clearHistory} className="text-red-400 hover:text-red-600">
                    <Trash2 size={16}/>
                  </button>
                </div>
                <div className="space-y-3">
                  {history.slice(0, 3).map(h => (
                    <div key={h.id} className="bg-white p-3 rounded-2xl flex justify-between items-center shadow-sm border border-gray-50">
                      <span className="text-xs font-black text-slate-700">{h.level} • Unit {h.unit}</span>
                      <span className="text-blue-600 font-black text-lg">{h.score}/{h.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'LANG_SELECT' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <BotMsg>O'rganmoqchi bo'lgan tillaringizni belgilang:</BotMsg>
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map(l => (
                <button 
                  key={l} 
                  onClick={() => setQuiz(p => ({...p, languages: p.languages.includes(l) ? p.languages.filter(x=>x!==l) : [...p.languages, l]}))}
                  className={`p-5 rounded-3xl font-black text-sm transition-all border-2 flex items-center justify-between ${
                    quiz.languages.includes(l) 
                      ? 'border-blue-500 bg-blue-50 text-blue-600' 
                      : 'bg-white border-transparent text-slate-600 shadow-sm'
                  }`}
                >
                  {l}
                  {quiz.languages.includes(l) && <CheckCircle size={16} fill="currentColor" className="text-white" />}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep('START')} className="flex-1 py-4 bg-gray-200 text-slate-600 rounded-2xl font-black uppercase text-xs">Orqaga</button>
              <button 
                disabled={quiz.languages.length === 0}
                onClick={() => setStep('LEVEL_SELECT')} 
                className={`flex-[2] py-4 rounded-2xl font-black text-white shadow-lg ${quiz.languages.length > 0 ? 'bg-blue-600' : 'bg-gray-300 opacity-50'}`}
              >
                TASDIQLASH
              </button>
            </div>
          </div>
        )}

        {step === 'LEVEL_SELECT' && (
          <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-4">
            {LEVELS.map(l => (
              <button 
                key={l} 
                onClick={() => {setQuiz(p=>({...p, level:l})); setStep('UNIT_SELECT');}} 
                className="p-12 bg-white rounded-[2.5rem] font-black text-4xl text-slate-700 shadow-sm border-2 border-transparent hover:border-blue-200 active:scale-95"
              >
                {l}
              </button>
            ))}
          </div>
        )}

        {step === 'UNIT_SELECT' && (
          <div className="animate-in slide-in-from-bottom-4">
            <BotMsg>Qaysi Unitni takrorlaymiz?</BotMsg>
            <div className="grid grid-cols-4 gap-3">
              {UNITS.map(u => (
                <button 
                  key={u} 
                  onClick={() => setQuiz(p=>({...p, unit:u}))}
                  className={`p-4 rounded-2xl font-black text-lg transition-all ${
                    quiz.unit === u ? 'telegram-blue text-white shadow-lg' : 'bg-white text-slate-600'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
            {quiz.unit && (
              <button onClick={startQuiz} className="w-full mt-8 py-5 bg-green-500 text-white rounded-3xl font-black shadow-lg border-b-4 border-green-700">
                QUIZNI BOSHLASH 🚀
              </button>
            )}
          </div>
        )}

        {step === 'LOADING' && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={64} />
            <p className="font-black text-slate-600">AI savollarni tayyorlayapti...</p>
          </div>
        )}

        {step === 'QUIZ' && quiz.questions.length > 0 && (
          <div className="space-y-4 animate-in fade-in">
            {/* Progress Bar */}
            <div className="bg-white/80 p-4 rounded-3xl shadow-sm flex items-center justify-between border border-white">
              <span className="text-[10px] font-black text-slate-400 uppercase">Savol {quiz.currentIndex + 1}/{quiz.questions.length}</span>
              <div className="flex items-center gap-2">
                <span className="text-green-600 font-black text-xl">{quiz.score}</span>
                <Trophy size={18} className="text-yellow-500" />
              </div>
            </div>

            {/* Question Card */}
            <BotMsg>
              <div className="flex justify-between items-center w-full">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Berilgan so'z:</span>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">"{quiz.questions[quiz.currentIndex].word}"</h2>
                </div>
                <div className="bg-blue-50 p-3 rounded-2xl text-blue-500">
                  <Globe size={24} />
                </div>
              </div>
            </BotMsg>

            {/* Options */}
            <div className="space-y-3">
              {quiz.questions[quiz.currentIndex].options.map((o, i) => (
                <div key={i} className="relative group">
                  <button 
                    disabled={selectedAnswer !== null} 
                    onClick={() => handleAnswer(i)}
                    className={`w-full p-5 pr-14 rounded-[2rem] text-left font-black transition-all border-2 flex items-center min-h-[70px] ${
                      selectedAnswer === null ? 'bg-white text-slate-900 border-transparent shadow-sm hover:border-blue-200' : 
                      i === quiz.questions[quiz.currentIndex].correctIndex ? 'bg-green-500 text-white border-green-600 shadow-lg' :
                      i === selectedAnswer ? 'bg-red-500 text-white border-red-600 shadow-lg' : 'bg-white text-slate-400 opacity-40'
                    }`}
                  >
                    <span className="flex-1">{o.text}</span>
                  </button>
                  
                  {/* Talaffuz tugmasi har bir variantda */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); speak(o.text, quiz.languages[0]); }}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                      selectedAnswer === null ? 'bg-slate-50 text-slate-400 hover:text-blue-500' : 'bg-white/20 text-white'
                    }`}
                  >
                    <Volume2 size={18}/>
                  </button>
                </div>
              ))}
            </div>

            {showExplanation && (
              <div className="p-6 bg-white rounded-[2rem] border border-blue-100 shadow-xl animate-in slide-in-from-bottom-4">
                <div className="flex items-center gap-2 text-blue-600 font-black mb-2 uppercase text-[11px]">
                  <MessageSquare size={16}/> Tushuntirish
                </div>
                <p className="text-sm text-slate-700 font-medium leading-relaxed mb-6">
                  {quiz.questions[quiz.currentIndex].explanation}
                </p>
                <button 
                  onClick={nextQuestion} 
                  className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 border-b-4 border-blue-800 active:translate-y-1 transition-all"
                >
                  KEYINGISI <ArrowRight size={20}/>
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'RESULTS' && (
          <div className="text-center py-10 space-y-6 animate-in zoom-in-95">
            <div className="w-32 h-32 bg-yellow-400 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl animate-bounce-subtle">
              <Trophy size={64} className="text-white" />
            </div>
            <h2 className="text-4xl font-black text-slate-800">Tamom! 🎊</h2>
            <div className="bg-white p-8 rounded-[3rem] shadow-sm flex flex-col items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase mb-2">Natijangiz</span>
              <span className="text-6xl font-black text-blue-600">{quiz.score} / {quiz.questions.length}</span>
            </div>
            <button 
              onClick={() => setStep('START')} 
              className="w-full py-6 telegram-blue text-white rounded-[2rem] font-black text-lg shadow-xl border-b-4 border-blue-800 active:scale-95 transition-all"
            >
              BOSH SAHIFAGA QAYTISH
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 bg-white/30 backdrop-blur-md text-[9px] text-center text-slate-400 font-black uppercase tracking-[0.3em] border-t border-white/20">
        Istanbul Poliglot AI Assistant • 2025
      </footer>
    </div>
  );
};

export default App;
