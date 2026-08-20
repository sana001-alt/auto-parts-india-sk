const fs = require('fs');
let code = fs.readFileSync('src/components/EditListingModal.tsx', 'utf8');

code = code.replace(
  /<div className="fixed inset-0 bg-slate-950\/70 z-\[9999\] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" id="edit-listing-modal-overlay" onClick=\{onClose\}>/,
  '<div className="fixed inset-0 z-[9999] bg-white flex flex-col animate-in slide-in-from-right-4 duration-300 overflow-hidden" id="edit-listing-screen">'
);

code = code.replace(
  /<div className="bg-white rounded-3xl w-full max-w-lg h-\[85vh\] flex flex-col overflow-hidden shadow-2xl border border-slate-100" id="edit-listing-modal-content" onClick=\{\(e\) => e.stopPropagation\(\)\}>/,
  '<div className="flex-1 flex flex-col overflow-hidden bg-white w-full max-w-3xl mx-auto" onClick={(e) => e.stopPropagation()} id="edit-listing-content">'
);

// We need to update the header as well
code = code.replace(
  /<div className="bg-slate-900 text-white px-5 py-4 flex flex-row items-center justify-between shrink-0">/,
  '<div className="bg-white border-b border-slate-100 px-4 py-3 flex flex-row items-center justify-between shrink-0 sticky top-0 z-10">'
);

code = code.replace(
  /<h2 className="text-sm font-extrabold tracking-tight text-white">Edit Advertisement<\/h2>/,
  '<h2 className="text-sm font-extrabold tracking-tight text-slate-800">Edit Advertisement</h2>'
);

code = code.replace(
  /<button\s+onClick=\{onClose\}\s+className="p-1\.5 rounded-full hover:bg-white\/10 transition-colors text-white cursor-pointer"/,
  '<button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-500 cursor-pointer"'
);

fs.writeFileSync('src/components/EditListingModal.tsx', code);
