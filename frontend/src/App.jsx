import { useEffect, useState } from 'react';

function App() {
  const [folders, setFolders] = useState({});
  const [loading, setLoading] = useState(true);
  const [renameInputs, setRenameInputs] = useState({});
  const [totalStyles, setTotalStyles] = useState(0);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      // ওয়েবফ্লো থেকে সব স্টাইল নিয়ে আসা
      const allStyles = await webflow.getAllStyles();
      setTotalStyles(allStyles.length);
      
      const grouped = {};

      for (const style of allStyles) {
        const name = await style.getName();
        
        // যদি ক্লাসের কোনো নাম না থাকে (যেমন বডি ট্যাগ), তবে বাদ দিন
        if (!name) continue;

        // আপনার শর্ত: _ অথবা - এর ওপর ভিত্তি করে ফোল্ডার
        const match = name.match(/[_\-]/);
        const folderName = match ? name.substring(0, match.index) : 'General';

        if (!grouped[folderName]) {
          grouped[folderName] = [];
        }
        grouped[folderName].push({ style, name });
      }
      
      setFolders(grouped);
    } catch (error) {
      console.error("Webflow API Error:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleRename = async (folderName) => {
    const target = renameInputs[`${folderName}_target`];
    const replacement = renameInputs[`${folderName}_new`];

    if (!target || !replacement) return alert("Please fill both fields");

    setLoading(true);
    try {
      const stylesInFolder = folders[folderName];
      for (const item of stylesInFolder) {
        if (item.name.includes(target)) {
          const newName = item.name.replace(target, replacement);
          await item.style.setName(newName);
        }
      }
      alert("Success! Re-fetching classes...");
      await fetchClasses();
      setRenameInputs({});
    } catch (err) {
      console.error("Rename failed:", err);
      alert("Error: Make sure you have permission to edit styles.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '15px', color: '#fff', backgroundColor: '#1a1a1a', minHeight: '100vh', fontSize: '13px' }}>
      <header style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '15px' }}>
        <h2 style={{ fontSize: '16px', margin: 0 }}>Class Renamer Pro</h2>
        <p style={{ color: '#888', fontSize: '11px' }}>Total Styles Found: {totalStyles}</p>
      </header>

      <button 
        onClick={fetchClasses} 
        disabled={loading}
        style={{ width: '100%', padding: '10px', backgroundColor: '#3855d4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}
      >
        {loading ? 'Processing...' : 'Refresh & Load Classes'}
      </button>

      {totalStyles === 0 && !loading && (
        <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#222', borderRadius: '4px' }}>
          <p>No classes found.</p>
          <small style={{ color: '#777' }}>Tip: Create some classes in Webflow first!</small>
        </div>
      )}

      {Object.keys(folders).map(folder => (
        <div key={folder} style={{ marginBottom: '20px', border: '1px solid #333', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#2a2a2a', padding: '8px 12px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
            <span>📁 {folder}</span>
            <span style={{ color: '#888' }}>{folders[folder].length}</span>
          </div>
          
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '5px' }}>
              <input 
                placeholder="Old string"
                style={{ flex: 1, padding: '6px', background: '#111', border: '1px solid #444', color: '#fff' }}
                onChange={e => setRenameInputs({...renameInputs, [`${folder}_target`]: e.target.value})}
              />
              <input 
                placeholder="New string"
                style={{ flex: 1, padding: '6px', background: '#111', border: '1px solid #444', color: '#fff' }}
                onChange={e => setRenameInputs({...renameInputs, [`${folder}_new`]: e.target.value})}
              />
            </div>
            <button 
              onClick={() => handleRename(folder)}
              style={{ padding: '8px', backgroundColor: '#1d803a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Rename Folder
            </button>
            
            <div style={{ maxHeight: '100px', overflowY: 'auto', marginTop: '10px', borderTop: '1px solid #333', paddingTop: '10px' }}>
              {folders[folder].map((st, i) => (
                <div key={i} style={{ fontSize: '11px', color: '#ccc', padding: '2px 0' }}>• {st.name}</div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;