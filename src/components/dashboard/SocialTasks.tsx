'use client';

import React from 'react';
import {
  MessageSquare,
  Share2,
  Repeat,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Send
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/context/AppContext';
import { SocialTask } from '@/types';

export const SocialTasks: React.FC = () => {
  const { tasks, startAndClaimTask, user, setIsActivationModalOpen } = useApp();

  const getTaskIcon = (icon: SocialTask['icon']) => {
    switch (icon) {
      case 'twitter':
        return (
          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
      case 'discord':
        return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      case 'telegram':
        return <Send className="w-4 h-4 text-cyan-400" />;
      case 'retweet':
        return <Repeat className="w-4 h-4 text-emerald-400" />;
      case 'share':
        return <Share2 className="w-4 h-4 text-[#F7931A]" />;
      default:
        return <Share2 className="w-4 h-4 text-[#F7931A]" />;
    }
  };

  const handleAction = (task: SocialTask) => {
    if (!user?.isActivated) {
      setIsActivationModalOpen(true);
      return;
    }
    startAndClaimTask(task.id);
  };

  return (
    <Card variant="default" className="p-6 border-zinc-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white">Social Bounties & Tasks</h3>
            <Badge variant="orange" size="sm">
              Daily Reset
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Complete quick social missions to earn instant cash credits and leaderboard points.
          </p>
        </div>
        <div className="text-xs text-zinc-400 font-medium bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
          Tasks Completed:{' '}
          <span className="text-white font-bold">
            {tasks.filter((t) => t.status === 'completed').length} / {tasks.length}
          </span>
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {tasks.map((task) => {
          const isCompleted = task.status === 'completed';
          const isVerifying = task.status === 'verifying';

          return (
            <div
              key={task.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all ${
                isCompleted
                  ? 'bg-zinc-950/60 border-zinc-900 opacity-75'
                  : 'bg-[#141417] border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3.5 mb-3 sm:mb-0">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                  {getTaskIcon(task.icon)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white">{task.title}</h4>
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Done
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">{task.description}</p>
                </div>
              </div>

              {/* Reward & Action */}
              <div className="flex items-center justify-between sm:justify-end gap-3.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-900">
                <div className="text-right">
                  <div className="text-xs font-bold text-[#F7931A]">
                    +${task.rewardUsd.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-medium">
                    +{task.rewardPoints} pts
                  </div>
                </div>

                {isCompleted ? (
                  <Button variant="secondary" size="sm" disabled className="text-zinc-500">
                    Claimed
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAction(task)}
                    isLoading={isVerifying}
                    rightIcon={
                      !isVerifying && (
                        <ExternalLink className="w-3.5 h-3.5 text-black" />
                      )
                    }
                  >
                    {isVerifying ? 'Verifying...' : 'Start & Claim'}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
