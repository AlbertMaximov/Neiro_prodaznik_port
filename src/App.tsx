import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ProfileDashboard } from './components/ProfileDashboard';
import { ChatInterface } from './components/ChatInterface';
import { CompanyProfile, Message, Solution, AppState } from './types';
import { INITIAL_PROFILE, KNOWLEDGE_BASE } from './constants';
import { getAIResponse } from './services/geminiService';

export default function App() {
  const [state, setState] = useState<AppState>({
    profile: INITIAL_PROFILE,
    messages: [],
    recommendedSolutions: [],
    isTyping: false,
    currentStep: 0,
  });

  const [nextStepLabel, setNextStepLabel] = useState("Установление контакта");

  // Initial greeting
  useEffect(() => {
    const initialGreeting = async () => {
      setState(prev => ({ ...prev, isTyping: true }));
      
      const response = await getAIResponse([], INITIAL_PROFILE);
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "model",
        text: response.text,
        timestamp: Date.now(),
      };

      setState(prev => ({
        ...prev,
        messages: [aiMessage],
        isTyping: false,
      }));
      setNextStepLabel(response.nextStep);
    };

    initialGreeting();
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text,
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true,
    }));

    const aiResponse = await getAIResponse([...state.messages, userMessage], state.profile);

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "model",
      text: aiResponse.text,
      timestamp: Date.now(),
    };

    setState(prev => {
      // Process profile updates using the most recent state
      const updatedProfile = { ...prev.profile };
      if (aiResponse.profileUpdate) {
        Object.keys(aiResponse.profileUpdate).forEach(key => {
          const val = aiResponse.profileUpdate[key as keyof CompanyProfile];
          if (val !== undefined && val !== null) {
            if (typeof val === 'object' && !Array.isArray(val)) {
              updatedProfile[key as keyof CompanyProfile] = {
                ...(updatedProfile[key as keyof CompanyProfile] as any),
                ...(val as any)
              };
            } else {
              updatedProfile[key as keyof CompanyProfile] = val as any;
            }
          }
        });
      }

      // Process recommended and confirmed solutions
      const allSolutions: Solution[] = Object.values(KNOWLEDGE_BASE).flat();
      const recommendedIds = aiResponse.recommendedSolutions || [];
      const confirmedIds = aiResponse.confirmedSolutions || [];
      
      const updatedSolutions = allSolutions.map(s => ({
        ...s,
        isRecommended: recommendedIds.includes(s.id),
        isConfirmed: confirmedIds.includes(s.id),
      }));

      return {
        ...prev,
        messages: [...prev.messages, aiMessage],
        profile: updatedProfile,
        recommendedSolutions: updatedSolutions,
        isTyping: false,
      };
    });

    setNextStepLabel(aiResponse.nextStep);
  }, [state.messages, state.profile]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-brand-light px-8 flex items-center justify-between bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-deep rounded-lg flex items-center justify-center text-white font-bold">Н</div>
          <h1 className="text-lg font-bold text-brand-deep tracking-tight uppercase">НЕЙРО-ПРОДАЖНИК <span className="text-brand-accent text-sm">(B2B УСЛУГИ ДЛЯ БИЗНЕСА)</span></h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-brand-deep/40 uppercase">Статус сделки:</span>
            <span className="text-xs font-bold text-brand-deep bg-brand-light px-3 py-1 rounded-full">{nextStepLabel}</span>
          </div>
          <button className="bg-brand-deep text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-deep/90 transition-all shadow-sm">
            Экспорт профиля
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden p-6 gap-6 max-w-[1600px] mx-auto w-full">
        {/* Left Column - Profile Dashboard (40%) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-[40%] glass-panel rounded-3xl p-6 flex flex-col overflow-hidden"
        >
          <ProfileDashboard profile={state.profile} solutions={state.recommendedSolutions} />
        </motion.div>

        {/* Right Column - Chat Interface (60%) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-[60%] flex flex-col overflow-hidden"
        >
          <ChatInterface 
            messages={state.messages} 
            isTyping={state.isTyping} 
            onSendMessage={handleSendMessage}
            nextStep={nextStepLabel}
          />
        </motion.div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-10 border-t border-brand-light bg-brand-light/20 px-8 flex items-center justify-between text-[10px] text-brand-deep/50 uppercase font-bold tracking-widest">
        <div className="flex gap-4">
          <span>ИИ-движок: Gemini 3 Flash</span>
          <span>•</span>
          <span>База знаний: Активна</span>
        </div>
        <div className="flex gap-4">
          <span>© 2026 НЕЙРО-ПРОДАЖНИК B2B</span>
        </div>
      </footer>
    </div>
  );
}
