const fs = require('fs');

// Patch App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// Patch AdminDashboardScreen.tsx
let adminCode = fs.readFileSync('src/components/AdminDashboardScreen.tsx', 'utf8');
adminCode = adminCode.replace(
  /showToast\("Banner updated & image synced to Cloudinary \+ Firestore!", "success"\);/g,
  'showToast("Banner updated successfully!", "success");'
);
adminCode = adminCode.replace(
  /showToast\("New banner created & image uploaded to Cloudinary!", "success"\);/g,
  'showToast("New banner created successfully!", "success");'
);
adminCode = adminCode.replace(
  /message: `Are you sure you want to permanently delete "\$\{b\.title\}"\? This will delete the banner document from Firestore and remove the image asset from Cloudinary permanently\.`/g,
  'message: `Are you sure you want to permanently delete "${b.title}"?`'
);
adminCode = adminCode.replace(
  /showToast\("Banner permanently deleted from Firestore and Cloudinary\.", "success"\);/g,
  'showToast("Banner permanently deleted.", "success");'
);
adminCode = adminCode.replace(
  /setVersionError\("Failed to load app version config from Firestore: " \+ \(e\?\.message \|\| String\(e\)\)\);/g,
  'setVersionError("Failed to load app version config: " + (e?.message || String(e)));'
);
adminCode = adminCode.replace(
  /showToast\("App update configuration saved to Firestore!"\);/g,
  'showToast("App update configuration saved!");'
);
adminCode = adminCode.replace(
  /const msg = "Failed to save app update configuration to Firestore\.";/g,
  'const msg = "Failed to save app update configuration.";'
);
adminCode = adminCode.replace(
  /message: `Are you sure you want to permanently delete "\$\{part\.title\}"\? This cannot be undone and will permanently remove listing images and data from Firestore, Cloudinary, and Storage\.`/g,
  'message: `Are you sure you want to permanently delete "${part.title}"? This cannot be undone and will permanently remove listing images and data.`'
);
adminCode = adminCode.replace(
  /message: `Are you sure you want to permanently delete \$\{selectedPartIds\.length\} listing\(s\)\? This will permanently remove all documents, Cloudinary images, Storage files, and linked references\.`/g,
  'message: `Are you sure you want to permanently delete ${selectedPartIds.length} listing(s)? This will permanently remove all data and linked references.`'
);
adminCode = adminCode.replace(
  /<span className="text-blue-600 font-bold uppercase tracking-wider text-\[10px\]">Firestore Collection Path:<\/span>/g,
  '<span className="text-blue-600 font-bold uppercase tracking-wider text-[10px]">Database Path:</span>'
);
adminCode = adminCode.replace(
  /title="Delete Listing permanently from Firestore and Cloudinary"/g,
  'title="Delete Listing permanently"'
);
adminCode = adminCode.replace(
  /Cloudinary \+ Firestore/g,
  'Server'
);
adminCode = adminCode.replace(
  /<p className="text-xs font-bold text-slate-600">Loading banners from Firestore...<\/p>/g,
  '<p className="text-xs font-bold text-slate-600">Loading banners...</p>'
);
adminCode = adminCode.replace(
  /No banners have been added to Firestore yet\. Click the button below to create your first promotional banner!/g,
  'No banners have been added yet. Click the button below to create your first promotional banner!'
);
adminCode = adminCode.replace(
  /title="Delete Banner permanently from Firestore & Cloudinary"/g,
  'title="Delete Banner permanently"'
);
adminCode = adminCode.replace(
  /PNG, JPG, or WEBP \(Saved directly to Cloudinary\)/g,
  'PNG, JPG, or WEBP'
);
adminCode = adminCode.replace(
  /Saving to Cloudinary & Firestore\.\.\./g,
  'Saving...'
);
adminCode = adminCode.replace(
  /<p className="text-\[10px\] text-slate-400">Manage release metadata stored in Firestore document app_config\/version<\/p>/g,
  '<p className="text-[10px] text-slate-400">Manage release metadata stored in database document app_config/version</p>'
);
adminCode = adminCode.replace(
  /title="Reload version from Firestore"/g,
  'title="Reload version"'
);
adminCode = adminCode.replace(
  /App version configuration updated successfully in Firestore!/g,
  'App version configuration updated successfully!'
);

fs.writeFileSync('src/components/AdminDashboardScreen.tsx', adminCode);


// Patch AdminTaxonomyCMS.tsx
let taxCode = fs.readFileSync('src/components/AdminTaxonomyCMS.tsx', 'utf8');
taxCode = taxCode.replace(
  /showToast\(`Category "\$\{trimmed\}" saved to Firestore\.`\);/g,
  'showToast(`Category "${trimmed}" saved successfully.`);'
);
taxCode = taxCode.replace(
  /showToast\(`Brand "\$\{trimmed\}" saved to Firestore\.`\);/g,
  'showToast(`Brand "${trimmed}" saved successfully.`);'
);
taxCode = taxCode.replace(
  /showToast\(`New Spare Part "\$\{partForm\.title\}" added to Firestore\.`\);/g,
  'showToast(`New Spare Part "${partForm.title}" added successfully.`);'
);
taxCode = taxCode.replace(
  /message: "This will populate standard Indian categories, car brands, models, states, and districts into Firestore config\. Continue\?",/g,
  'message: "This will populate standard Indian categories, car brands, models, states, and districts into database config. Continue?",'
);
taxCode = taxCode.replace(
  /showToast\("Standard Automotive Taxonomy successfully seeded into Firestore!"\);/g,
  'showToast("Standard Automotive Taxonomy successfully seeded into database!");'
);
taxCode = taxCode.replace(
  /Manage categories, brands, models, variants, spare parts, and locations live in Firestore\./g,
  'Manage categories, brands, models, variants, spare parts, and locations live.'
);

fs.writeFileSync('src/components/AdminTaxonomyCMS.tsx', taxCode);

