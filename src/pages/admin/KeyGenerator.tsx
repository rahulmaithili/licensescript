import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import {
  generateBulkKeys,
  verifyAndTestKey,
} from '@/services/keyGeneratorService';
import { getProducts, getPlans } from '@/services/productService';
import { copyToClipboard, formatDate } from '@/lib/utils';
import type { Product, Plan } from '@/types';

export const KeyGenerator: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');

  // Generation options
  const [prefix, setPrefix] = useState('LW');
  const [segments, setSegments] = useState(4);
  const [segmentLength, setSegmentLength] = useState(4);
  const [charset, setCharset] = useState<'alphanumeric' | 'alpha' | 'numeric' | 'hex'>('alphanumeric');
  const [quantity, setQuantity] = useState(10);
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Key Tester
  const [testKeyInput, setTestKeyInput] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    getProducts().then((p) => {
      setProducts(p);
      if (p.length > 0) setSelectedProduct(p[0].id);
    });
    getPlans().then((pl) => setPlans(pl));
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
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
    }
    setIsGenerating(false);
  };

  const handleCopy = async (key: string) => {
    await copyToClipboard(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExportCSV = () => {
    if (generatedKeys.length === 0) return;
    const prod = products.find((p) => p.id === selectedProduct)?.name || 'Product';
    const csvContent =
      'Index,License Key,Product,Created At\n' +
      generatedKeys
        .map((k, i) => `"${i + 1}","${k}","${prod}","${new Date().toISOString()}"`)
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LicenseWala-Keys-${prefix}-${Date.now()}.csv`;
    a.click();
  };

  const handleTestKey = async () => {
    if (!testKeyInput.trim()) return;
    setIsTesting(true);
    const res = await verifyAndTestKey(testKeyInput.trim());
    setTestResult(res);
    setIsTesting(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <KeyRound className="w-8 h-8 text-indigo-400" />
          Cryptographic Key Generator
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Generate cryptographically secure software license keys in bulk (up to 1,000 keys) with custom prefixes and segment formats.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generator Controls */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Generation Parameters
          </h2>

          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Target Product</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Key Prefix</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                  placeholder="LW, WA, TG"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min={1}
                  max={1000}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Segments</label>
                <input
                  type="number"
                  value={segments}
                  onChange={(e) => setSegments(Number(e.target.value))}
                  min={2}
                  max={6}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Segment Length</label>
                <input
                  type="number"
                  value={segmentLength}
                  onChange={(e) => setSegmentLength(Number(e.target.value))}
                  min={3}
                  max={8}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Character Set</label>
              <select
                value={charset}
                onChange={(e) => setCharset(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value="alphanumeric">Alphanumeric (No 0/O/1/I)</option>
                <option value="alpha">Letters Only (A-Z)</option>
                <option value="numeric">Numbers Only (0-9)</option>
                <option value="hex">Hexadecimal (0-F)</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Default excludes ambiguous characters like 0, O, 1, I to eliminate customer typos.
              </span>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3 mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
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
        </div>

        {/* Generated Keys Display */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col h-[400px]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Generated Pool Stock</h3>
                <span className="text-xs text-slate-400">
                  {generatedKeys.length > 0
                    ? `${generatedKeys.length} keys ready in memory & database pool`
                    : 'Click generate to produce new batch'}
                </span>
              </div>
              {generatedKeys.length > 0 && (
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export All (.CSV)
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2 font-mono text-xs">
              {generatedKeys.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <KeyRound className="w-10 h-10 mb-2 opacity-40" />
                  <p>No keys generated yet. Use the parameters on the left.</p>
                </div>
              ) : (
                generatedKeys.map((k, index) => (
                  <div
                    key={k}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-indigo-300"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-[10px] w-6">{index + 1}.</span>
                      <span className="font-bold">{k}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(k)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                      title="Copy Key"
                    >
                      {copiedKey === k ? (
                        <Check className="w-4 h-4 text-emerald-400" />
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Live Key Verification Tester
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Paste any license key to test hardware binding, expiry status, and assigned customer details.
            </p>

            <div className="flex gap-3">
              <input
                type="text"
                value={testKeyInput}
                onChange={(e) => setTestKeyInput(e.target.value)}
                placeholder="Enter license key, e.g. LW-WAPRO-7K9A-4M2X-88PL"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleTestKey}
                disabled={isTesting}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30"
              >
                {isTesting ? 'Testing...' : 'Verify Key'}
              </button>
            </div>

            {testResult && (
              <div className="mt-4 p-4 rounded-2xl border text-xs space-y-2 bg-slate-800/80 border-slate-700">
                {testResult.exists ? (
                  <div>
                    <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Valid & Verified Key ({testResult.type.replace('_', ' ').toUpperCase()})</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>Product: <strong className="text-white">{testResult.data.product?.name || 'N/A'}</strong></div>
                      <div>Status: <strong className="uppercase text-emerald-400">{testResult.data.status}</strong></div>
                      <div>Owner: <strong className="text-white">{testResult.data.user?.full_name || 'Stock Pool'}</strong></div>
                      <div>Expires: <strong className="text-white">{formatDate(testResult.data.expiry_date)}</strong></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
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
