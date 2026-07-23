with open('src/components/views/KasirFisik.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<select value={formData.category} onChange={e => {',
    '<select value={formData.category || \'\'} onChange={e => {'
)

content = content.replace(
    '<select value={formData.promo} onChange={e => setFormData({...formData, promo: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white">',
    '<select value={formData.promo || \'none\'} onChange={e => setFormData({...formData, promo: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white appearance-auto cursor-pointer relative z-10">'
)

content = content.replace(
    '}} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white">',
    '}} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white appearance-auto cursor-pointer relative z-10">'
)

with open('src/components/views/KasirFisik.tsx', 'w') as f:
    f.write(content)
