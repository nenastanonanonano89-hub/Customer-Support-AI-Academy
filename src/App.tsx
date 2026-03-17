import { useState, ReactNode, useEffect } from 'react';
import { LayoutDashboard, MessageSquare, History, Settings, User, BookOpen, Globe } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Scenarios from './components/Scenarios';
import Simulator from './components/Simulator';
import { Scenario } from './types';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ru', name: 'Русский' },
  { code: 'pt', name: 'Português' },
  { code: 'ja', name: '日本語' },
];

export default function App() {
  const { t, i18n } = useTranslation();
  const [currentView, setCurrentView] = useState<'dashboard' | 'scenarios' | 'simulator'>('dashboard');
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const handleStartScenario = (scenario: Scenario) => {
    setActiveScenario(scenario);
    setCurrentView('simulator');
  };

  const handleEndSimulation = () => {
    setActiveScenario(null);
    setCurrentView('scenarios');
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-e border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 text-indigo-600 font-bold text-xl">
            <BookOpen className="w-6 h-6" />
            <span>{t('nav.title')}</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavItem icon={<LayoutDashboard />} label={t('nav.dashboard')} active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
          <NavItem icon={<MessageSquare />} label={t('nav.scenarios')} active={currentView === 'scenarios' || currentView === 'simulator'} onClick={() => setCurrentView('scenarios')} />
          <NavItem icon={<History />} label={t('nav.history')} active={false} onClick={() => {}} />
          <NavItem icon={<Settings />} label={t('nav.settings')} active={false} onClick={() => {}} />
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Globe className="w-4 h-4 text-slate-500" />
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-medium">{t('nav.agent')}</div>
              <div className="text-xs text-slate-500">{t('nav.level')}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {currentView === 'dashboard' && <Dashboard onNavigate={() => setCurrentView('scenarios')} />}
        {currentView === 'scenarios' && <Scenarios onStart={handleStartScenario} />}
        {currentView === 'simulator' && activeScenario && <Simulator scenario={activeScenario} onEnd={handleEndSimulation} />}
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
        active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
