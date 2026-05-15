import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Users, BookOpen, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import TeacherChat from '@/components/collaboration/TeacherChat';
import SharedResourceLibrary from '@/components/collaboration/SharedResourceLibrary';

const TABS = [
  { id: 'resources', label: 'Shared Resources', icon: BookOpen },
  { id: 'chat', label: 'Teacher Chat', icon: MessageSquare },
];

export default function TeacherCollaboration() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('resources');

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Users className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Teacher Collaboration</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Share resources and connect with fellow teachers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all -mb-px',
              activeTab === id
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-slate-300'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'resources' && <SharedResourceLibrary user={user} />}
      {activeTab === 'chat' && <TeacherChat user={user} />}
    </div>
  );
}