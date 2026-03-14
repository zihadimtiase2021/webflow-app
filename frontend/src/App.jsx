import { useEffect, useState } from 'react';

function App() {
  const [folders, setFolders] = useState({});
  const [loading, setLoading] = useState(true);
  const [renameInputs, setRenameInputs] = useState({});
  const [totalStyles, setTotalStyles] = useState(0);
  const [status, setStatus] = useState("Connecting to Webflow...");

  // ওয়েবফ্লো থেকে ক্লাসগুলো নিয়ে আসা এবং ফোল্ডারে ভাগ করা
  const fetchClasses = async () => {
    setLoading(true);
    setStatus("Loading Styles...");
    try {
      // এপিআই চেক করা (window.webflow ব্যবহার করা হয়েছে)
      const wf = window.webflow;
      
      if (!wf) {
        setStatus("Waiting for Webflow API...");
        setTimeout(fetchClasses, 1000); // ১ সেকেন্ড পর আবার চেষ্টা করবে
        return;
      }

      const allStyles = await wf.getAllStyles();
      setTotalStyles(allStyles.length);
      
      const grouped = {};
      if (allStyles.length > 0) {
        for (const style of allStyles) {
          const name = await style.getName();
          if (!name) continue;

          // "_" অথবা "-" দিয়ে ফোল্ডার ভাগ করা
          const match = name.match(/[_\-]/);
          const folderName = match ? name.substring(0, match.index) : 'General';

          if (!grouped[folderName]) grouped[folderName] = [];
          grouped[folderName].push({ style, name });
        }
      }
      setFolders(grouped);
      setStatus("Styles Loaded");
    } catch (error) {
      console.error("Fetch Error:", error);
      setStatus("Error fetching styles");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // রিনেম লজিক (Find & Replace)
  const handleRename = async (folderName) => {
    const target = renameInputs[`${folderName}_target`];
    const replacement = renameInputs[`${folderName}_new`];

    if (!target || !replacement) {
      alert("উভয় বক্সেই টেক্সট লিখুন!");
      return;
    }

    setLoading(true);
    setStatus("Renaming...");
    try {
      const stylesInFolder = folders[folderName];
      let count = 0;

      for (const item of stylesInFolder) {
        if (item.name.includes(target)) {
          const newName = item.name.replace(target, replacement);
          await item.style.setName(newName);
          count++;
        }
      }
      
      alert(`সফলভাবে ${count}টি ক্লাস রিনেম হয়েছে!`);
      await fetchClasses(); 
      setRenameInputs(prev => ({ ...prev, [`${folderName}_target`]: '', [`${folderName}_new`]: '' }));
    } catch (err) {
      console.error("Rename Error:", err);
      alert("রিনেম ব্যর্থ হয়েছে। পারমিশন চেক করুন।");
    }
    setLoading(false);
  };

  const handleInputChange = (folder, field, value) => {
    setRenameInputs(prev => ({ ...prev, [`${folder}_${field}`]: value }));
  };

  return (
    <div style={{ padding: '15px', color: '#fff', backgroundColor: '#1e1e1e', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '15px' }}>
        <h2 style={{ fontSize: '18px', margin: '0' }}>Class Renamer Pro</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
          <span style={{ fontSize: '11px', color: '#888' }}>{status} | Total: {totalStyles}</span>
          <button onClick={fetchClasses} style={{ fontSize: '10px', cursor: 'pointer', background: '#333', color: '#ccc', border: '1px solid #444' }}>Refresh</button>
        </div>
      </header>

      {totalStyles === 0 && !loading && (
        <div style={{ textAlign: 'center', marginTop: '40px', color: '#666', fontSize: '13px' }}>
          কোনো ক্লাস পাওয়া যায়নি।<br/> 
          <small>উদাঃ 'section_hero' নামে ক্লাস দিন।</small>
        </div>
      )}

      {Object.keys(folders).sort().map(folder => (
        <div key={folder} style={{ marginBottom: '15px', backgroundColor: '#2a2a2a', borderRadius: '6px', border: '1px solid #333' }}>
          <div style={{ padding: '8px 12px', backgroundColor: '#333', fontWeight: 'bold', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
            <span>📁 {folder}</span>
            <span>{folders[folder].length}</span>
          </div>
          
          <div style={{ padding: '10px' }}>
            <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
              <input 
                placeholder="Old word" 
                value={renameInputs[`${folder}_target`] || ""}
                onChange={(e) => handleInputChange(folder, 'target', e.target.value)}
                style={{ flex: 1, padding: '6px', background: '#111', border: '1px solid #444', color: '#fff', fontSize: '12px' }}
              />
              <input 
                placeholder="New word" 
                value={renameInputs[`${folder}_new`] || ""}
                onChange={(e) => handleInputChange(folder, 'new', e.target.value)}
                style={{ flex: 1, padding: '6px', background: '#111', border: '1px solid #444', color: '#fff', fontSize: '12px' }}
              />
            </div>
            
            <button 
              onClick={() => handleRename(folder)}
              disabled={loading}
              style={{ width: '100%', padding: '8px', backgroundColor: '#1d803a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Rename in {folder}
            </button>

            <div style={{ marginTop: '10px', maxHeight: '60px', overflowY: 'auto', fontSize: '11px', color: '#777' }}>
              {folders[folder].map((item, idx) => <div key={idx}>• {item.name}</div>)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;