import { Scenario } from '../types';
import { MessageSquare, Signal, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Scenarios({ onStart }: { onStart: (s: Scenario) => void }) {
  const { t } = useTranslation();
  
  const items = t('scenarios.items', { returnObjects: true }) as Record<string, any>;
  const scenariosList: Scenario[] = Object.keys(items).map((id) => ({
    id,
    title: items[id].title,
    description: items[id].description,
    difficulty: items[id].difficulty,
    customerPersona: items[id].customerPersona,
    customerMood: items[id].customerMood,
    issue: items[id].issue,
    initialMessage: items[id].initialMessage
  }));

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{t('scenarios.title')}</h1>
          <p className="text-slate-500 mt-1">{t('scenarios.subtitle')}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenariosList.map(scenario => (
            <ScenarioCard key={scenario.id} scenario={scenario} onStart={() => onStart(scenario)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ScenarioCard({ scenario, onStart }: { key?: string, scenario: Scenario, onStart: () => void }) {
  const { t } = useTranslation();
  let diffColor = 'text-emerald-600 bg-emerald-50';
  if (scenario.difficulty === 'Intermediate' || (scenario.difficulty as string) === 'متوسط') diffColor = 'text-amber-600 bg-amber-50';
  if (scenario.difficulty === 'Advanced' || (scenario.difficulty as string) === 'متقدم') diffColor = 'text-red-600 bg-red-50';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${diffColor}`}>
          <Signal className="w-3 h-3" />
          {scenario.difficulty}
        </div>
        <div className="text-xs font-medium text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {t('scenarios.mins')}
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-slate-900 mb-2">{scenario.title}</h3>
      <p className="text-slate-500 text-sm mb-6 flex-1">{scenario.description}</p>
      
      <div className="bg-slate-50 p-3 rounded-lg mb-6">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{t('scenarios.mood')}</div>
        <div className="font-medium text-slate-900">{scenario.customerMood}</div>
      </div>
      
      <button 
        onClick={onStart}
        className="w-full py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        <MessageSquare className="w-4 h-4" />
        {t('scenarios.start')}
      </button>
    </div>
  );
}
