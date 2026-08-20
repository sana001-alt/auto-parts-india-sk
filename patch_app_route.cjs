const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the EditListingModal rendering section
const oldRender = `{currentScreen.type === "edit_listing" && (
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

const newRender = `{currentScreen.type === "edit_listing" && (
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
          )}`;

// We need to replace it more robustly since we replaced goBack() inside it
const modalRegex = /\{currentScreen\.type === "edit_listing" && \([\s\S]*?<div className="absolute inset-0 z-40 bg-slate-50 flex flex-col">[\s\S]*?<EditListingModal[\s\S]*?onDelete=\{async \(id\) => \{[\s\S]*?\}\s*\/>\s*<\/div>\s*\)\}/;
code = code.replace(modalRegex, newRender);

fs.writeFileSync('src/App.tsx', code);
