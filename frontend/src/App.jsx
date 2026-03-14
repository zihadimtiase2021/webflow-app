import { useEffect, useState } from 'react';

function App() {
  const [folders, setFolders] = useState({});
  const [loading, setLoading] = useState(true);
  const [renameInputs, setRenameInputs] = useState({});

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const allStyles = await webflow.getAllStyles();
      const grouped = {};

      for (let style of allStyles) {
        const name = await style.getName();
        // _ অথবা - দিয়ে ক্লাসনেম ভাগ করা
        const parts = name.split(/[_\-]/); 
        const rootFolder = parts.length > 1 ? parts[0] : 'Uncategorized';

        if (!grouped[rootFolder]) {
          grouped[rootFolder] = [];
        }
        grouped[rootFolder].push({ style, name });
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

  const handleRename = async (rootFolder) => {
    const targetWord = renameInputs[`${rootFolder}_target`];
    const newWord = renameInputs[`${rootFolder}_new`];

    if (!targetWord || !newWord) return;

    setLoading(true);
    try {
      for (let item of folders[rootFolder]) {
        // রেগুলার এক্সপ্রেশন: এটি শুধু সম্পূর্ণ শব্দটিকেই রিপ্লেস করবে (যেমন: hero), অন্য শব্দের অংশ হিসেবে থাকলে করবে না।
        const regex = new RegExp(`(^|[_-])${targetWord}([_-]|$)`, 'g');
        
        if (regex.test(item.name)) {
           const newClassName = item.name.replace(regex, `$1${newWord}$2`);
           await item.style.setName(newClassName);
        }
      }
      await fetchClasses(); // রিনেম শেষে ডাটা রিফ্রেশ
      setRenameInputs(prev => ({...prev, [`${rootFolder}_target`]: '', [`${rootFolder}_new`]: ''}));
    } catch (error) {
      console.error("Error renaming:", error);
    }
    setLoading(false);
  };

  const handleInputChange = (folder, field, value) => {
    setRenameInputs(prev => ({ ...prev, [`${folder}_${field}`]: value }));
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Webflow Class Manager</h2>
      <button 
        onClick={fetchClasses} 
        style={{ marginBottom: '20px', padding: '8px 12px', cursor: 'pointer', backgroundColor: '#0053e6', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        Refresh Classes
      </button>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {Object.keys(folders).map((folderName) => {
            if (folderName === 'Uncategorized') return null;
            return (
              <div key={folderName} style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '6px', padding: '15px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                  📁 {folderName} <span style={{ color: '#666', fontSize: '12px' }}>({folders[folderName].length} items)</span>
                </h3>
                
                {/* Find and Replace Section */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <input 
                    type="text" 
                    placeholder="Old word (e.g. section or hero)" 
                    value={renameInputs[`${folderName}_target`] || ""}
                    onChange={(e) => handleInputChange(folderName, 'target', e.target.value)}
                    style={{ padding: '6px', width: '100%', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  <input 
                    type="text" 
                    placeholder="New word" 
                    value={renameInputs[`${folderName}_new`] || ""}
                    onChange={(e) => handleInputChange(folderName, 'new', e.target.value)}
                    style={{ padding: '6px', width: '100%', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  <button 
                    onClick={() => handleRename(folderName)}
                    style={{ padding: '6px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Rename
                  </button>
                </div>

                <ul style={{ listStyleType: 'none', padding: 0, margin: 0, maxHeight: '150px', overflowY: 'auto', backgroundColor: '#f9f9f9', border: '1px solid #eee' }}>
                  {folders[folderName].map((item, idx) => (
                    <li key={idx} style={{ padding: '5px 10px', fontSize: '13px', borderBottom: '1px solid #eee' }}>
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default App;