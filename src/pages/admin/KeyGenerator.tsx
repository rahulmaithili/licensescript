import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  KeyRound,
  Download,
  Copy,
  Check,
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  generateBulkKeys,
  verifyAndTestKey,
} from '@/services/keyGeneratorService';
import { getProducts, getPlans } from '@/services/productService';
import { copyToClipboard, formatDate, formatDateTime, getPlanDisplay } from '@/lib/utils';
import type { Product, Plan } from '@/types';

export const KeyGenerator: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Generation options
  const [prefix, setPrefix] = useState('LW');
  const [segments, setSegments] = useState(4);
  const [segmentLength, setSegmentLength] = useState(4);
  const [charset, setCharset] = useState<'alphanumeric' | 'alpha' | 'numeric' | 'hex'>('alphanumeric');
  const [quantity, setQuantity] = useState(10);
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateSuccess, setGenerateSuccess] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [keySearch, setKeySearch] = useState('');

  // Key Tester
  const [testKeyInput, setTestKeyInput] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setIsLoadingCatalog(true);
    setLoadError(null);
    try {
      const [p, pl] = await Promise.all([getProducts(), getPlans()]);
      setProducts(p);
      setPlans(pl);
      if (p.length > 0) setSelectedProduct((prev) => prev || p[0].id);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load products and plans. Please retry.');
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  const plansForProduct = plans.filter((p) => !selectedProduct || p.product_id === selectedProduct);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerateError(null);
    setGenerateSuccess(null);
    if (!selectedProduct) {
      setGenerateError('Select a product first. Keys must belong to a real product in the catalog.');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await generateBulkKeys({
        prefix,
        segments: Number(segments),
        segmentLength: Number(segmentLength),
        charset,
        productId: selectedProduct,
        planId: selectedPlan || undefined,
        quantity: Number(quantity),
      });
      if (res.success) {
        setGeneratedKeys(res.keys);
        setKeySearch('');
        setGenerateSuccess(
          `${res.keys.length} key${res.keys.length === 1 ? '' : 's'} generated and saved to the license key pool.`
        );
      } else {
        // Keys that could not be saved to the pool must never be shown as usable stock
        setGeneratedKeys([]);
        setGenerateError(res.error || 'Keys could not be saved to the key pool. No keys were generated.');
      }
    } catch (err: any) {
      setGeneratedKeys([]);
      setGenerateError(err?.message || 'Key generation failed. No keys were generated.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (key: string) => {
    await copyToClipboard(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyAll = async () => {
    if (generatedKeys.length === 0) return;
    await copyToClipboard(generatedKeys.join('\n'));
    setCopiedKey('__all__');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleClearKeys = () => {
    setGeneratedKeys([]);
    setKeySearch('');
    setGenerateSuccess(null);
    setGenerateError(null);
  };

  const handleExportCSV = () => {
    if (generatedKeys.length === 0) return;
    const prod = products.find((p) => p.id === selectedProduct)?.name || 'Product';
    const plan = plans.find((p) => p.id === selectedPlan);
    const csvContent =
      'Index,License Key,Product,Plan,Created At\n' +
      generatedKeys
        .map(
          (k, i) =>
            `"${i + 1}","${k}","${prod}","${plan ? plan.name : ''}","${formatDateTime(new Date().toISOString())}"`
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LicenseWala-Keys-${prefix}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTestKey = async () => {
    if (!testKeyInput.trim()) {
      setTestError('Paste a license key to verify.');
      setTestResult(null);
      return;
    }
    setIsTesting(true);
    setTestError(null);
    try {
      const res = await verifyAndTestKey(testKeyInput.trim());
      setTestResult(res);
    } catch (err: any) {
      setTestResult(null);
      setTestError(err?.message || 'Verification failed. Please try again.');
    } finally {
      setIsTesting(false);
    }
  };

  const visibleKeys = generatedKeys.filter((k) =>
    k.toLowerCase().includes(keySearch.trim().toLowerCase())
  );

  const inputCls =
    'w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E40FF]';

  const testData = testResult?.data;
  const testPlan = testData?.plan;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1330] dark:text-white flex items-center gap-2.5">
          <KeyRound className="w-8 h-8 text-[#1E40FF] dark:text-[#8fa0ff]" />
          Cryptographic Key Generator
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Generate cryptographically secure software license keys in bulk (up to 1,000 keys) with custom prefixes and segment formats.
        </p>
      </div>

      {loadError && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 px-5 py-3 text-sm font-medium flex items-center justify-between gap-3">
          <span>{loadError}</span>
          <button onClick={loadCatalog} className="px-3 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 dark:text-rose-200 text-xs font-bold shrink-0">
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generator Controls */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl">
          <h2 className="text-lg font-bold text-[#0A1330] dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#1E40FF] dark:text-[#8fa0ff]" />
            Generation Parameters
          </h2>

          {isLoadingCatalog ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500 dark:text-slate-400" aria-busy="true">
              <span className="w-8 h-8 border-2 border-slate-300 dark:border-slate-700 border-t-[#1E40FF] rounded-full animate-spin" />
              <p className="text-xs font-medium">Loading products & plans…</p>
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Product</label>
                {products.length === 0 ? (
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 px-4 py-3">
                    No products exist yet. <Link to="/admin/products" className="underline font-bold">Create a product</Link> before generating keys.
                  </div>
                ) : (
                  <select
                    value={selectedProduct}
                    onChange={(e) => { setSelectedProduct(e.target.value); setSelectedPlan(''); }}
                    className={inputCls}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Plan (optional)</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className={inputCls}
                  disabled={products.length === 0}
                >
                  <option value="">No plan — unassigned pool keys</option>
                  {plansForProduct.map((p) => {
                    const display = getPlanDisplay(p);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} — {display.periodLabel} ({display.durationLabel})
                      </option>
                    );
                  })}
                </select>
                {selectedProduct && plansForProduct.length === 0 && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">No plans for this product yet; keys will be saved without a plan.</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Key Prefix</label>
                  <input
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                    placeholder="LW, WA, TG"
                    className={`${inputCls} font-mono uppercase`}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min={1}
                    max={1000}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Segments</label>
                  <input
                    type="number"
                    value={segments}
                    onChange={(e) => setSegments(Number(e.target.value))}
                    min={2}
                    max={6}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Segment Length</label>
                  <input
                    type="number"
                    value={segmentLength}
                    onChange={(e) => setSegmentLength(Number(e.target.value))}
                    min={3}
                    max={8}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Character Set</label>
                <select
                  value={charset}
                  onChange={(e) => setCharset(e.target.value as typeof charset)}
                  className={inputCls}
                >
                  <option value="alphanumeric">Alphanumeric (No 0/O/1/I)</option>
                  <option value="alpha">Letters Only (A-Z)</option>
                  <option value="numeric">Numbers Only (0-9)</option>
                  <option value="hex">Hexadecimal (0-F)</option>
                </select>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Default excludes ambiguous characters like 0, O, 1, I to eliminate customer typos.
                </span>
              </div>

              {generateError && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 px-4 py-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{generateError}</span>
                </div>
              )}
              {generateSuccess && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{generateSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isGenerating || products.length === 0}
                className="w-full py-3 mt-4 rounded-full bg-[#1E40FF] hover:bg-[#1740D6] disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-[#1E40FF]/30 flex items-center justify-center gap-2 transition-colors"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating Keys...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate {quantity} Keys
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Generated Keys Display */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col h-[440px]">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-[#0A1330] dark:text-white">Generated Pool Stock</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {generatedKeys.length > 0
                    ? `${generatedKeys.length} keys saved in the database pool${keySearch ? ` · ${visibleKeys.length} matching filter` : ''}`
                    : 'Click generate to produce a new batch'}
                </span>
              </div>
              {generatedKeys.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyAll}
                    className="px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-200 dark:border-slate-700"
                  >
                    {copiedKey === '__all__' ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy All
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-200 dark:border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export All (.CSV)
                  </button>
                  <button
                    onClick={handleClearKeys}
                    title="Clear generated keys from this view (pool records are not deleted)"
                    className="px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 hover:text-rose-600 dark:hover:text-rose-300 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-200 dark:border-slate-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                </div>
              )}
            </div>

            {generatedKeys.length > 0 && (
              <div className="relative pt-3">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 mt-1.5 text-slate-500 dark:text-slate-400" />
                <input
                  type="text"
                  value={keySearch}
                  onChange={(e) => setKeySearch(e.target.value)}
                  placeholder="Filter generated keys…"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E40FF] font-mono"
                />
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-3 space-y-2 font-mono text-xs">
              {generatedKeys.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400 px-6">
                  <KeyRound className="w-10 h-10 mb-2 opacity-40" />
                  <p className="font-sans text-sm font-semibold text-slate-600 dark:text-slate-400">No keys generated yet</p>
                  <p className="font-sans text-xs mt-1">Use the parameters on the left — keys only appear here after they are successfully saved to the pool.</p>
                </div>
              ) : visibleKeys.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400 px-6">
                  <Search className="w-10 h-10 mb-2 opacity-40" />
                  <p className="font-sans text-sm font-semibold text-slate-600 dark:text-slate-400">No generated keys match “{keySearch}”</p>
                  <button onClick={() => setKeySearch('')} className="font-sans mt-3 px-4 py-2 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700">
                    Clear Filter
                  </button>
                </div>
              ) : (
                visibleKeys.map((k) => (
                  <div
                    key={k}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#EEF1FF] dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-[#1E40FF] dark:text-[#8fa0ff]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-[10px] w-6">{generatedKeys.indexOf(k) + 1}.</span>
                      <span className="font-bold">{k}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(k)}
                      className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#0A1330] dark:hover:text-white"
                      title="Copy Key"
                    >
                      {copiedKey === k ? (
                        <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Key Tester Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl">
            <h3 className="text-base font-bold text-[#0A1330] dark:text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              Live Key Verification Tester
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Paste any license key to test hardware binding, expiry status, and assigned customer details.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={testKeyInput}
                onChange={(e) => setTestKeyInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleTestKey(); }}
                placeholder="Enter license key, e.g. LW-WAPRO-7K9A-4M2X-88PL"
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#1E40FF]"
              />
              <button
                onClick={handleTestKey}
                disabled={isTesting}
                className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30"
              >
                {isTesting ? 'Testing...' : 'Verify Key'}
              </button>
            </div>

            {testError && (
              <div className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 px-4 py-3 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{testError}</span>
              </div>
            )}

            {testResult && (
              <div className="mt-4 p-4 rounded-2xl border text-xs space-y-2 bg-[#EEF1FF] dark:bg-slate-800/80 border-slate-200 dark:border-slate-700">
                {testResult.exists && testData ? (
                  <div>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Valid & Verified Key ({String(testResult.type || '').replace('_', ' ').toUpperCase()})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                      <div>Product: <strong className="text-[#0A1330] dark:text-white">{testData.product?.name || 'N/A'}</strong></div>
                      <div>Status: <strong className="uppercase text-emerald-600 dark:text-emerald-400">{testData.status || 'N/A'}</strong></div>
                      {testResult.type === 'assigned_license' ? (
                        <>
                          <div>Owner: <strong className="text-[#0A1330] dark:text-white">{testData.user?.full_name || 'N/A'}</strong></div>
                          <div>Expires: <strong className="text-[#0A1330] dark:text-white">{formatDate(testData.expiry_date)}</strong></div>
                          <div>Devices: <strong className="text-[#0A1330] dark:text-white">{testData.current_devices ?? 0} / {testData.max_devices ?? '—'}</strong></div>
                        </>
                      ) : (
                        <>
                          <div>Owner: <strong className="text-[#0A1330] dark:text-white">Stock Pool (unassigned)</strong></div>
                          <div>Batch: <strong className="text-[#0A1330] dark:text-white">{testData.batch_id || 'N/A'}</strong></div>
                          <div>Created: <strong className="text-[#0A1330] dark:text-white">{formatDateTime(testData.created_at)}</strong></div>
                        </>
                      )}
                      {testPlan && (
                        <div>
                          Plan: <strong className="text-[#0A1330] dark:text-white">
                            {testPlan.name} · {getPlanDisplay(testPlan).periodLabel} ({getPlanDisplay(testPlan).durationLabel})
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold">
                    <XCircle className="w-4 h-4" />
                    <span>Key not found in database or invalid format.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
