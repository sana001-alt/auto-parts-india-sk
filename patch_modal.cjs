const fs = require('fs');
let code = fs.readFileSync('src/components/EditListingModal.tsx', 'utf8');

// Replace the backdrop/modal wrapper to be full screen
code = code.replace(
  /<div className="fixed inset-0 z-\[9999\] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" id="edit-listing-modal-overlay" onClick=\{onClose\}>/g,
  '<div className="fixed inset-0 z-[9999] bg-white flex flex-col animate-in slide-in-from-right-4 duration-300 overflow-hidden" id="edit-listing-screen">'
);

code = code.replace(
  /<div\s+className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-\[90vh\] flex flex-col overflow-hidden border border-slate-100"\s+onClick=\{\(e\) => e.stopPropagation\(\)\}\s+id="edit-listing-modal-content"\s+>/g,
  '<div className="flex-1 flex flex-col overflow-hidden bg-white w-full max-w-3xl mx-auto" onClick={(e) => e.stopPropagation()} id="edit-listing-content">'
);

fs.writeFileSync('src/components/EditListingModal.tsx', code);
