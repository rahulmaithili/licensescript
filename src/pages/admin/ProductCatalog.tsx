import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Check,
  X,
  Layers,
  Sparkles,
  Download,
} from 'lucide-react';
import {
  getProducts,
  saveProduct,
  deleteProduct,
} from '@/services/productService';
import type { Product } from '@/types';

export const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    const data = await getProducts();
    setProducts(data);
    setIsLoading(false);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSlug('');
    setCategory('Browser Extension');
    setShortDesc('');
    setDescription('');
    setVersion('v1.0.0');
    setDownloadUrl('https://github.com/rahulmaithili/licensescript/releases');
    setLogoUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120&fit=crop');
    setFeatures('Multi-device Hardware Binding\nAnti-ban protection\nInstant key delivery');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSlug(p.slug);
    setCategory(p.category);
    setShortDesc(p.short_description || '');
    setDescription(p.description || '');
    setVersion(p.version || 'v1.0.0');
    setDownloadUrl(p.download_url || '');
    setLogoUrl(p.logo_url || '');
    setFeatures(p.features ? p.features.join('\n') : '');
    setIsActive(p.is_active);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<Product> = {
      id: editingProduct?.id,
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category,
      short_description: shortDesc,
      description,
      version,
      download_url: downloadUrl,
      logo_url: logoUrl,
      features: features.split('\n').filter((f) => f.trim() !== ''),
      is_active: isActive,
      sort_order: editingProduct ? editingProduct.sort_order : products.length + 1,
    };

    const res = await saveProduct(payload);
    if (res.success) {
      setModalOpen(false);
      loadProducts();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product permanently?')) return;
    await deleteProduct(id);
    loadProducts();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Package className="w-8 h-8 text-indigo-400" />
            Product Catalog
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage browser extensions, automation scripts, binaries, and version downloads.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {product.category}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  product.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {product.is_active ? 'Active' : 'Draft'}
                </span>
              </div>

              <div className="flex items-center gap-3.5 mb-3">
                <img
                  src={product.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120&fit=crop'}
                  alt={product.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-800 shrink-0"
                />
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">{product.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">{product.version || 'v1.0.0'}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                {product.short_description || product.description}
              </p>

              {product.features && product.features.length > 0 && (
                <div className="space-y-1.5 py-3 border-t border-slate-800 text-xs text-slate-400">
                  {product.features.slice(0, 3).map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              {product.download_url ? (
                <a
                  href={product.download_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Build
                </a>
              ) : (
                <span className="text-xs text-slate-500">No binary URL</span>
              )}

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(product)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  title="Edit Product"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                  title="Delete Product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add/Edit Product */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-1">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-xs text-slate-400 mb-6">Set product name, extension binary url, and marketing features.</p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Browser Extension">Browser Extension (.crx)</option>
                    <option value="Automation Script">Automation Script (Python/Node)</option>
                    <option value="Desktop Application">Desktop Application (.exe/.msi)</option>
                    <option value="Web SaaS Tool">Web SaaS Tool</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Short Headline</label>
                <input
                  type="text"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Version Tag</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Download URL</label>
                  <input
                    type="url"
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Key Features (One per line)</label>
                <textarea
                  rows={3}
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700"
                />
                <label htmlFor="isActive" className="text-slate-300 font-semibold cursor-pointer">
                  Product is Active & visible in storefront
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
