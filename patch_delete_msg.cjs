const fs = require('fs');

// Patch App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(
  /Are you sure you want to permanently delete <span className="font-bold text-slate-700 dark:text-slate-200">"\{partToDelete\.title\}"<\/span>\? All listing data and photos will be removed from Firestore\. This action cannot be undone\./g,
  'Are you sure you want to permanently delete <span className="font-bold text-slate-700 dark:text-slate-200">"{partToDelete.title}"</span>?'
);
fs.writeFileSync('src/App.tsx', appCode);

// Patch EditListingModal.tsx
let editCode = fs.readFileSync('src/components/EditListingModal.tsx', 'utf8');
editCode = editCode.replace(
  /Are you sure you want to permanently delete <span className="font-bold text-slate-700">"\{title \|\| part\.title\}"<\/span>\? This will remove all photos and details from Firestore and Cloudinary\. This action cannot be undone\./g,
  'Are you sure you want to permanently delete <span className="font-bold text-slate-700">"{title || part.title}"</span>?'
);
fs.writeFileSync('src/components/EditListingModal.tsx', editCode);

