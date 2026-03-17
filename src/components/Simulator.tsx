import { useState, useEffect, useRef } from 'react';
import { Scenario, Message } from '../types';
import { Send, User, Bot, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function Simulator({ scenario, onEnd }: { scenario: Scenario, onEnd: () => void }) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat
    const initChat = async () => {
      const systemInstruction = `You are a customer interacting with a customer support agent.
Roleplay as the following persona: ${scenario.customerPersona}
Your current mood is: ${scenario.customerMood}
The issue you are facing is: ${scenario.issue}

Guidelines:
1. Stay in character at all times. Do not break the fourth wall.
2. Keep your responses relatively concise (1-3 sentences), like a real chat.
3. React naturally to the support agent's empathy, solutions, or lack thereof.
4. If the agent solves the problem well, your mood can improve. If they are unhelpful, get more frustrated.
5. IMPORTANT: You MUST communicate entirely in the language code: ${i18n.language}.`;

      const chat = ai.chats.create({
        model: 'gemini-3.1-flash-preview',
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });
      
      setChatSession(chat);
      
      setMessages([
        {
          id: Date.now().toString(),
          role: 'model',
          text: scenario.initialMessage,
          timestamp: new Date()
        }
      ]);
    };

    initChat();
  }, [scenario, i18n.language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatSession.sendMessage({ message: userMsg.text });
      
      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: t('simulator.error'),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    
    const transcript = messages.map(m => `${m.role === 'user' ? 'Agent' : 'Customer'}: ${m.text}`).join('\n');
    
    const prompt = `Evaluate the following customer support chat transcript.
Scenario: ${scenario.title} - ${scenario.issue}

Transcript:
${transcript}

Provide a JSON evaluation with the following structure (Keep the JSON keys exactly as shown, but you can write the values for 'strengths', 'areasForImprovement', and 'overallFeedback' in the language code: ${i18n.language}):
{
  "score": number (0-100),
  "empathyScore": number (0-100),
  "resolutionScore": number (0-100),
  "professionalismScore": number (0-100),
  "strengths": ["strength 1", "strength 2"],
  "areasForImprovement": ["area 1", "area 2"],
  "overallFeedback": "detailed paragraph of feedback"
}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });
      
      if (response.text) {
        const evalData = JSON.parse(response.text);
        setEvaluation(evalData);
      }
    } catch (error) {
      console.error("Evaluation failed:", error);
      // Fallback evaluation if API fails
      setEvaluation({
        score: 0,
        empathyScore: 0,
        resolutionScore: 0,
        professionalismScore: 0,
        strengths: ["Attempted to help the customer"],
        areasForImprovement: ["Evaluation service failed to respond"],
        overallFeedback: t('simulator.evalError')
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  if (evaluation) {
    return (
      <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <button onClick={onEnd} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4 me-2" /> {t('simulator.back')}
          </button>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">{t('simulator.evaluation')}</h2>
              <p className="text-slate-500">{scenario.title}</p>
            </div>
            
            <div className="flex justify-center mb-10">
              <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-indigo-100">
                <div className="absolute inset-0 rounded-full border-8 border-indigo-600" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${evaluation.score}%, 0 ${evaluation.score}%)` }}></div>
                <span className="text-4xl font-bold text-indigo-700">{evaluation.score}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <ScoreCard title={t('simulator.empathy')} score={evaluation.empathyScore} />
              <ScoreCard title={t('simulator.resolution')} score={evaluation.resolutionScore} />
              <ScoreCard title={t('simulator.professionalism')} score={evaluation.professionalismScore} />
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" /> {t('simulator.strengths')}
                </h3>
                <ul className="list-disc ps-5 space-y-1 text-slate-700">
                  {evaluation.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" /> {t('simulator.areas')}
                </h3>
                <ul className="list-disc ps-5 space-y-1 text-slate-700">
                  {evaluation.areasForImprovement.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">{t('simulator.feedback')}</h3>
                <p className="text-slate-700 leading-relaxed">{evaluation.overallFeedback}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-white shadow-sm z-10">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{scenario.title}</h2>
          <p className="text-sm text-slate-500">{t('scenarios.mood')}: <span className="font-medium text-amber-600">{scenario.customerMood}</span></p>
        </div>
        <button 
          onClick={handleEvaluate}
          disabled={messages.length < 3 || isEvaluating}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isEvaluating ? t('simulator.evaluating') : t('simulator.end')}
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-se-none' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-ss-none shadow-sm'
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <span className={`text-[10px] mt-1 block ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 rounded-ss-none shadow-sm flex items-center gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t('simulator.placeholder')}
            className="w-full ps-4 pe-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-14"
            disabled={isTyping || isEvaluating}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping || isEvaluating}
            className="absolute end-2 top-2 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="max-w-3xl mx-auto mt-2 text-center">
          <p className="text-xs text-slate-400">{t('simulator.hint')}</p>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ title, score }: { title: string, score: number }) {
  let colorClass = 'text-emerald-600';
  if (score < 70) colorClass = 'text-amber-600';
  if (score < 50) colorClass = 'text-red-600';

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
      <div className="text-sm font-medium text-slate-500 mb-1">{title}</div>
      <div className={`text-2xl font-bold ${colorClass}`}>{score}/100</div>
    </div>
  );
}
