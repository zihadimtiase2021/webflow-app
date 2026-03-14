import { useEffect, useState } from 'react';

function App() {
  const [folders, setFolders] = useState({});
  const [loading, setLoading] = useState(true);
  const [renameInputs, setRenameInputs] = useState({});
  const [totalStyles, setTotalStyles] = useState(0);

  // ওয়েবফ্লো থেকে ক্লাসগুলো নিয়ে আসার মেইন ফাংশন
  const fetchClasses = async () => {
    setLoading(true);
    try {
      // চেক করা হচ্ছে ওয়েবফ্লো এপিআই লোড হয়েছে কি না
      const wf = window.webflow || (typeof webflow !== 'undefined' ? webflow : null);
      
      if (!wf) {
        console.error("Webflow Designer API not found. Make sure this is running inside Webflow.");
        setLoading(false);
        return;
      }

      const allStyles = await wf.getAllStyles();
      setTotalStyles(allStyles.length);
      
      const grouped = {};

      if (allStyles.length > 0) {
        for (const style of allStyles) {
          const name = await style.getName();
          if (!name) continue;

          // "_" অথবা "-" এর ওপর ভিত্তি করে প্রথম অংশকে ফোল্ডার নাম হিসেবে নেওয়া
          const match = name.match(/[_\-]/);
          const folderName = match ? name.substring(0, match.index) : 'General';

          if (!grouped[folderName]) {
            grouped[folderName] = [];
          }
          grouped[folderName].push({ style, name });
        }
      }
      setFolders(grouped);
    } catch (error) {
      console.error("Error fetching styles:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // ক্লাস রিনেম করার ফাংশন (Find and Replace logic)
  const handleRename = async (folderName) => {
    const target = renameInputs[`${folderName}_target`];
    const replacement = renameInputs[`${folderName}_new`];

    if (!target || !replacement) {
      alert("Please enter both the current name part and the new name.");
      return;
    }

    setLoading(true);
    try {
      const stylesInFolder = folders[folderName];
      let count = 0;

      for (const item of stylesInFolder) {
        // যদি ক্লাসের নামের ভেতরে টার্গেট করা শব্দটি থাকে
        if (item.name.includes(target)) {
          const newName = item.name.replace(target, replacement);
          await item.style.setName(newName);
          count++;
        }
      }
      
      alert(`Successfully renamed ${count} classes!`);
      await fetchClasses(); // রিফ্রেশ করে নতুন নামগুলো লোড করা
      setRenameInputs(prev => ({ ...prev, [`${folderName}_target`]: '', [`${folderName}_new`]: '' }));
    } catch (err) {
      console.error("Rename failed:", err);
      alert("Failed to rename. Check permissions in Webflow App settings.");
    }
    setLoading(false);
  };

  const handleInputChange = (folder, field, value) => {
    setRenameInputs(prev => ({ ...prev, [`${folder}_${field}`]: value }));
  };

  return (
    <div style={{ padding: '15px', color: '#fff', backgroundColor: '#1e1e1e', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '15px' }}>
        <h2 style={{ fontSize: '18px', margin: '0 0 5px 0' }}>Class Renamer Pro</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#888', fontSize: '12px' }}>Total Classes: {totalStyles}</span>
          <button 
            onClick={fetchClasses} 
            disabled={loading}
            style={{ padding: '5px 10px', backgroundColor: '#3855d4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </header>

      {totalStyles === 0 && !loading && (
        <div style={{ textAlign: 'center', marginTop: '50px', color: '#666' }}>
          <p>No classes found.</p>
          <p style={{ fontSize: '11px' }}>Try adding a class like "section_hero" in Webflow.</p>
        </div>
      )}

      {Object.keys(folders).sort().map(folder => (
        <div key={folder} style={{ marginBottom: '15px', backgroundColor: '#2a2a2a', borderRadius: '6px', overflow: 'hidden', border: '1px solid #333' }}>
          <div style={{ padding: '8px 12px', backgroundColor: '#333', fontSize: '13px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
            <span>📁 {folder}</span>
            <span style={{ color: '#aaa' }}>{folders[folder].length}</span>
          </div>
          
          <div style={{ padding: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input 
                placeholder="Find (e.g. hero)" 
                value={renameInputs[`${folder}_target`] || ""}
                onChange={(e) => handleInputChange(folder, 'target', e.target.value)}
                style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#111', color: '#fff', fontSize: '12px' }}
              />
              <input 
                placeholder="Replace with" 
                value={renameInputs[`${folder}_new`] || ""}
                onChange={(e) => handleInputChange(folder, 'new', e.target.value)}
                style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#111', color: '#fff', fontSize: '12px' }}
              />
            </div>
            
            <button 
              onClick={() => handleRename(folder)}
              disabled={loading}
              style={{ width: '100%', padding: '8px', backgroundColor: '#1d803a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
            >
              Rename All in {folder}
            </button>

            <div style={{ marginTop: '10px', maxHeight: '80px', overflowY: 'auto', borderTop: '1px solid #383838', paddingTop: '8px' }}>
              {folders[folder].map((item, idx) => (
                <div key={idx} style={{ fontSize: '11px', color: '#999', padding: '2px 0' }}>• {item.name}</div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;