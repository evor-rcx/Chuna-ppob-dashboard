const fs = require('fs');
let code = fs.readFileSync('src/components/views/KasirFisik.tsx', 'utf-8');

const oldCard = `{filteredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={\`bg-slate-800 border border-slate-700 rounded-xl p-4 text-left hover:border-blue-500 transition-colors cursor-pointer flex flex-col justify-between \${product.stock <= 0 ? 'opacity-50 pointer-events-none' : ''}\`}
                >
                  <div>
                      <h3 className="font-medium text-white mb-1 line-clamp-2">{product.name}</h3>
                      <div className="text-blue-400 font-semibold mb-2 flex justify-between items-center">
                        <span>Rp {product.price.toLocaleString('id-ID')}</span>
                        {product.promo === 'b2g1' && <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30">Beli 2 Gratis 1</span>}
                      </div>
                      <div className="flex items-center text-xs text-slate-400 mb-3">
                        <Package size={12} className="mr-1" /> Stok: {product.stock} {product.unit || 'pcs'}
                      </div>
                  </div>
                  {product.cupPrice && product.cupPrice > 0 && (
                      <button 
                         onClick={(e) => { e.stopPropagation(); addToCart(product, true); }}
                         className="w-full bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-xs py-1.5 rounded-lg transition-colors border border-blue-500/30"
                      >
                         + Pakai {getTambahanLabel(product.category)} (Rp {product.cupPrice.toLocaleString('id-ID')})
                      </button>
                  )}
                </div>
              ))}`;

const newCard = `{filteredProducts.map(product => {
                const hasTambahan = product.cupPrice && product.cupPrice > 0;
                return (
                <div
                  key={product.id}
                  className={\`bg-slate-800 border border-slate-700 rounded-xl p-4 text-left flex flex-col justify-between transition-colors \${product.stock <= 0 ? 'opacity-50 pointer-events-none' : ''}\`}
                >
                  <div>
                      <h3 className="font-medium text-white mb-1 line-clamp-2">{product.name}</h3>
                      <div className="text-blue-400 font-semibold mb-2 flex justify-between items-center">
                        {!hasTambahan && <span></span>}
                        {hasTambahan && <span className="text-slate-400 text-xs">Pilih Varian:</span>}
                        {product.promo === 'b2g1' && <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30">Beli 2 Gratis 1</span>}
                      </div>
                      <div className="flex items-center text-xs text-slate-400 mb-4">
                        <Package size={12} className="mr-1" /> Stok: {product.stock} {product.unit || 'pcs'}
                      </div>
                  </div>
                  
                  {hasTambahan ? (
                      <div className="flex flex-col gap-2 mt-auto">
                        <button 
                            onClick={() => addToCart(product, false)}
                            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs py-2 rounded-lg transition-colors border border-slate-600 flex justify-between px-3 items-center"
                        >
                            <span>Biasa</span>
                            <span className="font-semibold">Rp {product.price.toLocaleString('id-ID')}</span>
                        </button>
                        <button 
                            onClick={() => addToCart(product, true)}
                            className="w-full bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-xs py-2 rounded-lg transition-colors border border-blue-500/30 flex justify-between px-3 items-center"
                        >
                            <span>+ {getTambahanLabel(product.category)}</span>
                            <span className="font-semibold">Rp {product.cupPrice.toLocaleString('id-ID')}</span>
                        </button>
                      </div>
                  ) : (
                      <button 
                          onClick={() => addToCart(product, false)}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm py-2 rounded-lg transition-colors flex justify-between px-3 items-center mt-auto"
                      >
                          <span>Tambah</span>
                          <span className="font-semibold">Rp {product.price.toLocaleString('id-ID')}</span>
                      </button>
                  )}
                </div>
              ) })}`;

code = code.replace(oldCard, newCard);
fs.writeFileSync('src/components/views/KasirFisik.tsx', code);
