import { ReactNode } from 'react';
import { Play, TrendingUp, Award, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Dashboard({ onNavigate }: { onNavigate: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{t('dashboard.welcome')}</h1>
          <p className="text-slate-500 mt-1">{t('dashboard.ready')}</p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard icon={<Play className="w-5 h-5 text-indigo-600" />} label={t('dashboard.completed')} value="12" />
          <StatCard icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} label={t('dashboard.avgScore')} value="84/100" />
          <StatCard icon={<Clock className="w-5 h-5 text-amber-600" />} label={t('dashboard.hours')} value="4.5h" />
        </div>

        {/* Next Recommended */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">{t('dashboard.recommended')}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">{t('dashboard.deescalation')}</h3>
            <p className="text-slate-500 mt-1 max-w-xl">{t('dashboard.deescalationDesc')}</p>
          </div>
          <button 
            onClick={onNavigate}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
          >
            {t('dashboard.start')}
          </button>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4">{t('dashboard.recent')}</h3>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-start">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-start">{t('dashboard.scenario')}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-start">{t('dashboard.date')}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-start">{t('dashboard.score')}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-start">{t('dashboard.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <ActivityRow scenario={t('scenarios.items.3.title')} date={t('dashboard.today')} score={88} status={t('dashboard.passed')} />
                <ActivityRow scenario={t('scenarios.items.2.title')} date={t('dashboard.yesterday')} score={95} status={t('dashboard.excellent')} />
                <ActivityRow scenario={t('scenarios.items.1.title')} date={t('dashboard.date1')} score={65} status={t('dashboard.needsReview')} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode, label: string, value: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium text-slate-500">{label}</div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
      </div>
    </div>
  );
}

function ActivityRow({ scenario, date, score, status }: { scenario: string, date: string, score: number, status: string }) {
  let statusColor = 'text-emerald-600 bg-emerald-50';
  if (score < 70) statusColor = 'text-amber-600 bg-amber-50';

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4 font-medium text-slate-900">{scenario}</td>
      <td className="px-6 py-4 text-slate-500 text-sm">{date}</td>
      <td className="px-6 py-4 font-semibold text-slate-900">{score}/100</td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {status}
        </span>
      </td>
    </tr>
  );
}
