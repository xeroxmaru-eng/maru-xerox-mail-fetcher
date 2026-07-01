'use client';
// components/dashboard/StatsCards.tsx
// Four animated metric cards: Total, Today, This Month, Filtered

import { motion } from 'framer-motion';
import { Mail, Calendar, CalendarDays, Filter } from 'lucide-react';
import { EmailMessage } from '@/types/email.types';
import { isDateToday, isDateThisMonth } from '@/lib/utils';
import { StatsCardSkeleton } from '@/components/shared/LoadingSkeleton';

interface StatsCardsProps {
  emails: EmailMessage[];
  filteredCount: number;
  isLoading: boolean;
}

interface StatCard {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  description: string;
}

function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {value.toLocaleString()}
    </motion.span>
  );
}

function StatCard({
  card,
  index,
}: {
  card: StatCard;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
      className="glass-card-solid p-5 relative overflow-hidden group"
      style={{ cursor: 'default' }}
    >
      {/* Subtle gradient accent */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at top right, ${card.bgColor}40, transparent 60%)`,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {card.label}
          </p>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300"
            style={{ background: card.bgColor }}
          >
            <card.icon className="w-5 h-5" style={{ color: card.color }} strokeWidth={1.8} />
          </div>
        </div>

        <div
          className="text-3xl font-bold mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          <AnimatedNumber value={card.value} />
        </div>

        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {card.description}
        </p>

        {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 rounded-full"
          style={{ background: card.color }}
          initial={{ width: '0%' }}
          animate={{ width: `${Math.min((card.value / Math.max(1, 100)) * 100, 100)}%` }}
          transition={{ delay: index * 0.08 + 0.3, duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

export default function StatsCards({ emails, filteredCount, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)}
      </div>
    );
  }

  const todayCount = emails.filter((e) => isDateToday(e.date)).length;
  const thisMonthCount = emails.filter((e) => isDateThisMonth(e.date)).length;

  const cards: StatCard[] = [
    {
      label: 'Total Emails',
      value: emails.length,
      icon: Mail,
      color: '#3b82f6',
      bgColor: 'rgba(59,130,246,0.12)',
      description: 'Total sent emails fetched',
    },
    {
      label: "Today's Emails",
      value: todayCount,
      icon: Calendar,
      color: '#8b5cf6',
      bgColor: 'rgba(139,92,246,0.12)',
      description: 'Emails sent today',
    },
    {
      label: 'This Month',
      value: thisMonthCount,
      icon: CalendarDays,
      color: '#06b6d4',
      bgColor: 'rgba(6,182,212,0.12)',
      description: 'Emails sent this month',
    },
    {
      label: 'Filtered Emails',
      value: filteredCount,
      icon: Filter,
      color: '#10b981',
      bgColor: 'rgba(16,185,129,0.12)',
      description: 'Currently displayed',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <StatCard key={card.label} card={card} index={i} />
      ))}
    </div>
  );
}
