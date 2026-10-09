'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { StreetAssetNode, SocketConnectionState, SensorLogEntry, CivicCategory } from '@/types/civic';
import { INITIAL_STREET_NODES, INITIAL_SENSOR_LOGS } from '@/lib/mock-data';

export function useTelemetrySocket() {
  const [nodes, setNodes] = useState<StreetAssetNode[]>(INITIAL_STREET_NODES);

  // Synchronize from client storage after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sentinel_street_nodes');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setTimeout(() => {
            setNodes(parsed);
          }, 0);
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  const [connectionState, setConnectionState] = useState<SocketConnectionState>({
    status: 'connected',
    sampleRateHz: 1, // 1 Hz (1 reading per sec)
    packetCount: 1420,
    latencyMs: 24,
    lastHeartbeat: 0,
    activeSimulatedFault: null,
  });

  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<string[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play subtle warning beep
  const playAlertChime = useCallback(() => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Audio autoplay might be locked by browser
    }
  }, [soundEnabled]);

  // Save nodes to local cache
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sentinel_street_nodes', JSON.stringify(nodes));
      } catch (e) {
        // storage quota
      }
    }
  }, [nodes]);

  // Main real-time socket loop
  useEffect(() => {
    if (connectionState.status !== 'connected') return;

    const intervalMs = Math.round(1000 / connectionState.sampleRateHz);

    const timer = setInterval(() => {
      setConnectionState((prev) => ({
        ...prev,
        packetCount: prev.packetCount + 1,
        latencyMs: Math.floor(18 + Math.random() * 15),
        lastHeartbeat: Date.now(),
      }));

      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          const now = Date.now();
          const jitter = (Math.random() - 0.5);

          // Update metrics based on category
          const updatedMetrics = { ...node.metrics };
          let primaryValue = 0;

          if (node.category === 'streetlight') {
            if (node.status === 'nominal') {
              updatedMetrics.voltage = Number((230 + jitter * 4).toFixed(1));
              updatedMetrics.currentDrawAmps = Number((1.8 + jitter * 0.1).toFixed(2));
              primaryValue = updatedMetrics.voltage;
            } else if (node.status === 'critical') {
              updatedMetrics.voltage = Number(Math.max(60, (node.metrics.voltage || 84) + jitter * 6).toFixed(1));
              primaryValue = updatedMetrics.voltage;
            } else {
              primaryValue = node.metrics.voltage || 215;
            }
          } else if (node.category === 'drainage') {
            if (node.status === 'critical') {
              // High flood level
              updatedMetrics.waterLevelCm = Number(Math.min(92, Math.max(82, (node.metrics.waterLevelCm || 88) + jitter * 0.8)).toFixed(1));
              updatedMetrics.flowRateLpm = Number(Math.max(5, (node.metrics.flowRateLpm || 12) + jitter * 2).toFixed(1));
              primaryValue = updatedMetrics.waterLevelCm;
            } else {
              updatedMetrics.waterLevelCm = Number(Math.max(10, (node.metrics.waterLevelCm || 25) + jitter * 0.5).toFixed(1));
              primaryValue = updatedMetrics.waterLevelCm;
            }
          } else if (node.category === 'water_leak') {
            if (node.status === 'critical') {
              updatedMetrics.acousticLeakDb = Number(Math.max(70, Math.min(88, (node.metrics.acousticLeakDb || 78) + jitter * 2)).toFixed(1));
              updatedMetrics.waterPressurePsi = Number(Math.max(25, (node.metrics.waterPressurePsi || 38) + jitter * 1.5).toFixed(1));
              primaryValue = updatedMetrics.acousticLeakDb;
            } else {
              updatedMetrics.acousticLeakDb = Number(Math.max(15, (node.metrics.acousticLeakDb || 22) + jitter * 1).toFixed(1));
              primaryValue = updatedMetrics.acousticLeakDb;
            }
          } else if (node.category === 'pothole') {
            if (node.status === 'critical') {
              // Sudden transient vehicle impact spikes
              const spike = Math.random() > 0.8 ? 1.5 : 0;
              updatedMetrics.vibrationRmsG = Number(Math.max(3.2, 4.4 + jitter * 0.8 + spike).toFixed(2));
              primaryValue = updatedMetrics.vibrationRmsG;
            } else {
              updatedMetrics.vibrationRmsG = Number(Math.max(0.4, 1.2 + jitter * 0.3).toFixed(2));
              primaryValue = updatedMetrics.vibrationRmsG;
            }
          } else if (node.category === 'electrical') {
            if (node.status === 'critical') {
              updatedMetrics.transformerTempC = Number(Math.max(88, Math.min(99, (node.metrics.transformerTempC || 94) + jitter * 0.4)).toFixed(1));
              updatedMetrics.gridLoadPct = Number(Math.min(100, Math.max(90, (node.metrics.gridLoadPct || 96) + jitter * 1.5)).toFixed(0));
              primaryValue = updatedMetrics.transformerTempC;
            } else {
              updatedMetrics.transformerTempC = Number(Math.max(45, (node.metrics.transformerTempC || 52) + jitter * 0.3).toFixed(1));
              primaryValue = updatedMetrics.transformerTempC;
            }
          }

          // Append to recentHistory
          const history = node.recentHistory ? [...node.recentHistory] : [];
          history.push({ timestamp: now, primaryValue });
          if (history.length > 15) {
            history.shift();
          }

          return {
            ...node,
            metrics: updatedMetrics,
            recentHistory: history,
          };
        })
      );
    }, intervalMs);

    return () => clearInterval(timer);
  }, [connectionState.status, connectionState.sampleRateHz]);

  // Inject a simulated catastrophic municipal fault
  const injectFault = useCallback(
    (faultKey: 'drainage_flood' | 'electrical_surge' | 'water_main_burst' | 'streetlight_blackout' | 'pothole_axle_strike') => {
      let targetId = '';
      let alertDesc = '';

      if (faultKey === 'drainage_flood') {
        targetId = 'DR-205'; // Turn normal culvert into critical overflow
        alertDesc = 'Flash Flood Alert: Retention Basin Sump breached 91cm overflow threshold!';
      } else if (faultKey === 'electrical_surge') {
        targetId = 'EL-508'; // Surge feeder pillar
        alertDesc = 'Electrical Grid Hazard: High voltage transformer overheating at 98.4°C!';
      } else if (faultKey === 'water_main_burst') {
        targetId = 'WL-307';
        alertDesc = 'Main Rupture: Acoustic sensor detected 84dB subterranean fracture!';
      } else if (faultKey === 'streetlight_blackout') {
        targetId = 'SL-108';
        alertDesc = 'Luminaire Grid Failure: Zero voltage feed to overpass lamps!';
      } else if (faultKey === 'pothole_axle_strike') {
        targetId = 'PH-406';
        alertDesc = 'Pavement Collapse: 5.6G severe axle impact detected on Broadway!';
      }

      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === targetId) {
            return {
              ...n,
              status: 'critical',
              activeAlertDescription: alertDesc,
            };
          }
          return n;
        })
      );

      setConnectionState((prev) => ({
        ...prev,
        activeSimulatedFault: alertDesc,
      }));

      setActiveAlerts((prev) => [alertDesc, ...prev.slice(0, 4)]);
      playAlertChime();

      // Post to backend API
      fetch('/api/sensors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'inject_fault', nodeId: targetId, faultType: faultKey }),
      }).catch(() => {});
    },
    [playAlertChime]
  );

  // Clear or resolve node status (e.g. after inspection)
  const resolveNode = useCallback((nodeId: string, status: 'nominal' | 'in_inspection' | 'resolved' = 'resolved') => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            status,
            activeAlertDescription: undefined,
            lastInspected: new Date().toISOString().split('T')[0],
          };
        }
        return n;
      })
    );
  }, []);

  // Reset all to baseline
  const resetAllNodes = useCallback(() => {
    setNodes(INITIAL_STREET_NODES);
    setConnectionState((prev) => ({
      ...prev,
      activeSimulatedFault: null,
    }));
    setActiveAlerts([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sentinel_street_nodes');
    }
  }, []);

  const toggleConnection = useCallback(() => {
    setConnectionState((prev) => ({
      ...prev,
      status: prev.status === 'connected' ? 'disconnected' : 'connected',
    }));
  }, []);

  const setSampleRate = useCallback((hz: number) => {
    setConnectionState((prev) => ({
      ...prev,
      sampleRateHz: hz,
    }));
  }, []);

  return {
    nodes,
    connectionState,
    activeAlerts,
    soundEnabled,
    setSoundEnabled,
    injectFault,
    resolveNode,
    resetAllNodes,
    toggleConnection,
    setSampleRate,
  };
}
