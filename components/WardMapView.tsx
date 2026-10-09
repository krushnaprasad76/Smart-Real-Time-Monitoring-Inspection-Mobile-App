'use client';

import { useState, useMemo } from 'react';
import { StreetAssetNode, CivicCategory, CivicStatus } from '@/types/civic';
import {
  Lightbulb,
  Droplets,
  AlertTriangle,
  Zap,
  Gauge,
  Search,
  Filter,
  Maximize2,
  MapPin,
  Layers,
  Eye,
  EyeOff,
  RotateCcw,
  SlidersHorizontal,
  X,
  Check,
  Car,
  Wrench,
  Cable,
  Map as MapIcon,
} from 'lucide-react';

interface WardMapViewProps {
  nodes: StreetAssetNode[];
  selectedNode: StreetAssetNode | null;
  onSelectNode: (node: StreetAssetNode) => void;
  onOpenReportModal?: () => void;
}

export function WardMapView({
  nodes,
  selectedNode,
  onSelectNode,
  onOpenReportModal,
}: WardMapViewProps) {
  // Multi-category show/hide visibility toggles
  const [visibleCategories, setVisibleCategories] = useState<Record<CivicCategory, boolean>>({
    streetlight: true,
    drainage: true,
    water_leak: true,
    pothole: true,
    electrical: true,
  });

  // Spatial context overlays
  const [showTrafficOverlay, setShowTrafficOverlay] = useState(false);
  const [showRepairZonesOverlay, setShowRepairZonesOverlay] = useState(false);
  const [showUtilityLinesOverlay, setShowUtilityLinesOverlay] = useState(false);

  const [statusFilter, setStatusFilter] = useState<CivicStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);

  // Toggle single category visibility
  const toggleCategory = (category: CivicCategory) => {
    setVisibleCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Show all categories
  const showAllCategories = () => {
    setVisibleCategories({
      streetlight: true,
      drainage: true,
      water_leak: true,
      pothole: true,
      electrical: true,
    });
  };

  // Hide all categories (maximum de-clutter)
  const hideAllCategories = () => {
    setVisibleCategories({
      streetlight: false,
      drainage: false,
      water_leak: false,
      pothole: false,
      electrical: false,
    });
  };

  // Isolate a single category
  const isolateCategory = (category: CivicCategory) => {
    setVisibleCategories({
      streetlight: category === 'streetlight',
      drainage: category === 'drainage',
      water_leak: category === 'water_leak',
      pothole: category === 'pothole',
      electrical: category === 'electrical',
    });
  };

  // Counts for filters
  const counts = useMemo(() => {
    return {
      all: nodes.length,
      critical: nodes.filter((n) => n.status === 'critical').length,
      warning: nodes.filter((n) => n.status === 'warning').length,
      nominal: nodes.filter((n) => n.status === 'nominal' || n.status === 'resolved').length,
      streetlight: nodes.filter((n) => n.category === 'streetlight').length,
      drainage: nodes.filter((n) => n.category === 'drainage').length,
      water_leak: nodes.filter((n) => n.category === 'water_leak').length,
      pothole: nodes.filter((n) => n.category === 'pothole').length,
      electrical: nodes.filter((n) => n.category === 'electrical').length,
    };
  }, [nodes]);

  // Filtered nodes based on active layer visibility, severity, and search
  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      // Check category visibility toggle
      if (!visibleCategories[node.category]) return false;

      // Check status severity filter
      if (statusFilter !== 'all' && node.status !== statusFilter) return false;

      // Check search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          node.id.toLowerCase().includes(q) ||
          node.name.toLowerCase().includes(q) ||
          node.address.toLowerCase().includes(q) ||
          node.ward.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [nodes, visibleCategories, statusFilter, searchQuery]);

  const activeCategoryCount = Object.values(visibleCategories).filter(Boolean).length;
  const totalCategories = 5;
  const isAnyCategoryHidden = activeCategoryCount < totalCategories;

  const activeOverlaysCount =
    (showTrafficOverlay ? 1 : 0) +
    (showRepairZonesOverlay ? 1 : 0) +
    (showUtilityLinesOverlay ? 1 : 0);

  const categoriesConfig: {
    key: CivicCategory;
    label: string;
    icon: typeof Lightbulb;
    colorClass: string;
    badgeBg: string;
    borderActive: string;
  }[] = [
    {
      key: 'streetlight',
      label: 'Streetlights',
      icon: Lightbulb,
      colorClass: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300',
      borderActive: 'border-amber-500/60',
    },
    {
      key: 'drainage',
      label: 'Drainage & Floods',
      icon: Droplets,
      colorClass: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/20 text-cyan-300',
      borderActive: 'border-cyan-500/60',
    },
    {
      key: 'water_leak',
      label: 'Water Leaks',
      icon: Gauge,
      colorClass: 'text-blue-400',
      badgeBg: 'bg-blue-500/20 text-blue-300',
      borderActive: 'border-blue-500/60',
    },
    {
      key: 'pothole',
      label: 'Potholes & Roads',
      icon: AlertTriangle,
      colorClass: 'text-orange-400',
      badgeBg: 'bg-orange-500/20 text-orange-300',
      borderActive: 'border-orange-500/60',
    },
    {
      key: 'electrical',
      label: 'Electrical Grid',
      icon: Zap,
      colorClass: 'text-purple-400',
      badgeBg: 'bg-purple-500/20 text-purple-300',
      borderActive: 'border-purple-500/60',
    },
  ];

  const getCategoryIcon = (category: CivicCategory, className = 'w-3.5 h-3.5') => {
    switch (category) {
      case 'streetlight':
        return <Lightbulb className={className} />;
      case 'drainage':
        return <Droplets className={className} />;
      case 'water_leak':
        return <Gauge className={className} />;
      case 'pothole':
        return <AlertTriangle className={className} />;
      case 'electrical':
        return <Zap className={className} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0F19] text-slate-100">
      {/* Search and Category Layer Toggle Strip */}
      <div className="p-3 bg-[#131B2E]/95 border-b border-slate-800 space-y-2.5">
        {/* Search Bar + Layer Control Drawer Trigger */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Street, Ward, or Node ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[40px] pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Drawer Button */}
          <button
            onClick={() => setIsLayerPanelOpen((prev) => !prev)}
            className={`min-h-[40px] px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
              isLayerPanelOpen
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                : activeOverlaysCount > 0 || isAnyCategoryHidden
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
            title="Open Layer Visibility & Spatial Overlays"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Layers & Overlays</span>
            <span className="font-mono text-[11px] opacity-80">
              ({activeCategoryCount}/5 {activeOverlaysCount > 0 ? `+${activeOverlaysCount}` : ''})
            </span>
          </button>
        </div>

        {/* Spatial Context Overlays Toggle Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mr-1 shrink-0 font-medium">
            <MapIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Overlays:</span>
          </div>

          {/* Traffic Density Toggle */}
          <button
            onClick={() => setShowTrafficOverlay((prev) => !prev)}
            className={`min-h-[34px] px-2.5 py-1 rounded-lg border whitespace-nowrap transition-all flex items-center gap-1.5 ${
              showTrafficOverlay
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 font-semibold'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Car className={`w-3.5 h-3.5 ${showTrafficOverlay ? 'text-rose-400' : 'text-slate-500'}`} />
            <span>Traffic Flow</span>
            {showTrafficOverlay ? (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            ) : null}
          </button>

          {/* Historical Repair Zones Toggle */}
          <button
            onClick={() => setShowRepairZonesOverlay((prev) => !prev)}
            className={`min-h-[34px] px-2.5 py-1 rounded-lg border whitespace-nowrap transition-all flex items-center gap-1.5 ${
              showRepairZonesOverlay
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-semibold'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Wrench className={`w-3.5 h-3.5 ${showRepairZonesOverlay ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>Repair Zones</span>
            {showRepairZonesOverlay ? (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            ) : null}
          </button>

          {/* Utility Lines Toggle */}
          <button
            onClick={() => setShowUtilityLinesOverlay((prev) => !prev)}
            className={`min-h-[34px] px-2.5 py-1 rounded-lg border whitespace-nowrap transition-all flex items-center gap-1.5 ${
              showUtilityLinesOverlay
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/60 font-semibold'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Cable className={`w-3.5 h-3.5 ${showUtilityLinesOverlay ? 'text-purple-400' : 'text-slate-500'}`} />
            <span>Utility Lines</span>
            {showUtilityLinesOverlay ? (
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            ) : null}
          </button>
        </div>

        {/* Category Visibility Toggle Chips (Show/Hide Street Assets) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 font-medium">
              <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
              <span>Visible Asset Categories (Tap to Show/Hide)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={showAllCategories}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors hover:underline"
              >
                Show All
              </button>
              <span className="text-slate-600">·</span>
              <button
                onClick={hideAllCategories}
                className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors hover:underline"
              >
                Hide All
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {categoriesConfig.map((cat) => {
              const isVisible = visibleCategories[cat.key];
              const count = counts[cat.key];
              const Icon = cat.icon;

              return (
                <button
                  key={cat.key}
                  onClick={() => toggleCategory(cat.key)}
                  className={`min-h-[36px] px-2.5 py-1.5 rounded-xl border whitespace-nowrap transition-all flex items-center gap-2 ${
                    isVisible
                      ? `${cat.badgeBg} ${cat.borderActive} font-medium shadow-xs`
                      : 'bg-slate-900/40 text-slate-500 border-slate-800/80 hover:text-slate-300 opacity-60'
                  }`}
                  aria-pressed={isVisible}
                  title={`Click to ${isVisible ? 'hide' : 'show'} ${cat.label} on map`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isVisible ? cat.colorClass : 'text-slate-600'
                    }`}
                  />
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      isVisible
                        ? 'bg-slate-950/40 text-slate-200'
                        : 'bg-slate-900 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                  {isVisible ? (
                    <Eye className="w-3 h-3 text-slate-400 ml-0.5 shrink-0" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-slate-600 ml-0.5 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Severity Status Filter Sub-strip */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Severity:
            </span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`min-h-[28px] px-2 py-0.5 rounded text-[11px] transition-colors ${
                statusFilter === 'all'
                  ? 'bg-slate-700 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('critical')}
              className={`min-h-[28px] px-2 py-0.5 rounded text-[11px] transition-colors flex items-center gap-1 ${
                statusFilter === 'critical'
                  ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40 font-medium'
                  : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
              Critical ({counts.critical})
            </button>
            <button
              onClick={() => setStatusFilter('warning')}
              className={`min-h-[28px] px-2 py-0.5 rounded text-[11px] transition-colors flex items-center gap-1 ${
                statusFilter === 'warning'
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40 font-medium'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
              Warning ({counts.warning})
            </button>
            <button
              onClick={() => setStatusFilter('nominal')}
              className={`min-h-[28px] px-2 py-0.5 rounded text-[11px] transition-colors flex items-center gap-1 ${
                statusFilter === 'nominal'
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-medium'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Nominal ({counts.nominal})
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoomLevel((z) => (z === 1 ? 1.25 : 1))}
              className="min-h-[28px] px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center gap-1 text-[11px]"
              title="Toggle map zoom"
            >
              <Maximize2 className="w-3 h-3" />
              <span className="hidden sm:inline">{zoomLevel === 1 ? 'Zoom In' : 'Reset'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main SVG Vector City Map Canvas */}
      <div className="relative flex-1 min-h-[380px] w-full overflow-hidden bg-[#0a0e1a] select-none">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
          preserveAspectRatio="none"
        >
          {/* Grids and Patterns */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#162035" strokeWidth="0.3" />
            </pattern>
            {/* Water Canal Gradient */}
            <linearGradient id="canalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0e2a47" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#08182b" stopOpacity="0.9" />
            </linearGradient>
            {/* Hatched Pattern for Historical Repair Zones */}
            <pattern id="repairHatch" width="4" height="4" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="4" stroke="#f59e0b" strokeWidth="0.8" strokeOpacity="0.35" />
            </pattern>
            <pattern id="repairHatchCanal" width="4" height="4" patternTransform="rotate(-45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="4" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.4" />
            </pattern>
          </defs>

          {/* Grid pattern fill */}
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Ward Boundary Outlines */}
          <rect x="25" y="15" width="35" height="35" fill="#111a2f" fillOpacity="0.4" stroke="#1f2f4e" strokeWidth="0.4" strokeDasharray="1,1" rx="2" />
          <rect x="5" y="30" width="22" height="38" fill="#0d1b30" fillOpacity="0.35" stroke="#1c3052" strokeWidth="0.4" strokeDasharray="1,1" rx="2" />
          <rect x="15" y="65" width="45" height="30" fill="#141a26" fillOpacity="0.4" stroke="#252f40" strokeWidth="0.4" strokeDasharray="1,1" rx="2" />
          <rect x="58" y="10" width="38" height="35" fill="#111c33" fillOpacity="0.4" stroke="#203358" strokeWidth="0.4" strokeDasharray="1,1" rx="2" />
          <rect x="62" y="45" width="34" height="50" fill="#17182e" fillOpacity="0.35" stroke="#2a2550" strokeWidth="0.4" strokeDasharray="1,1" rx="2" />

          {/* Water Canal Body */}
          <path
            d="M 0,55 Q 20,52 35,62 T 65,75 T 100,72 L 100,85 L 0,85 Z"
            fill="url(#canalGrad)"
            stroke="#1b4b7a"
            strokeWidth="0.5"
          />

          {/* LAYER 1: HISTORICAL REPAIR ZONES (When Active) */}
          {showRepairZonesOverlay && (
            <g className="transition-opacity duration-300">
              {/* Zone A: Downtown Aqueduct Vault */}
              <rect
                x="28"
                y="22"
                width="28"
                height="22"
                fill="url(#repairHatch)"
                stroke="#f59e0b"
                strokeWidth="0.8"
                strokeDasharray="2,1"
                rx="3"
              />
              <text x="30" y="26" fill="#fcd34d" fontSize="1.8" fontWeight="bold">
                REPAIR ZONE A (2025 PIPE RELINING)
              </text>

              {/* Zone B: Canal Outfall Reconstruction */}
              <path
                d="M 12,48 Q 25,48 35,60 L 30,72 L 12,68 Z"
                fill="url(#repairHatchCanal)"
                stroke="#38bdf8"
                strokeWidth="0.8"
                strokeDasharray="2,1"
              />
              <text x="14" y="52" fill="#7dd3fc" fontSize="1.8" fontWeight="bold">
                REPAIR ZONE B (2024 BASIN FLAP)
              </text>

              {/* Zone C: Substation Grid Reinforcement */}
              <rect
                x="72"
                y="40"
                width="22"
                height="20"
                fill="#a855f7"
                fillOpacity="0.12"
                stroke="#c084fc"
                strokeWidth="0.8"
                strokeDasharray="2,1"
                rx="3"
              />
              <text x="74" y="44" fill="#e9d5ff" fontSize="1.8" fontWeight="bold">
                REPAIR ZONE C (2025 HIGH-V CABLE)
              </text>
            </g>
          )}

          {/* LAYER 2: SUBTERRANEAN INFRASTRUCTURE UTILITY LINES (When Active) */}
          {showUtilityLinesOverlay && (
            <g className="transition-opacity duration-300">
              {/* High Voltage Electrical Conduit (Purple Neon) */}
              <path
                d="M 84,48 L 70,35 L 45,35 L 26,36"
                fill="none"
                stroke="#a855f7"
                strokeWidth="1.2"
                strokeDasharray="3,1.5"
              />
              <text x="56" y="33" fill="#c084fc" fontSize="1.6" fontWeight="bold">
                ⚡ 13.8kV HIGH-VOLTAGE TRUNK (-1.8m)
              </text>

              {/* Stormwater Gravity Sewer & Culverts (Cyan) */}
              <path
                d="M 78,65 L 44,42 L 18,48 L 15,62"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.2"
                strokeDasharray="2.5,2.5"
              />
              <text x="32" y="47" fill="#22d3ee" fontSize="1.6" fontWeight="bold">
                🌊 GRAVITY STORM CULVERT (-3.2m)
              </text>

              {/* Pressurized Water Mains (Azure Blue Double Line) */}
              <path
                d="M 52,34 L 52,70 L 38,84"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.4"
                strokeDasharray="4,1"
              />
              <text x="54" y="58" fill="#60a5fa" fontSize="1.6" fontWeight="bold">
                💧 24-INCH WATER MAIN (-1.4m)
              </text>
            </g>
          )}

          {/* Major City Arterial Roads */}
          <line x1="0" y1="35" x2="100" y2="35" stroke="#24344d" strokeWidth="1.6" />
          <line x1="0" y1="35" x2="100" y2="35" stroke="#f1f5f9" strokeWidth="0.2" strokeDasharray="1,1.5" />

          <line x1="45" y1="0" x2="45" y2="100" stroke="#24344d" strokeWidth="1.6" />
          <line x1="45" y1="0" x2="45" y2="100" stroke="#f1f5f9" strokeWidth="0.2" strokeDasharray="1,1.5" />

          <line x1="10" y1="10" x2="90" y2="90" stroke="#202c40" strokeWidth="1.2" />

          {/* Secondary Street Grid */}
          <line x1="0" y1="20" x2="100" y2="20" stroke="#192336" strokeWidth="0.8" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#192336" strokeWidth="0.8" />
          <line x1="25" y1="0" x2="25" y2="100" stroke="#192336" strokeWidth="0.8" />
          <line x1="70" y1="0" x2="70" y2="100" stroke="#192336" strokeWidth="0.8" />
          <line x1="85" y1="0" x2="85" y2="100" stroke="#192336" strokeWidth="0.8" />

          {/* LAYER 3: TRAFFIC DENSITY FLOW (When Active) */}
          {showTrafficOverlay && (
            <g className="transition-opacity duration-300">
              {/* Heavy Congestion Corridor (Red / 12 mph) */}
              <line x1="25" y1="35" x2="65" y2="35" stroke="#ef4444" strokeWidth="2.2" strokeOpacity="0.85" />
              <text x="35" y="38" fill="#f87171" fontSize="1.6" fontWeight="bold">
                12 MPH · HEAVY CONGESTION
              </text>

              {/* Moderate Traffic Corridor (Amber / 24 mph) */}
              <line x1="45" y1="10" x2="45" y2="60" stroke="#f59e0b" strokeWidth="2.0" strokeOpacity="0.85" />
              <text x="47" y="25" fill="#fbbf24" fontSize="1.6" fontWeight="bold">
                24 MPH · MODERATE
              </text>

              {/* Free Flow Corridor (Emerald Green / 38 mph) */}
              <line x1="10" y1="10" x2="75" y2="75" stroke="#10b981" strokeWidth="1.8" strokeOpacity="0.85" />
              <text x="52" y="70" fill="#34d399" fontSize="1.6" fontWeight="bold">
                38 MPH · FREE FLOW
              </text>
            </g>
          )}

          {/* Street Labels */}
          <text x="32" y="33" fill="#64748b" fontSize="2" fontWeight="600" letterSpacing="0.1">METRO PARKWAY</text>
          <text x="47" y="14" fill="#64748b" fontSize="2" fontWeight="600" letterSpacing="0.1">5TH AVE ARTERIAL</text>
          <text x="12" y="59" fill="#38bdf8" fontSize="1.8" fontStyle="italic" opacity="0.8">CANAL BASIN</text>
          <text x="68" y="18" fill="#64748b" fontSize="1.8">NORTH HEIGHTS</text>
          <text x="72" y="52" fill="#64748b" fontSize="1.8">EAST MARKET</text>
          <text x="22" y="88" fill="#64748b" fontSize="1.8">HARBOR INDUSTRIAL</text>
        </svg>

        {/* DOM-Based Sensor Node Pins for Visible Layers */}
        {filteredNodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          const isCritical = node.status === 'critical';
          const isWarning = node.status === 'warning';

          const glowClass = isCritical ? 'animate-ping opacity-75' : '';

          return (
            <button
              key={node.id}
              onClick={() => onSelectNode(node)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none z-20 transition-transform ${
                isSelected ? 'scale-125 z-30' : 'hover:scale-110'
              }`}
              style={{ left: `${node.coordinates.x}%`, top: `${node.coordinates.y}%` }}
              aria-label={`Select sensor node ${node.id}: ${node.name}`}
            >
              {/* Outer pulsing ring for critical/warning alerts */}
              {isCritical && (
                <span className={`absolute -inset-2.5 rounded-full bg-rose-500/40 ${glowClass}`} />
              )}
              {isWarning && (
                <span className="absolute -inset-1.5 rounded-full bg-amber-500/30 animate-pulse" />
              )}

              {/* Pin Head */}
              <div
                className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg transition-all ${
                  isSelected
                    ? 'border-white bg-slate-900 ring-4 ring-cyan-500/50 shadow-cyan-500/30'
                    : isCritical
                    ? 'border-rose-400 bg-slate-950 shadow-rose-500/40'
                    : isWarning
                    ? 'border-amber-400 bg-slate-950 shadow-amber-500/40'
                    : 'border-emerald-400 bg-slate-950 shadow-emerald-500/30'
                }`}
              >
                <div
                  className={`${
                    isCritical
                      ? 'text-rose-400'
                      : isWarning
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {getCategoryIcon(node.category, 'w-4 h-4')}
                </div>
              </div>

              {/* Node ID Callout Bubble */}
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap shadow-sm pointer-events-none transition-opacity ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 opacity-100'
                    : 'bg-slate-900/90 text-slate-300 border border-slate-700/80 opacity-80 group-hover:opacity-100'
                }`}
              >
                {node.id}
              </div>
            </button>
          );
        })}

        {/* Floating Clutter De-clutter Status Notice */}
        {isAnyCategoryHidden && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-full bg-slate-950/90 border border-cyan-500/40 backdrop-blur-md shadow-lg flex items-center gap-2 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>
              Map De-cluttered: <strong>{totalCategories - activeCategoryCount}</strong> layer(s) hidden
            </span>
            <button
              onClick={showAllCategories}
              className="text-cyan-400 hover:text-cyan-300 font-semibold underline text-[11px] ml-1 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All
            </button>
          </div>
        )}

        {/* Floating Quick Action: Report Issue Button for Citizens */}
        {onOpenReportModal && (
          <div className="absolute bottom-4 right-4 z-30">
            <button
              onClick={onOpenReportModal}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-semibold text-xs shadow-lg shadow-amber-500/25 flex items-center gap-2 active:scale-95 transition-all"
            >
              <AlertTriangle className="w-4 h-4 text-slate-950" />
              <span>Report Street Issue</span>
            </button>
          </div>
        )}

        {/* Map Legend & Active Overlays Overlay */}
        <div className="absolute bottom-4 left-3 z-10 hidden sm:flex flex-col gap-1.5 p-2.5 bg-slate-950/90 backdrop-blur-md rounded-xl border border-slate-800 text-[11px] text-slate-400 pointer-events-none">
          <div className="font-semibold text-slate-200 text-[10px] uppercase tracking-wider">
            Map Legend
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Critical Alarm</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 ml-2" />
            <span>Warning</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 ml-2" />
            <span>Nominal</span>
          </div>

          {activeOverlaysCount > 0 && (
            <div className="pt-1.5 border-t border-slate-800/80 space-y-0.5 text-[10px]">
              <span className="font-semibold text-cyan-400 uppercase tracking-wider block">
                Active Overlays:
              </span>
              {showTrafficOverlay && (
                <div className="text-rose-300">🚦 Real-Time Traffic Congestion</div>
              )}
              {showRepairZonesOverlay && (
                <div className="text-amber-300">🏗️ Historical Repair Boundaries</div>
              )}
              {showUtilityLinesOverlay && (
                <div className="text-purple-300">⚡ Subsurface Utility Conduits</div>
              )}
            </div>
          )}
        </div>

        {/* Interactive Floating Layer Control Modal / Panel */}
        {isLayerPanelOpen && (
          <div className="absolute top-3 right-3 z-40 w-80 bg-[#111726]/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-4 space-y-3.5 animate-in fade-in zoom-in-95 duration-150 max-h-[90%] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Map Layers & Spatial Overlays
                </h4>
              </div>
              <button
                onClick={() => setIsLayerPanelOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close layer panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Section 1: Spatial Context Overlays */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapIcon className="w-3 h-3" />
                <span>Spatial Context Overlays</span>
              </span>

              {/* Traffic Density Switch */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${showTrafficOverlay ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-500'}`}>
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Traffic Density Flow</span>
                    <span className="text-[10px] text-slate-400">Congestion corridors & speeds</span>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showTrafficOverlay}
                  onClick={() => setShowTrafficOverlay((v) => !v)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors focus:outline-none ${
                    showTrafficOverlay ? 'bg-rose-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      showTrafficOverlay ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Historical Repair Zones Switch */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${showRepairZonesOverlay ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'}`}>
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Historical Repair Zones</span>
                    <span className="text-[10px] text-slate-400">Past overhauls & recurrence risk</span>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showRepairZonesOverlay}
                  onClick={() => setShowRepairZonesOverlay((v) => !v)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors focus:outline-none ${
                    showRepairZonesOverlay ? 'bg-amber-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      showRepairZonesOverlay ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Infrastructure Utility Lines Switch */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${showUtilityLinesOverlay ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-500'}`}>
                    <Cable className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Infrastructure Utility Lines</span>
                    <span className="text-[10px] text-slate-400">Subterranean power, water & culverts</span>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showUtilityLinesOverlay}
                  onClick={() => setShowUtilityLinesOverlay((v) => !v)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors focus:outline-none ${
                    showUtilityLinesOverlay ? 'bg-purple-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      showUtilityLinesOverlay ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Section 2: Asset Category Visibility */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
                  <span>Asset Categories ({filteredNodes.length}/{nodes.length})</span>
                </span>
                <button
                  onClick={showAllCategories}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  Enable All
                </button>
              </div>

              <div className="space-y-1.5">
                {categoriesConfig.map((cat) => {
                  const isVisible = visibleCategories[cat.key];
                  const count = counts[cat.key];
                  const Icon = cat.icon;

                  return (
                    <div
                      key={cat.key}
                      className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-1.5 rounded-lg ${
                            isVisible ? cat.badgeBg : 'bg-slate-800 text-slate-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span
                            className={`text-xs font-medium block ${
                              isVisible ? 'text-slate-200' : 'text-slate-500 line-through'
                            }`}
                          >
                            {cat.label}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {count} street asset{count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Isolate button */}
                        <button
                          onClick={() => isolateCategory(cat.key)}
                          className="text-[10px] px-1.5 py-0.5 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                          title={`Show ONLY ${cat.label}`}
                        >
                          Only
                        </button>

                        {/* Toggle Switch */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isVisible}
                          onClick={() => toggleCategory(cat.key)}
                          className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors focus:outline-none ${
                            isVisible ? 'bg-cyan-500' : 'bg-slate-800'
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                              isVisible ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
