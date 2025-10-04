import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ResearchCheckpoint } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Activity, Clock, AlertCircle, CheckCircle2, Play } from "lucide-react";
import { motion } from "framer-motion";

export default function AgentStatusIndicator({ onStartResearch }) {
  const [status, setStatus] = useState('idle');
  const [activeCount, setActiveCount] = useState(0);
  const [waitingCount, setWaitingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const pollingRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const checkAgentStatus = async () => {
      if (pollingRef.current) return;
      pollingRef.current = true;

      try {
        const resp = await ResearchCheckpoint.list("-last_updated");
        const checkpoints = Array.isArray(resp) ? resp : Array.isArray(resp?.items) ? resp.items : [];

        const norm = (s) => (s || '').toString().toLowerCase();

        const active = checkpoints.filter(cp => {
          const s = norm(cp.status);
          return s === 'in_progress' || s === 'discovery_in_progress' || s === 'extraction_in_progress';
        });

        const waiting = checkpoints.filter(cp => {
          const s = norm(cp.status);
          return /pending|queue/.test(s);
        });

        const failed = checkpoints.filter(cp => {
          const s = norm(cp.status);
          return s === 'failed' || s === 'provider_flagged' || s === 'error';
        });

        if (!isMountedRef.current) return;

        setActiveCount(active.length);
        setWaitingCount(waiting.length);

        if (failed.length > 0) {
          setStatus('failed');
        } else if (active.length > 0) {
          setStatus('running');
        } else if (waiting.length > 0) {
          setStatus('waiting');
        } else {
          setStatus('idle');
        }
      } catch (err) {
        console.error('Error checking agent status:', err);
        if (!isMountedRef.current) return;
        setStatus('idle');
      } finally {
        if (isMountedRef.current) setLoading(false);
        pollingRef.current = false;
      }
    };

    checkAgentStatus();
    const id = setInterval(checkAgentStatus, 10000);

    return () => {
      isMountedRef.current = false;
      clearInterval(id);
    };
  }, []);

  const config = useMemo(() => {
    switch (status) {
      case 'running':
        return {
          color: 'bg-emerald-500',
          icon: Activity,
          label: 'Research Active',
          glow: 'shadow-[0_0_16px_rgba(16,185,129,0.6)]',
          pulse: true,
          borderColor: 'border-emerald-500/30'
        };
      case 'waiting':
        return {
          color: 'bg-amber-500',
          icon: Clock,
          label: 'Research Queued',
          glow: 'shadow-[0_0_16px_rgba(245,158,11,0.6)]',
          pulse: true,
          borderColor: 'border-amber-500/30'
        };
      case 'failed':
        return {
          color: 'bg-red-500',
          icon: AlertCircle,
          label: 'Research Failed',
          glow: 'shadow-[0_0_16px_rgba(239,68,68,0.6)]',
          pulse: false,
          borderColor: 'border-red-500/30'
        };
      default:
        return {
          color: 'bg-[#6C7A91]',
          icon: CheckCircle2,
          label: 'Research Idle',
          glow: '',
          pulse: false,
          borderColor: 'border-[#2B3648]'
        };
    }
  }, [status]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-xl border border-[#2B3648] bg-[#1B2230]">
          <div className="w-3 h-3 rounded-full bg-[#6C7A91] animate-pulse" />
          <span className="text-xs text-[#A0AEC0]">Loading status...</span>
        </div>
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-3 p-3 rounded-xl border ${config.borderColor} bg-[#1B2230] transition-all duration-300 ${config.glow}`}>
        <div className="relative">
          <motion.div
            className={`w-3 h-3 rounded-full ${config.color}`}
            animate={config.pulse ? {
              scale: [1, 1.2, 1],
              opacity: [1, 0.8, 1]
            } : {}}
            transition={config.pulse ? {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            } : {}}
          />
          {config.pulse && (
            <motion.div
              className={`absolute inset-0 w-3 h-3 rounded-full ${config.color} opacity-30`}
              animate={{
                scale: [1, 2, 2],
                opacity: [0.5, 0, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Icon className="w-3.5 h-3.5 text-[#A0AEC0]" />
            <span className="text-xs font-medium text-[#F8F9FA]">{config.label}</span>
          </div>
          {activeCount > 0 && (
            <p className="text-[10px] text-[#6C7A91] mt-0.5">
              {activeCount} provider{activeCount !== 1 ? 's' : ''} in progress
            </p>
          )}
        </div>
      </div>

      {onStartResearch && (
        <Button
          onClick={onStartResearch}
          size="sm"
          className="w-full bg-gradient-to-r from-[#20A4F3] to-[#36B3D1] hover:from-[#36B3D1] hover:to-[#20A4F3] text-[#06121E] font-semibold shadow-[0_8px_24px_rgba(32,164,243,0.25)] hover:shadow-[0_8px_32px_rgba(32,164,243,0.35)] transition-all duration-200"
        >
          <Play className="w-3.5 h-3.5 mr-2" />
          Start Research
        </Button>
      )}
    </div>
  );
}