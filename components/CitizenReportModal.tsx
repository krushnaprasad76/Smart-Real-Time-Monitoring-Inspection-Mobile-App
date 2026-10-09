'use client';

import { useState } from 'react';
import { CivicCategory, StreetAssetNode } from '@/types/civic';
import {
  X,
  AlertTriangle,
  Lightbulb,
  Droplets,
  Gauge,
  Zap,
  MapPin,
  Camera,
  Send,
  CheckCircle2,
} from 'lucide-react';

interface CitizenReportModalProps {
  onClose: () => void;
  presetNode?: StreetAssetNode | null;
  onSubmitReport: (report: {
    category: CivicCategory;
    title: string;
    address: string;
    ward: string;
    description: string;
    severity: 'minor' | 'moderate' | 'hazard';
    photoUrl: string;
    reporterName: string;
    associatedNodeId?: string;
  }) => void;
}

export function CitizenReportModal({
  onClose,
  presetNode,
  onSubmitReport,
}: CitizenReportModalProps) {
  const [category, setCategory] = useState<CivicCategory>(presetNode?.category || 'pothole');
  const [title, setTitle] = useState(
    presetNode
      ? `Issue observed at ${presetNode.name}`
      : 'Dangerous street pothole near intersection'
  );
  const [address, setAddress] = useState(presetNode?.address || 'Broadway & 4th Street');
  const [ward, setWard] = useState(presetNode?.ward || 'Ward 1 - Downtown Metro');
  const [description, setDescription] = useState(
    'Noticed severe road damage causing traffic slowdowns and vehicle rim strikes.'
  );
  const [severity, setSeverity] = useState<'minor' | 'moderate' | 'hazard'>('hazard');
  const [reporterName, setReporterName] = useState('Local Resident');
  const [photoUrl, setPhotoUrl] = useState<string>('https://picsum.photos/seed/civic_problem_user/600/400');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories: { key: CivicCategory; label: string; icon: typeof Lightbulb }[] = [
    { key: 'pothole', label: 'Road Pothole', icon: AlertTriangle },
    { key: 'drainage', label: 'Drainage & Flooding', icon: Droplets },
    { key: 'streetlight', label: 'Dark Streetlight', icon: Lightbulb },
    { key: 'water_leak', label: 'Water Pipe Leak', icon: Gauge },
    { key: 'electrical', label: 'Electrical Hazard', icon: Zap },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      onSubmitReport({
        category,
        title,
        address,
        ward,
        description,
        severity,
        photoUrl,
        reporterName,
        associatedNodeId: presetNode?.id,
      });
      setIsSubmitting(false);
      onClose();
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div onClick={onClose} className="fixed inset-0 bg-black/70 backdrop-blur-xs" />

      <div className="relative w-full max-w-lg bg-[#111726] border border-slate-800 rounded-3xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-amber-400 uppercase font-semibold">
                Citizen Civic Hotline
              </span>
              <h2 className="text-base font-bold text-white">Report a Street Hazard</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-800/80 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Category Picker */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Select Problem Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key)}
                    className={`min-h-[44px] p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Issue Summary / Headline
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
              placeholder="e.g. Clogged drain causing curb flood..."
            />
          </div>

          {/* Location & Ward */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Street Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full min-h-[40px] pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Municipal Ward</label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Ward 1 - Downtown Metro">Ward 1 - Downtown Metro</option>
                <option value="Ward 2 - Riverside Basin">Ward 2 - Riverside Basin</option>
                <option value="Ward 3 - Harbor Industrial">Ward 3 - Harbor Industrial</option>
                <option value="Ward 4 - North Heights">Ward 4 - North Heights</option>
                <option value="Ward 5 - East Market">Ward 5 - East Market</option>
              </select>
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Urgency Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['minor', 'moderate', 'hazard'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSeverity(lvl)}
                  className={`min-h-[40px] py-1.5 px-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    severity === lvl
                      ? lvl === 'hazard'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                        : lvl === 'moderate'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {lvl === 'hazard' ? 'Hazard / Danger' : lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Detailed Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
              placeholder="Describe the physical situation so field crews bring proper equipment..."
            />
          </div>

          {/* Photo Shot */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center justify-between">
              <span>Photo Attachment</span>
              <button
                type="button"
                onClick={() => setPhotoUrl(`https://picsum.photos/seed/civic_${Date.now()}/600/400`)}
                className="text-[11px] text-amber-400 hover:underline"
              >
                Change Photo
              </button>
            </label>
            <div className="h-28 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl} alt="Reported problem" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Reporter Name */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Your Name / Handle</label>
            <input
              type="text"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              className="w-full min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 rounded-xl bg-slate-900 text-slate-300 text-xs hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2 active:scale-98"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>{isSubmitting ? 'Submitting Ticket...' : 'Dispatch Civic Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
