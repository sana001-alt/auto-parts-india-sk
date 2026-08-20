const fs = require('fs');
let code = fs.readFileSync('src/components/EditListingModal.tsx', 'utf8');

code = code.replace(
  /<button\s+onClick=\{onClose\}\s+className="p-1\.5 rounded-full hover:bg-slate-100 transition-colors text-slate-500 transition-all cursor-pointer"\s+id="close-edit-modal-btn"\s+>\s+<X size=\{18\} \/>\s+<\/button>/g,
  '<button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-500 cursor-pointer" id="close-edit-modal-btn"><X size={20} /></button>'
);

fs.writeFileSync('src/components/EditListingModal.tsx', code);
