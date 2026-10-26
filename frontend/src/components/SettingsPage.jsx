import React, { useState, useEffect, useCallback } from 'react';
import { Database, RefreshCw, CheckCircle2, XCircle, RotateCcw, Cpu } from 'lucide-react';
import { getApiUrl, setApiUrl, checkBackendHealth, DEFAULT_API_URL } from '../services/api';
import Badge from './ui/Badge';

const SettingsPage = () => {
  const [apiUrl, setLocalApiUrl] = useState(getApiUrl());
  const [backendStatus, setBackendStatus] = useState({ checking: true, online: false, message: '' });

  const testConnection = useCallback(async (urlToTest) => {
    const url = urlToTest !== undefined ? urlToTest : apiUrl;
    
    if (!url || !url.trim()) {
      setBackendStatus({ checking: false, online: false, error: 'API URL is empty. Please enter a valid URL.' });
      return;
    }

    setBackendStatus({ checking: true, online: false, error: '' });
    const res = await checkBackendHealth(url);
    if (res.online) {
      setBackendStatus({ checking: false, online: true, details: res.data });
    } else {
      setBackendStatus({ checking: false, online: false, error: res.error });
    }
  }, [apiUrl]);

  useEffect(() => {
    testConnection();
  }, [testConnection]);

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setLocalApiUrl(val);

    if (!val || !val.trim()) {
      setBackendStatus({ checking: false, online: false, error: 'API URL is empty. Please enter a valid URL.' });
    }
  };

  const handleSaveAndTest = () => {
    setApiUrl(apiUrl);
    testConnection(apiUrl);
  };

  const handleResetDefault = () => {
    const defaultEnvUrl = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
    setLocalApiUrl(defaultEnvUrl);
    setApiUrl(null);
    testConnection(defaultEnvUrl);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* API Configuration Card */}
      <div className="bg-white rounded-xl border border-border shadow-xs hover:shadow-card transition-shadow overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Database size={16} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Backend REST API Connection
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Configure live database endpoint or local microservice</p>
            </div>
          </div>
          <Badge variant={backendStatus.online ? 'success' : 'warning'} size="xs">
            {backendStatus.online ? 'Live Engine' : 'Offline / Mock Engine'}
          </Badge>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 select-none">
              API Base Endpoint URL
            </label>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Target endpoint for all analytical queries and file ingestion. Deployed instances automatically fallback to simulated SQLite state when unreachable.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                placeholder={import.meta.env.VITE_API_URL || "http://localhost:5000/api"}
                value={apiUrl}
                onChange={handleUrlChange}
                className="flex-1 px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={handleSaveAndTest}
                  disabled={backendStatus.checking}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-colors shadow-xs"
                >
                  <RefreshCw size={14} className={backendStatus.checking ? 'animate-spin' : ''} />
                  <span>Test & Save</span>
                </button>
                <button
                  onClick={handleResetDefault}
                  title="Reset to default environment URL"
                  className="p-2.5 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
                  aria-label="Reset default URL"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* Live Health Status Card */}
            <div className="mt-4">
              {backendStatus.checking ? (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg flex items-center gap-2.5 text-xs text-amber-900 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                  <span>Connecting to {apiUrl || '(empty URL)'}...</span>
                </div>
              ) : backendStatus.online ? (
                <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-lg flex items-start gap-2.5 text-xs text-emerald-900">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Live API Connected</p>
                    <p className="text-emerald-800 mt-0.5 leading-relaxed">
                      Backend service is responsive and verified against SQLite analytics database.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5 text-xs text-slate-700">
                  <XCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">Local Simulation Mode Active</p>
                    <p className="text-slate-500 mt-0.5 leading-relaxed">
                      {backendStatus.error || 'Live backend service not detected. The dashboard is running in client simulation mode using in-memory and LocalStorage persistence.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Architecture & Pipeline Specifications */}
      <div className="bg-white rounded-xl border border-border shadow-xs hover:shadow-card transition-shadow p-5 sm:p-6">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-3">
          <Cpu size={16} className="text-indigo-600" />
          <span>Platform Architecture Specifications</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          DataFlow is engineered with an enterprise pipeline architecture that seamlessly unifies multi-format data ingestion with responsive BI visualizations.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-200/60">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Frontend Stack</span>
            <p className="font-bold text-slate-900 mt-1">React 19 + Vite 8</p>
            <span className="text-slate-500 text-[11px]">Tailwind CSS & Recharts</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-200/60">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Database Engine</span>
            <p className="font-bold text-slate-900 mt-1">SQLite 3 (WAL Mode)</p>
            <span className="text-slate-500 text-[11px]">5 Relational Tables</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-200/60">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Security & Hygiene</span>
            <p className="font-bold text-slate-900 mt-1">Sanitized Ingestion</p>
            <span className="text-slate-500 text-[11px]">No Secrets Exposed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
