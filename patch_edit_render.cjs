const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace onClick={() => setEditingPart(detailedPart)} in Part Detail view
code = code.replace(
  /onClick=\{() => setEditingPart\(detailedPart\)\}/g,
  'onClick={() => pushScreen({ type: "edit_listing", part: detailedPart })}'
);

// We need to replace setEditingPart(null) after save/delete
code = code.replace(
  /setEditingPart\(null\);/g,
  'goBack();'
);

// Replace the EditListingModal rendering section
const oldRender = `{editingPart && (
            <EditListingModal
              part={editingPart}
              onClose={() => setEditingPart(null)}
              onSave={handleSaveListingChanges}
              onDelete={async (id) => {
                try {
                  const ok = await deleteSparePartListing(id);
                  if (ok) {
                    setEditingPart(null);
                    await handlePartDeleted(id);
                    showToast("Listing deleted successfully");
                  } else {
                    showToast("Failed to delete listing", "error");
                  }
                } catch (err: any) {
                  showToast("Error deleting listing: " + (err.message || String(err)), "error");
                }
              }}
            />
          )}`;

const newRender = `{currentScreen.type === "edit_listing" && (
            <div className="absolute inset-0 z-40 bg-slate-50 flex flex-col">
              <EditListingModal
                part={currentScreen.part}
                onClose={goBack}
                onSave={handleSaveListingChanges}
                onDelete={async (id) => {
                  try {
                    const ok = await deleteSparePartListing(id);
                    if (ok) {
                      goBack();
                      await handlePartDeleted(id);
                      showToast("Listing deleted successfully");
                    } else {
                      showToast("Failed to delete listing", "error");
                    }
                  } catch (err: any) {
                    showToast("Error deleting listing: " + (err.message || String(err)), "error");
                  }
                }}
              />
            </div>
          )}`;

// We need to replace it more robustly since we replaced goBack() inside it
const modalRegex = /\{editingPart && \([\s\S]*?<EditListingModal[\s\S]*?onDelete=\{async \(id\) => \{[\s\S]*?\}\s*\/>\s*\)\}/;
code = code.replace(modalRegex, newRender);

fs.writeFileSync('src/App.tsx', code);
