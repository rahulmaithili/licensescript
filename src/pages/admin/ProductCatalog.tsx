import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  getProducts,
  saveProduct,
  deleteProduct,
} from '@/services/productService';
import type { Product } from '@/types';

type Banner = { type: 'success' | 'error'; message: string } | null;

// Features are edited one-per-line in the form, but also accept
// comma-separated input — always store a clean string[].
function parseFeatures(text: string): string[] {
  return text
    .split(/[\n,]/)
    .map((f) => f.trim())
    .filter((f) => f !== '');
}

function featuresToText(features?: string[] | string): string {
  if (Array.isArray(features)) return features.join('\n');
  return features || '';
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const inputCls =
  'w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E40FF]';
const primaryBtn =
  'px-4 py-2.5 rounded-full bg-[#1E40FF] hover:bg-[#1740D6] disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-[#1E40FF]/30 transition-all flex items-center gap-2';

export const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Browser Extension');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('v1.0.0');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [features, setFeatures] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setModalError(null);
    setName('');
    setSlug('');
    setCategory('Browser Extension');
    setShortDesc('');
    setDescription('');
    setVersion('v1.0.0');
    setDownloadUrl('');
    setLogoUrl('');
    setFeatures('');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setModalError(null);
    setName(p.name);
    setSlug(p.slug);
    setCategory(p.category);
    setShortDesc(p.short_description || '');
    setDescription(p.description || '');
    setVersion(p.version || 'v1.0.0');
    setDownloadUrl(p.download_url || '');
    setLogoUrl(p.logo_url || '');
    setFeatures(featuresToText(p.features));
    setIsActive(p.is_active);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    const finalSlug = slugify(slug || name);
    if (!finalSlug) {
      setModalError('Product name must contain letters or numbers so a slug can be generated.');
      return;
    }
    const payload: Partial<Product> = {
      id: editingProduct?.id,
      name: name.trim(),
      slug: finalSlug,
      category,
      short_description: shortDesc,
      description,
      version,
      download_url: downloadUrl,
      logo_url: logoUrl,
      features: parseFeatures(features),
      is_active: isActive,
      sort_order: editingProduct ? editingProduct.sort_order : products.length + 1,
    };

    setIsSaving(true);
    try {
      const res = await saveProduct(payload);
      if (!res.success) {
        // Keep the modal open and show the real error — never pretend it saved.
        setModalError(res.error || 'Could not save this product. Please try again.');
        return;
      }
      setModalOpen(false);
      setBanner({
        type: 'success',
        message: editingProduct ? `“${payload.name}” updated.` : `“${payload.name}” added to the catalog.`,
      });
      await loadProducts();
    } catch (err: any) {
      setModalError(err?.message || 'Could not save this product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, productName: string) => {
    if (!window.confirm('Delete this product permanently?')) return;
    setBanner(null);
    try {
      const ok = await deleteProduct(id);
      if (!ok) {
        setBanner({ type: 'error', message: `Could not delete “${productName}”. It is still in the catalog.` });
        return;
      }
      setBanner({ type: 'success', message: `“${productName}” deleted.` });
      await loadProducts();
    } catch (err: any) {
      setBanner({ type: 'error', message: err?.message || `Could not delete “${productName}”.` });
    }
  };

  const handleToggleActive = async (product: Product) => {
    setBanner(null);
    try {
      const res = await saveProduct({ ...product, is_active: !product.is_active });
      if (!res.success) {
        setBanner({
          type: 'error',
          message: res.error || `Could not ${product.is_active ? 'deactivate' : 'activate'} “${product.name}”.`,
        });
        return;
      }
      setBanner({
        type: 'success',
        message: `“${product.name}” is now ${!product.is_active ? 'active' : 'a draft'}.`,
      });
      await loadProducts();
    } catch (err: any) {
      setBanner({ type: 'error', message: err?.message || `Could not update “${product.name}”.` });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1330] dark:text-white flex items-center gap-2.5">
            <Package className="w-8 h-8 text-[#1E40FF] dark:text-[#8fa0ff]" />
            Product Catalog
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage browser extensions, automation scripts, binaries, and version downloads.
          </p>
        </div>

        <button onClick={openCreateModal} className={primaryBtn}>
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {banner && (
        <div
          className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm ${
            banner.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
          }`}
          role={banner.type === 'error' ? 'alert' : 'status'}
        >
          {banner.type === 'success' ? (
            <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          )}
          <span className="flex-1">{banner.message}</span>
          <button onClick={() => setBanner(null)} className="text-current opacity-70 hover:opacity-100" aria-label="Dismiss">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Loading products">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl animate-pulse">
              <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full mb-4" />
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              </div>
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded mb-2" />
              <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-10 sm:p-14 text-center shadow-sm dark:shadow-xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#EEF1FF] flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-[#1E40FF]" />
          </div>
          <h2 className="text-lg font-bold text-[#0A1330] dark:text-white">No products yet</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto">
            Your catalog is empty. Add your first product to start creating pricing plans and selling licenses.
          </p>
          <button onClick={openCreateModal} className={`${primaryBtn} mx-auto mt-6`}>
            <Plus className="w-4 h-4" />
            <span>Add Your First Product</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1E40FF]/10 text-[#1E40FF] dark:text-[#8fa0ff] border border-[#1E40FF]/25">
                    {product.category}
                  </span>
                  <button
                    onClick={() => handleToggleActive(product)}
                    title={product.is_active ? 'Click to move to draft' : 'Click to activate'}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                      product.is_active
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {product.is_active ? 'Active' : 'Draft'}
                  </button>
                </div>

                <div className="flex items-center gap-3.5 mb-3">
                  {product.logo_url ? (
                    <img
                      src={product.logo_url}
                      alt={product.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-slate-800 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-[#EEF1FF] flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6 text-[#1E40FF]" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-[#0A1330] dark:text-white text-base leading-tight">{product.name}</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{product.version || 'v1.0.0'}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                  {product.short_description || product.description}
                </p>

                {product.features && product.features.length > 0 && (
                  <div className="space-y-1.5 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    {product.features.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#1E40FF] dark:text-[#8fa0ff] shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                {product.download_url ? (
                  <a
                    href={product.download_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#1E40FF] dark:text-[#8fa0ff] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Build
                  </a>
                ) : (
                  <span className="text-xs text-slate-500 dark:text-slate-400">No binary URL</span>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(product)}
                    className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#0A1330] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Edit Product"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add/Edit Product */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-500 dark:text-slate-400 hover:text-[#0A1330] dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-[#0A1330] dark:text-white mb-1">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Set product name, extension binary url, and marketing features.</p>

            {modalError && (
              <div className="flex items-start gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300 mb-4" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!editingProduct) setSlug(slugify(e.target.value));
                    }}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                    <option value="Browser Extension">Browser Extension (.crx)</option>
                    <option value="Automation Script">Automation Script (Python/Node)</option>
                    <option value="Desktop Application">Desktop Application (.exe/.msi)</option>
                    <option value="Web SaaS Tool">Web SaaS Tool</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="auto-generated-from-name"
                  className={`${inputCls} font-mono`}
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Used in the storefront URL. Leave the auto-generated value unless you need a custom one.</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Short Headline</label>
                <input type="text" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} className={inputCls} />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Description</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Version Tag</label>
                  <input type="text" value={version} onChange={(e) => setVersion(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Download URL</label>
                  <input
                    type="url"
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    placeholder="https://…"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Logo URL</label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://… (optional)"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Key Features (One per line, or comma-separated)</label>
                <textarea
                  rows={3}
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder={'Instant key delivery\nMulti-device hardware binding'}
                  className={`${inputCls} font-mono`}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 accent-[#1E40FF]"
                />
                <label htmlFor="isActive" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                  Product is Active & visible in storefront
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-full bg-[#1E40FF] hover:bg-[#1740D6] disabled:opacity-50 text-white font-semibold shadow-lg shadow-[#1E40FF]/30 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? 'Saving…' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
