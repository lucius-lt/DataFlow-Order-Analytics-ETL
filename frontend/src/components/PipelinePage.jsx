import React, { useState, useEffect, useCallback } from 'react';
import { 
  Database, 
  Upload, 
  RefreshCw, 
  Globe, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileCode,
  FileSpreadsheet,
  FileText,
  X,
  FileCheck2
} from 'lucide-react';
import { 
  ingestJson, 
  ingestCsv, 
  ingestXml, 
  seedDemoData, 
  getPipelineStatus, 
  checkBackendHealth, 
  getCurrencyRates,
  getCountries
} from '../services/api';
import Badge from './ui/Badge';
import { formatNumber } from '../utils/formatters';

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const PipelinePage = () => {
  const [dbStats, setDbStats] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [loadingAction, setLoadingAction] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  
  // File inputs
  const [jsonFile, setJsonFile] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [xmlFile, setXmlFile] = useState(null);

  // Drag states
  const [dragActive, setDragActive] = useState({ json: false, csv: false, xml: false });

  // External APIs
  const [currencyData, setCurrencyData] = useState(null);
  const [countries, setCountries] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [loadingCountries, setLoadingCountries] = useState(false);

  const refreshStatus = useCallback(async () => {
    try {
      const health = await checkBackendHealth();
      setBackendOnline(health.online);
      const statusRes = await getPipelineStatus();
      if (statusRes && statusRes.success) {
        setDbStats(statusRes.data);
      }
    } catch (e) {
      console.warn('Status refresh warning:', e);
      setBackendOnline(false);
    }
  }, []);

  const loadExternalApis = useCallback(async () => {
    try {
      const curr = await getCurrencyRates('INR');
      setCurrencyData(curr);
    } catch (e) {
      console.warn('Currency rates warning:', e);
    }

    try {
      setLoadingCountries(true);
      const c = await getCountries(selectedRegion);
      setCountries(c.slice(0, 10));
    } catch (e) {
      console.warn('Countries warning:', e);
    } finally {
      setLoadingCountries(false);
    }
  }, [selectedRegion]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    loadExternalApis();
  }, [loadExternalApis]);

  const showNotification = (type, text, details = null) => {
    setStatusMessage({ type, text, details });
  };

  const handleDrag = (e, format, isOver) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [format]: isOver }));
  };

  const handleDrop = (e, format, setFileFn) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [format]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileFn(file);
    }
  };

  const handleIngestJson = async () => {
    setLoadingAction('json');
    setStatusMessage(null);
    try {
      const res = await ingestJson(jsonFile || {});
      if (res && res.success) {
        showNotification('success', `JSON Ingestion Succeeded: Processed ${res.ordersIngested ?? 0} orders.`);
        setLastResult({
          format: 'JSON (Orders)',
          ingested: res.ordersIngested ?? 0,
          normalizedRows: res.normalizedRows ?? 0,
          message: res.message || 'Orders parsed, flattened, and merged into SQLite database.'
        });
        refreshStatus();
        setJsonFile(null);
      } else {
        const errorText = res?.error || res?.message || 'JSON validation failed.';
        showNotification('error', `JSON Ingestion Failed: ${errorText}`, { format: 'JSON', file: jsonFile?.name });
      }
    } catch (err) {
      showNotification('error', `JSON Ingestion Error: ${err.message}`, { format: 'JSON' });
    } finally {
      setLoadingAction('');
    }
  };

  const handleIngestCsv = async () => {
    setLoadingAction('csv');
    setStatusMessage(null);
    try {
      const res = await ingestCsv(csvFile || '');
      if (res && res.success) {
        showNotification('success', `CSV Ingestion Succeeded: Processed ${res.productsIngested ?? 0} catalog products.`);
        setLastResult({
          format: 'CSV (Products)',
          ingested: res.productsIngested ?? 0,
          normalizedRows: res.normalizedRows ?? 0,
          message: res.message || 'Products CSV parsed, headers sanitized, and persisted.'
        });
        refreshStatus();
        setCsvFile(null);
      } else {
        const errorText = res?.error || res?.message || 'CSV validation failed.';
        showNotification('error', `CSV Ingestion Failed: ${errorText}`, { format: 'CSV', file: csvFile?.name });
      }
    } catch (err) {
      showNotification('error', `CSV Ingestion Error: ${err.message}`, { format: 'CSV' });
    } finally {
      setLoadingAction('');
    }
  };

  const handleIngestXml = async () => {
    setLoadingAction('xml');
    setStatusMessage(null);
    try {
      const res = await ingestXml(xmlFile || '');
      if (res && res.success) {
        showNotification('success', `XML Ingestion Succeeded: Processed ${res.shipmentsIngested ?? 0} carrier shipment updates.`);
        setLastResult({
          format: 'XML (Shipments)',
          ingested: res.shipmentsIngested ?? 0,
          normalizedRows: res.normalizedRows ?? 0,
          message: res.message || 'XML tree unpacked, delivery dates calculated, and status synchronized.'
        });
        refreshStatus();
        setXmlFile(null);
      } else {
        const errorText = res?.error || res?.message || 'XML validation failed.';
        showNotification('error', `XML Ingestion Failed: ${errorText}`, { format: 'XML', file: xmlFile?.name });
      }
    } catch (err) {
      showNotification('error', `XML Ingestion Error: ${err.message}`, { format: 'XML' });
    } finally {
      setLoadingAction('');
    }
  };

  const handleSeedDemo = async () => {
    setLoadingAction('seed');
    setStatusMessage(null);
    try {
      const res = await seedDemoData();
      if (res && res.success) {
        showNotification('success', `Rich Benchmark Dataset Seeded: Populated ${res.rawOrders || 42} orders across January.`);
        setLastResult({
          format: 'Full Baseline Seed',
          ingested: res.rawOrders || 42,
          normalizedRows: (res.rawOrders || 42) * 2,
          message: 'Relational SQLite seed restored with rich January orders, catalog items, and delivery telemetry.'
        });
        refreshStatus();
      } else {
        showNotification('error', `Seed Initialization Failed: ${res.error || 'Unknown error'}`);
      }
    } catch (err) {
      showNotification('error', `Seed Error: ${err.message}`);
    } finally {
      setLoadingAction('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Relational Storage Status (SQLite WAL) */}
      <div className="bg-white rounded-xl border border-border p-5 sm:p-6 shadow-xs hover:shadow-card transition-shadow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Database size={16} />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Relational Database Storage (SQLite)
              </h3>
              <Badge variant={backendOnline ? 'success' : 'default'} size="xs">
                {backendOnline ? 'Live Backend' : 'In-Memory / SQLite Simulator'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Target Storage: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700 font-medium">backend/data/analytics.db</code> • WAL Concurrency Mode
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSeedDemo}
              disabled={loadingAction === 'seed'}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              <Sparkles size={14} className={loadingAction === 'seed' ? 'animate-spin' : ''} />
              <span>{loadingAction === 'seed' ? 'Seeding Dataset...' : 'Seed Rich Demo Dataset'}</span>
            </button>
            <button
              onClick={refreshStatus}
              className="p-2 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
              title="Refresh database count"
              aria-label="Refresh database status"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Database Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/60">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Orders</span>
            <p className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
              {dbStats ? formatNumber(dbStats.orders) : '—'}
            </p>
          </div>
          <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/60">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Products</span>
            <p className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
              {dbStats ? formatNumber(dbStats.products) : '—'}
            </p>
          </div>
          <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/60">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Customers</span>
            <p className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
              {dbStats ? formatNumber(dbStats.customers) : '—'}
            </p>
          </div>
          <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/60">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Shipments</span>
            <p className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
              {dbStats ? formatNumber(dbStats.shipments) : '—'}
            </p>
          </div>
          <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/60">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Order Items</span>
            <p className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
              {dbStats ? formatNumber(dbStats.orderItems) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Floating Status Notification */}
      {statusMessage && (
        <div 
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-xs sm:text-sm animate-in fade-in duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
              : 'bg-rose-50/90 border-rose-200 text-rose-900'
          }`}
          role="alert"
        >
          <div className="flex items-start gap-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold text-xs sm:text-sm">{statusMessage.text}</p>
              {statusMessage.details && (
                <p className="text-xs opacity-80 mt-0.5">
                  Target pipeline: {statusMessage.details.format}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Recent Processing Summary (if available) */}
      {lastResult && (
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <FileCheck2 size={18} className="text-indigo-600 shrink-0" />
            <div>
              <span className="font-bold text-indigo-950">Latest ETL Execution: {lastResult.format}</span>
              <p className="text-indigo-800 text-[11px] mt-0.5">{lastResult.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="px-2 py-0.5 rounded bg-white text-indigo-700 font-semibold border border-indigo-200">
              +{lastResult.ingested} records
            </span>
            <span className="px-2 py-0.5 rounded bg-white text-slate-600 font-medium border border-indigo-200">
              {lastResult.normalizedRows} rows mapped
            </span>
          </div>
        </div>
      )}

      {/* Ingestion Cards Grid (JSON, CSV, XML) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: JSON Orders */}
        <div className="bg-white rounded-xl border border-border p-5 sm:p-6 shadow-xs hover:shadow-card transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  JSON
                </span>
                <span className="font-bold text-slate-900 text-sm">Nested Orders</span>
              </div>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                .json
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Flattens nested customer objects, validates order lines, strips outer escaped quotes, and updates total revenue.
            </p>

            {/* Dropzone */}
            <div
              onDragOver={(e) => handleDrag(e, 'json', true)}
              onDragLeave={(e) => handleDrag(e, 'json', false)}
              onDrop={(e) => handleDrop(e, 'json', setJsonFile)}
              className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                dragActive.json 
                  ? 'border-indigo-500 bg-indigo-50/50' 
                  : jsonFile 
                  ? 'border-indigo-300 bg-indigo-50/30' 
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                accept=".json"
                id="json-file-input"
                className="hidden"
                onChange={(e) => setJsonFile(e.target.files[0] || null)}
              />

              {jsonFile ? (
                <div className="flex items-center justify-between gap-2 text-left">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCode size={20} className="text-indigo-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{jsonFile.name}</p>
                      <p className="text-[10px] text-slate-400">{formatFileSize(jsonFile.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setJsonFile(null)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                    title="Remove file"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label htmlFor="json-file-input" className="cursor-pointer block py-2">
                  <Upload size={20} className="mx-auto text-slate-400 mb-1.5" />
                  <p className="text-xs font-semibold text-slate-700">Choose or Drop JSON File</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Supports nested or flat format (Max 5MB)</p>
                </label>
              )}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={handleIngestJson}
              disabled={loadingAction === 'json'}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-colors shadow-xs"
            >
              {loadingAction === 'json' ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <ArrowRight size={14} />
              )}
              <span>{jsonFile ? 'Ingest Uploaded JSON' : 'Ingest Sample Batch'}</span>
            </button>
            <span className="block text-center font-mono text-[10px] text-slate-400 mt-2">
              POST /api/ingest/json
            </span>
          </div>
        </div>

        {/* Card 2: CSV Products */}
        <div className="bg-white rounded-xl border border-border p-5 sm:p-6 shadow-xs hover:shadow-card transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  CSV
                </span>
                <span className="font-bold text-slate-900 text-sm">Product Catalog</span>
              </div>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                .csv
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Strips UTF-8 BOM headers, parses delimited columns (ProductID, Category, Price, Stock), and updates SKU index.
            </p>

            {/* Dropzone */}
            <div
              onDragOver={(e) => handleDrag(e, 'csv', true)}
              onDragLeave={(e) => handleDrag(e, 'csv', false)}
              onDrop={(e) => handleDrop(e, 'csv', setCsvFile)}
              className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                dragActive.csv 
                  ? 'border-emerald-500 bg-emerald-50/50' 
                  : csvFile 
                  ? 'border-emerald-300 bg-emerald-50/30' 
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                accept=".csv"
                id="csv-file-input"
                className="hidden"
                onChange={(e) => setCsvFile(e.target.files[0] || null)}
              />

              {csvFile ? (
                <div className="flex items-center justify-between gap-2 text-left">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileSpreadsheet size={20} className="text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{csvFile.name}</p>
                      <p className="text-[10px] text-slate-400">{formatFileSize(csvFile.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCsvFile(null)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                    title="Remove file"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label htmlFor="csv-file-input" className="cursor-pointer block py-2">
                  <Upload size={20} className="mx-auto text-slate-400 mb-1.5" />
                  <p className="text-xs font-semibold text-slate-700">Choose or Drop CSV File</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Comma-separated catalog (Max 5MB)</p>
                </label>
              )}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={handleIngestCsv}
              disabled={loadingAction === 'csv'}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 transition-colors shadow-xs"
            >
              {loadingAction === 'csv' ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <ArrowRight size={14} />
              )}
              <span>{csvFile ? 'Ingest Uploaded CSV' : 'Ingest Sample Catalog'}</span>
            </button>
            <span className="block text-center font-mono text-[10px] text-slate-400 mt-2">
              POST /api/ingest/csv
            </span>
          </div>
        </div>

        {/* Card 3: XML Shipments */}
        <div className="bg-white rounded-xl border border-border p-5 sm:p-6 shadow-xs hover:shadow-card transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">
                  XML
                </span>
                <span className="font-bold text-slate-900 text-sm">Shipment Telemetry</span>
              </div>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                .xml
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Unpacks XML trees (&lt;shipments&gt;), standardizes singular vs list nodes, flags carrier transit delays (&gt;5 days).
            </p>

            {/* Dropzone */}
            <div
              onDragOver={(e) => handleDrag(e, 'xml', true)}
              onDragLeave={(e) => handleDrag(e, 'xml', false)}
              onDrop={(e) => handleDrop(e, 'xml', setXmlFile)}
              className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                dragActive.xml 
                  ? 'border-amber-500 bg-amber-50/50' 
                  : xmlFile 
                  ? 'border-amber-300 bg-amber-50/30' 
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                accept=".xml"
                id="xml-file-input"
                className="hidden"
                onChange={(e) => setXmlFile(e.target.files[0] || null)}
              />

              {xmlFile ? (
                <div className="flex items-center justify-between gap-2 text-left">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={20} className="text-amber-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{xmlFile.name}</p>
                      <p className="text-[10px] text-slate-400">{formatFileSize(xmlFile.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setXmlFile(null)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                    title="Remove file"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label htmlFor="xml-file-input" className="cursor-pointer block py-2">
                  <Upload size={20} className="mx-auto text-slate-400 mb-1.5" />
                  <p className="text-xs font-semibold text-slate-700">Choose or Drop XML File</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Structured shipment dispatch tree (Max 5MB)</p>
                </label>
              )}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={handleIngestXml}
              disabled={loadingAction === 'xml'}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 transition-colors shadow-xs"
            >
              {loadingAction === 'xml' ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <ArrowRight size={14} />
              )}
              <span>{xmlFile ? 'Ingest Uploaded XML' : 'Ingest Sample Shipments'}</span>
            </button>
            <span className="block text-center font-mono text-[10px] text-slate-400 mt-2">
              POST /api/ingest/xml
            </span>
          </div>
        </div>
      </div>

      {/* External API Integration Showcase (Full Width) */}
      <div className="bg-white rounded-xl border border-border p-5 sm:p-6 shadow-xs hover:shadow-card transition-shadow">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Globe size={16} className="text-indigo-600" />
              <span>External Service Integrations</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live multi-currency conversion and international demographic enrichment
            </p>
          </div>
          <Badge variant="indigo" size="xs">
            Public APIs (Cached)
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Frankfurter Currency API */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Frankfurter Currency Engine
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Live Rates
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Fetches real-time European Central Bank foreign exchange rates with resilient 1-hour cache and offline fallback.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-white p-3 rounded-lg border border-slate-200/80 text-center shadow-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">1 INR → EUR</span>
                <p className="text-base font-bold text-slate-900 mt-1 tabular-nums">
                  €{currencyData?.rates?.EUR ? currencyData.rates.EUR.toFixed(4) : '0.0092'}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200/80 text-center shadow-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">1 INR → USD</span>
                <p className="text-base font-bold text-slate-900 mt-1 tabular-nums">
                  ${currencyData?.rates?.USD ? currencyData.rates.USD.toFixed(4) : '0.0120'}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200/80 text-center shadow-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Base Currency</span>
                <p className="text-base font-bold text-indigo-700 mt-1">
                  INR (₹)
                </p>
              </div>
            </div>
          </div>

          {/* REST Countries Demographics */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Demographic Intelligence
              </span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Regions</option>
                <option value="Asia">Asia</option>
                <option value="Europe">Europe</option>
                <option value="Americas">Americas</option>
                <option value="Africa">Africa</option>
                <option value="Oceania">Oceania</option>
              </select>
            </div>

            {loadingCountries ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                Fetching regional demographic data...
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {countries.map(c => (
                  <div key={c.name} className="flex items-center justify-between p-2 bg-white border border-slate-200/80 rounded-lg text-xs shadow-xs">
                    <span className="font-semibold text-slate-900 truncate max-w-[120px]">{c.name}</span>
                    <span className="text-slate-500 text-[11px]">{c.region}</span>
                    <span className="font-medium text-slate-700 tabular-nums">
                      {(c.population / 1000000).toFixed(1)}M pop
                    </span>
                    <span className="font-mono text-indigo-700 font-bold text-[11px]">
                      {c.currencies}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelinePage;
