import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Target, 
  UserCircle2, 
  CheckCircle2, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { CompanyProfile, Solution } from '../types';

interface ProfileDashboardProps {
  profile: CompanyProfile;
  solutions: Solution[];
}

const ProfileField = ({ label, value, icon: Icon, isUpdating }: { label: string, value: string | string[], icon: any, isUpdating?: boolean }) => {
  const displayValue = Array.isArray(value) ? value.join(', ') : value;
  const isEmpty = !displayValue || displayValue === "";

  return (
    <div className={`p-3 rounded-lg border border-brand-light transition-all duration-500 ${isUpdating ? 'profile-field-update' : ''}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className="text-brand-deep opacity-70" />
        <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-deep/60">{label}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-sm ${isEmpty ? 'text-brand-deep/30 italic' : 'text-brand-graphite font-medium'}`}>
          {isEmpty ? "AI анализирует..." : displayValue}
        </span>
        {!isEmpty && <CheckCircle2 size={14} className="text-brand-accent animate-in fade-in zoom-in" />}
      </div>
    </div>
  );
};

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ profile, solutions }) => {
  const confirmedSolutions = solutions.filter(s => s.isConfirmed);
  const recommendedSolutions = solutions.filter(s => s.isRecommended && !s.isConfirmed);

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="text-brand-deep" size={20} />
          <h2 className="text-lg font-bold text-brand-deep">Профиль компании</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <ProfileField label="Название" value={profile.name} icon={Building2} />
          <ProfileField label="Отрасль" value={profile.industry} icon={Building2} />
          <ProfileField label="Размер" value={profile.size} icon={Building2} />
          <ProfileField label="Регион" value={profile.region} icon={Building2} />
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Target className="text-brand-deep" size={20} />
          <h2 className="text-lg font-bold text-brand-deep">Бизнес-задачи</h2>
        </div>
        <ProfileField label="Цели и задачи" value={profile.tasks} icon={Target} />
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <UserCircle2 className="text-brand-deep" size={20} />
          <h2 className="text-lg font-bold text-brand-deep">Контакты</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ProfileField label="ФИО" value={profile.contacts.name} icon={UserCircle2} />
          <ProfileField label="Должность" value={profile.contacts.position} icon={UserCircle2} />
          <ProfileField label="Телефон" value={profile.contacts.phone} icon={UserCircle2} />
          <ProfileField label="Email" value={profile.contacts.email} icon={UserCircle2} />
        </div>
      </section>

      <section className="mt-auto pt-6 border-t border-brand-light">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-brand-accent" size={20} />
          <h2 className="text-lg font-bold text-brand-deep">Рекомендованные решения</h2>
        </div>
        
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {confirmedSolutions.map(solution => (
              <motion.div
                key={solution.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-xl border-2 border-brand-accent bg-brand-accent/5 relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-brand-accent uppercase">{solution.category}</span>
                  <span className="bg-brand-accent text-white text-[8px] px-1.5 py-0.5 rounded-full uppercase font-bold">Подтверждено</span>
                </div>
                <h3 className="text-sm font-bold text-brand-deep mb-1">{solution.title}</h3>
                <p className="text-xs text-brand-graphite/70">{solution.value}</p>
              </motion.div>
            ))}

            {recommendedSolutions.map(solution => (
              <motion.div
                key={solution.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="p-3 rounded-xl border border-brand-light bg-white shadow-sm hover:border-brand-deep/30 transition-colors cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-brand-deep/40 uppercase">{solution.category}</span>
                  <span className="text-brand-accent flex items-center gap-1 text-[8px] font-bold uppercase">
                    <Sparkles size={10} /> AI Рекомендует
                  </span>
                </div>
                <h3 className="text-sm font-bold text-brand-deep mb-1 group-hover:text-brand-deep transition-colors">{solution.title}</h3>
                <p className="text-xs text-brand-graphite/70">{solution.description}</p>
              </motion.div>
            ))}

            {recommendedSolutions.length === 0 && confirmedSolutions.length === 0 && (
              <div className="text-center py-8 text-brand-deep/30 italic text-sm flex flex-col items-center gap-2">
                <Loader2 size={24} className="animate-spin opacity-20" />
                AI подбирает решения...
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};
