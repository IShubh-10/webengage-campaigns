import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this line
import { 
  Plus, 
  Search, 
  ExternalLink, 
  Code, 
  Layout, 
  Tag, 
  Copy, 
  Check, 
  Trash2, 
  X, 
  FileCode, 
  Eye, 
  Edit3, 
  RefreshCw, 
  Terminal, 
  Monitor, 
  Smartphone, 
  Tablet as TabletIcon,
  Link,
  ChevronRight,
  ChevronLeft,
  UploadCloud
} from 'lucide-react';
import Header from './Header';

const CAMPAIGN_TYPES = ['Email', 'onsite notification', 'onsite survey', 'In App', 'webp', 'CWC'];

const VIEWPORTS = {
  desktop: { name: 'Desktop', width: '100%', icon: Monitor },
  tablet: { name: 'Tablet', width: '768px', icon: TabletIcon },
  mobile: { name: 'Mobile', width: '375px', icon: Smartphone }
};

// Safe fallback for API URL without using import.meta to prevent compilation warnings
  const API_BASE_URL = 'https://webengage-campaign-gallery.onrender.com/api/campaign_hub'; 

export default function App() {
  const navigate = useNavigate(); // Add this

  const [view, setView] = useState('gallery');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [copyingId, setCopyingId] = useState(null);
  const [previewCampaign, setPreviewCampaign] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [activeViewport, setActiveViewport] = useState('desktop');

  // Drag and Drop state
  const [isDragging, setIsDragging] = useState(false);

  // Multi-page state management
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [formData, setFormData] = useState({
    type: 'Email',
    title: '',
    tags: '',
    asanaLink: '',
    code: '',
    imageUrl: '',
    cwcCode:'',
    pages: [''] // Array to hold survey pages
  });

  const fetchCampaigns = async (retries = 5, delay = 1000) => {
    if (!API_BASE_URL) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      const data = await response.json();
      
      const formattedData = data.map(c => {
        let pages = [''];
        try {
          // If it's a survey and the code is JSON, parse the pages
          if (c.type === 'onsite survey' && c.code && c.code.trim().startsWith('{')) {
            const parsed = JSON.parse(c.code);
            pages = parsed.pages || [c.code];
          } else {
            pages = [c.code || ''];
          }
        } catch (e) {
          pages = [c.code || ''];
        }

        return {
          ...c,
          tags: typeof c.tags === 'string' ? c.tags.split(',').map(t => t.trim()).filter(Boolean) : (c.tags || []),
          pages: pages,
          cwcCode: c.cwcCode || '' // Fetching cwcCode from backend
        };
      });
      
      setCampaigns(formattedData);
      setLoading(false);
      setError(null);
    } catch (err) {
      if (retries > 0) {
        setTimeout(() => fetchCampaigns(retries - 1, delay * 2), delay);
      } else {
        setError('Could not connect to the server. Please check if your backend is running.');
        setLoading(false);
      }
    }
  };

  // useEffect(() => {
  //   fetchCampaigns();
  // }, []);

   useEffect(() => {
    fetchCampaigns();

    const isGuest = localStorage.getItem("isGuestUser") === "true";
    const isLogged = localStorage.getItem("isLogedIn") === "true";
    
    if (!isGuest && !isLogged) {
        navigate("/");
    }
  }, [navigate]);

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'All' || (c.tags && c.tags.includes(selectedTag));
    const matchesType = selectedType === 'All' || c.type === selectedType;
    return matchesSearch && matchesTag && matchesType;
  });

  const handleCopy = (code, id) => {
    const textArea = document.createElement("textarea");
    textArea.value = code || 'no content';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    setCopyingId(id);
    setTimeout(() => setCopyingId(null), 2000);
    document.body.removeChild(textArea);
  };

  const startEdit = (campaign) => {
    setFormData({
      type: campaign.type,
      title: campaign.title,
      tags: Array.isArray(campaign.tags) ? campaign.tags.join(', ') : campaign.tags,
      asanaLink: campaign.asanaLink,
      code: campaign.code,
      imageUrl: campaign.imageUrl,
      cwcCode: campaign.cwcCode,
      pages: campaign.pages || [campaign.code || '']
    });
    setEditingId(campaign.id);
    setActivePageIndex(0);
    setView('admin');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      setCampaigns(campaigns.filter(c => c.id !== id));
    } catch (err) {
      setError('Failed to delete campaign');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!API_BASE_URL) return;

    let finalCode = formData.code;
    if (formData.type === 'onsite survey') {
      finalCode = JSON.stringify({ pages: formData.pages });
    }

    const campaignData = {
      type: formData.type,
      title: formData.title,
      tags: formData.tags,
      asanaLink: formData.asanaLink,
      code: finalCode,
      imageUrl: formData.imageUrl,
      cwcCode: formData.cwcCode
    };

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_BASE_URL}/${editingId}` : API_BASE_URL;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      });
      if (!response.ok) throw new Error('Save failed');
      fetchCampaigns();
      setView('gallery');
      setEditingId(null);
    } catch (err) {
      setError('Failed to save campaign. Check backend connection.');
    }
  };

  // Multi-page helper functions
  const addPage = () => {
    const newPages = [...formData.pages, ''];
    setFormData({ ...formData, pages: newPages });
    setActivePageIndex(newPages.length - 1);
  };

  const removePage = (index) => {
    if (formData.pages.length <= 1) return;
    const newPages = formData.pages.filter((_, i) => i !== index);
    setFormData({ ...formData, pages: newPages });
    setActivePageIndex(Math.max(0, index - 1));
  };

  const updateCurrentPageCode = (val) => {
    const newPages = [...formData.pages];
    newPages[activePageIndex] = val;
    setFormData({ ...formData, pages: newPages });
  };

  const generateIframeContent = (content) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { margin: 0; padding: 20px; display: flex; justify-content: center; background: #f8fafc; font-family: sans-serif; }
          </style>
        </head>
        <body>${content || ''}</body>
      </html>
    `;
  };

  const handleLogout = () => {
    localStorage.removeItem("isLogedIn");
    localStorage.removeItem("isGuestUser");
    // window.location.reload();
    navigate("/"); // Replace window.location.reload() with this
  };

  // Reusable core upload function
  const uploadToCloudinary = async (fileValue) => {
    if (!fileValue) return;

    const data = new FormData();
    data.append("file", fileValue);
    data.append("upload_preset", "Image Upload");
    data.append("cloud_name", "djoqxegkb");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/djoqxegkb/image/upload", {
        method: "POST",
        body: data 
      });
      const uploadedImageUrl = await res.json();
      if (uploadedImageUrl.url) {
        setFormData(prev => ({ ...prev, imageUrl: uploadedImageUrl.url }));
      }
    } catch (err) {
      console.error("Cloudinary upload failed", err);
    }
  };

  // Click file selection handler
  const handleFileUpload = (event) => {
    const fileValue = event.target.files[0];
    uploadToCloudinary(fileValue);
  };

  // Drag handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadToCloudinary(e.dataTransfer.files[0]);
    }
  };

  const userAdmin = localStorage.getItem("isLogedIn");
  const guestUser = localStorage.getItem("isGuestUser");

  return (
    <div className="app-container">
      <style>{`
        :root { --primary: #5d46b1; --bg: #f8fafc; --white: #ffffff; --border: #e2e8f0; --text: #1e293b; --radius: 12px; }
        body { margin: 0; font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); }
        .navbar { background: white; border-bottom: 1px solid var(--border); padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; }
        .logo { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 800; font-size: 1.25rem; }
        .logo span { color: var(--primary); }
        .main-content { max-width: 100%; margin: 2rem auto; padding: 0 1rem; }
        .filter-bar { background: white; padding: 1.25rem; border-radius: var(--radius); border: 1px solid var(--border); display: flex; gap: 1rem; margin-bottom: 2rem; align-items: center; }
        .input { width: -webkit-fill-available;flex: 1; padding: 0.6rem 1rem; border: 1px solid var(--border); border-radius: 8px; outline: none; }
        .campaign-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        .card { background: white; border-radius: var(--radius); border: 1px solid var(--border); overflow: hidden; transition: transform 0.2s; display: flex; flex-direction: column; position: relative; }
        .card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        .card-body { padding: 1.5rem; flex: 1; }
        .card-title { font-size: 1.1rem; font-weight: 700; margin: 10px 0; min-height: 2.2rem; }
        .card-meta { display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b; margin-top: 15px; }
        .btn { padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; display: flex; align-items: center; gap: 0.5rem; justify-content: center; transition: all 0.2s; }
        .btn-primary { background:white; color: var(--primary); border: 1px solid var(--primary);}
        .btn-primary:hover { background: var(--primary); color: white; }
        .card-footer { padding: 1rem; background: #f8fafc; box-shadow: 0 -12px 20px rgba(93, 70, 177, 0.18); display: grid; gap: 6px; }
        .admin-view { background: white; border-radius: var(--radius); border: 1px solid var(--border); display: flex; min-height: 700px; }
        .form-panel { width: 50%; padding: 2rem; border-right: 1px solid var(--border); overflow-y: auto; }
        .preview-panel { width: 50%; padding: 2rem; background: #f1f5f9; display: flex; flex-direction: column; }
        .vp-header { display: flex; justify-content: space-between; margin-bottom: 1rem; align-items: center; }
        .vp-toggle { display: flex; gap: 4px; background: white; padding: 4px; border-radius: 8px; border: 1px solid var(--border); }
        .vp-btn { padding: 6px; border: none; background: none; cursor: pointer; color: #64748b; border-radius: 4px; }
        .vp-btn.active { background: #eef2ff; color: var(--primary); }
        .preview-frame-container { flex: 1; display: flex; justify-content: center; overflow: hidden; background: #cbd5e1; border-radius: 8px; padding: 1rem; }
        .preview-frame { background: white; border: none; height: 100%; transition: width 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .page-tabs { display: flex; gap: 4px; margin-bottom: 8px; }
        .page-tab { padding: 4px 10px; font-size: 0.7rem; background: #f1f5f9; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 4px; border: 1px solid var(--border); }
        .page-tab.active { background: var(--primary); color: white; border-color: var(--primary); }
        .cardImage { width: 100%;height: 200px;object-fit: cover;object-position: top;}
        button.delete-btn:hover {color: red !important;}
        
        /* Drag and Drop styles */
        .dropzone-container {
          border: 2px dashed #9E9E9E;
          border-radius: 10px;
          padding: 20px;
          text-align: center;
          background: #fafafa;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          // flex-direction: column;
          align-items: center;
          justify-content: space-around;
          gap: 8px;
          margin-bottom: 1.25rem;
        }
        .dropzone-container.dragging {
          border-color: var(--primary);
          background: #eef2ff;
        }
        .dropzone-text {
          font-size: 0.8rem;
          color: #4b5563;
          margin-top: 10px;
        }
        .dropzone-preview {
          width: 100%;
          max-height: 150px;
          object-fit: cover;
          border-radius: 6px;
          margin-top: 0px;
        }
        .preview-wrapper {
          position: relative;
          max-width: 30%;
          border: 1px solid;
          border-radius: 10px;
          padding: 10px;
        }
        .remove-image-btn {
          position: absolute;
          top: -10px;
          right: -10px;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          padding: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;

        }
      `}</style>

      {/* <nav className="navbar">
        <div className="logo" onClick={() => setView('gallery')}>
          <div style={{color: 'white', padding: '6px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(91, 61, 245, 0.25)', height:'30px'}}><img width={30} src='https://res.cloudinary.com/djoqxegkb/image/upload/v1780386730/mxdccfpslyc7bmxi2vag.jpg' /></div>
          <div>Campaign<span>Hub</span></div>
        </div>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button onClick={() => navigate("/uploader")} className={`btn ${view === 'gallery' ? 'btn-primary' : 'btn-ghost'}`}>Image Uploader</button>
          <button onClick={() => setView('gallery')} className={`btn ${view === 'gallery' ? 'btn-primary' : 'btn-ghost'}`}>Gallery</button>
          <button onClick={() => { setEditingId(null); setFormData({type: 'Email', title: '', tags: '', asanaLink: '', code: '', cwcCode: '', pages: ['']}); setView('admin'); }} className="btn btn-primary"><Plus size={18}/> New</button>
          <button onClick={handleLogout} className="btn btn-ghost btn-primary">Logout</button>
          {userAdmin === "true" ? (
            <span><img style={{width:30, display: "flex", border:"1px solid", borderRadius:"50%", alignItems: "center", justifyContent: "center", padding: "5px"}} src='https://res.cloudinary.com/djoqxegkb/image/upload/v1779811858/y7fopwgyjhkvpepjh6wu.png'/></span>
          ) : <span><img style={{width:40, display: "flex", border:"1px solid", borderRadius:"50%", alignItems: "center", justifyContent: "center"}} src='https://res.cloudinary.com/djoqxegkb/image/upload/v1779811356/e6f4zvc1ojk4a9dj19ta.png'/></span> }
        </div>
      </nav> */}

      {/* Render the new Header component here */}
       <Header 
         view={view} 
         setView={setView} 
         setEditingId={setEditingId} 
         setFormData={setFormData} 
         handleLogout={handleLogout} 
       />

      <main className="main-content">
        {view === 'gallery' ? (
          <>
            <div className="filter-bar">
              <Search size={18} color="#64748b"/>
              <input className="input" placeholder="Search campaigns..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <select className="input" style={{maxWidth: '150px'}} value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                <option value="All">All Types</option>
                {CAMPAIGN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {loading ? (
              <div className="loading-state">
                <RefreshCw size={32} className="animate-spin" style={{margin: '0 auto 1rem'}}/>
                <p>Loading campaigns from server...</p>
              </div>
            ) : (
              <div className="campaign-grid">
                {filteredCampaigns.map(c => (
                  <div key={c.id} className="card">
                    {/* card image */}
                    <img className='cardImage' src={c.imageUrl || "https://res.cloudinary.com/djoqxegkb/image/upload/v1779797886/ieiiwvswdaajkg0vnxzx.png"} alt=""></img>

                    <div className="card-body">
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span style={{fontSize: '0.65rem', fontWeight: 800, background: '#eef2ff', color: 'var(--primary)', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase'}}>{c.type}</span>
                        {userAdmin === "true" ? (
                        <button onClick={() => handleDelete(c.id)} style={{border: 'none', background: 'none', color: '#cbd5e1', cursor: 'pointer'}} title="Delete" className="delete-btn">
                          <Trash2 size={14}/>
                        </button>
                        ) : null }
                      </div>
                      <h3 className="card-title">{c.title}</h3>
                      <div style={{display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px'}}>
                        {Array.isArray(c.tags) && c.tags.map(t => <span key={t} style={{fontSize: '0.7rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px'}}>#{t}</span>)}
                      </div>
                      <div className="card-meta">
                        <span>{new Date(c.date || Date.now()).toLocaleDateString()}</span>
                        {c.asanaLink && <a href={c.asanaLink} target="_blank" rel="noreferrer" style={{color: 'var(--primary)'}} title="Open Asana Task"><ExternalLink size={14}/></a>}
                      </div>
                    </div>
                    <div className="card-footer" style={{ gridTemplateColumns: userAdmin === "true" ? "repeat(3, 1fr)" : "repeat(2, 1fr)",}}>
                      <button className="btn btn-ghost" style={{padding: '8px', fontSize: '0.75rem'}} onClick={() => { setActivePageIndex(0); setPreviewCampaign(c); }} title="Full Preview"><Eye size={14}/></button>
                      {userAdmin === "true" ? (
                      <button className="btn btn-ghost" style={{padding: '8px', fontSize: '0.75rem'}} onClick={() => startEdit(c)} title="Edit Campaign"><Edit3 size={14}/></button>
                      ) : null }
                      {/* Copy strictly page 1 code for survey campaign cards, or standard code for others */}
                      <button 
                        className={`btn ${copyingId === c.id ? 'btn-primary' : 'btn-ghost'}`} 
                        style={{padding: '8px', fontSize: '0.75rem'}} 
                        onClick={() => {
                          const codeToCopy = c.type === 'onsite survey' 
                            ? (c.pages?.[0] || "") 
                            : c.code;
                          handleCopy(codeToCopy, c.id);
                        }} 
                        title={c.type === 'onsite survey' ? "copy first page code" : "Copy Code"}
                      >
                        {copyingId === c.id ? <Check size={14}/> : <Copy size={14}/>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="admin-view">
            <div className="form-panel">
              <h2 style={{marginTop: 0, fontSize: '1.25rem'}}>{editingId ? 'Edit Campaign' : 'Create New Campaign'}</h2>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem'}}>
                <div>
                  <label style={{display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem'}}>Campaign Type</label>
                  <select className="input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    {CAMPAIGN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem'}}>Campaign Title</label>
                  <input className="input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g., Summer Promo 2024" />
                </div>
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem'}}>
                <div>
                    <label style={{display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem'}}>Tags (comma separated)</label>
                    <input className="input" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="Holiday, Mobile, Product" />
                </div>
                <div>
                    <label style={{display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem'}}>Asana Task Link</label>
                    <input className="input" value={formData.asanaLink} onChange={e => setFormData({...formData, asanaLink: e.target.value})} placeholder="https://app.asana.com/..." />
                </div>
              </div>
              
              {/* Drag and Drop Image Uploader */}
              <div style={{ marginBottom: '1.25rem'}}>
                <label style={{display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem'}}>Insert Image File (up to 10MB)</label>
                <input 
                  className="fileInput" 
                  style={{display:"none"}} 
                  type='file' 
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                <div 
                  className={`dropzone-container ${isDragging ? 'dragging' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.querySelector(".fileInput").click()}
                >
                <div>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={isDragging ? '#5d46b1' : '#9E9E9E'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p className="dropzone-text">
                    {isDragging ? 'Drop your image here!' : 'Drag & drop your campaign image here, or click to browse'}
                  </p>
                </div>
                  {formData.imageUrl && (
                    <div className="preview-wrapper" onClick={(e) => e.stopPropagation()}>
                      <img className="dropzone-preview" src={formData.imageUrl} alt="Preview" />
                      <button 
                        type="button" 
                        className="remove-image-btn" 
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div style={{marginBottom: '1.5rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem'}}>
                  <label style={{fontSize: '0.8rem', fontWeight: 700}}>HTML/CSS Code</label>
                  {formData.type === 'onsite survey' && (
                    <div className="page-tabs">
                      {formData.pages.map((_, i) => (
                        <button key={i} className={`page-tab ${activePageIndex === i ? 'active' : ''}`} onClick={() => setActivePageIndex(i)}>
                          Page {i+1}
                          {formData.pages.length > 1 && <X size={10} onClick={(e) => { e.stopPropagation(); removePage(i); }}/>}
                        </button>
                      ))}
                      <button className="page-tab" onClick={addPage}><Plus size={10}/></button>
                    </div>
                  )}
                </div>
                <textarea 
                  className="input" 
                  style={{height: '250px', fontFamily: 'monospace', fontSize: '0.8rem', background: '#0f172a', color: 'darkcyan', lineHeight: '1.5', marginBottom: '1.5rem'}} 
                  value={formData.type === 'onsite survey' ? formData.pages[activePageIndex] : formData.code} 
                  onChange={e => formData.type === 'onsite survey' ? updateCurrentPageCode(e.target.value) : setFormData({...formData, code: e.target.value})} 
                  spellCheck="false" 
                />

                {/* Separate JavaScript Code Field */}
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem'}}>
                  <label style={{fontSize: '0.8rem', fontWeight: 700}}>Custom Widget Code (CWC)</label>
                </div>
                <textarea 
                  className="input" 
                  style={{height: '150px', fontFamily: 'monospace', fontSize: '0.8rem', background: '#0f172a', color: '#60a5fa', lineHeight: '1.5'}} 
                  value={formData.cwcCode || ''} 
                  onChange={e => setFormData({...formData, cwcCode: e.target.value})} 
                  placeholder="// Paste custom CWC JS code here..."
                  spellCheck="false" 
                />
              </div>
              <div style={{display: 'flex', gap: '1rem'}}>
                <button className="btn btn-primary" style={{flex: 1}} onClick={handleSubmit}>Save Changes</button>
                <button className="btn btn-ghost" style={{flex: 1}} onClick={() => setView('gallery')}>Cancel</button>
              </div>
            </div>
            <div className="preview-panel">
              <div className="vp-header">
                <span style={{fontSize: '0.75rem', fontWeight: 700, color: '#64748b'}}>VIEWPORT PREVIEW</span>
                <div className="vp-toggle">
                  {Object.entries(VIEWPORTS).map(([key, vp]) => (
                    <button key={key} className={`vp-btn ${activeViewport === key ? 'active' : ''}`} onClick={() => setActiveViewport(key)} title={vp.name}>
                      <vp.icon size={16}/>
                    </button>
                  ))}
                </div>
              </div>
              <div className="preview-frame-container">
                <iframe 
                  className="preview-frame" 
                  style={{width: VIEWPORTS[activeViewport].width}} 
                  srcDoc={generateIframeContent(formData.type === 'onsite survey' ? formData.pages[activePageIndex] : formData.code)} 
                  title="Live Preview"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {previewCampaign && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'}} onClick={() => setPreviewCampaign(null)}>
          <div style={{background: 'white', padding: '1.5rem', borderRadius: '16px', width: '100%', maxWidth: '950px', height: '85vh', display: 'flex', flexDirection: 'column'}} onClick={e => e.stopPropagation()}>
            <div style={{padding: '1.25rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
              <div>
                <h3 style={{margin: 0}}>{previewCampaign.title}</h3>
                <span style={{fontSize: '0.7rem', color: '#64748b'}}>{previewCampaign.type} • {new Date(previewCampaign.date || Date.now()).toLocaleDateString()}</span>
              </div>
              <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                {/* Dynamically copy page code by preview page context */}
                <button 
                  className={`btn ${copyingId === previewCampaign.id ? 'btn-primary' : 'btn-ghost'}`} 
                  style={{padding: '6px 12px', fontSize: '0.75rem', height: '32px'}} 
                  onClick={() => {
                    const codeToCopy = previewCampaign.type === 'onsite survey' 
                      ? (previewCampaign.pages?.[activePageIndex] || "") 
                      : previewCampaign.code;
                    handleCopy(codeToCopy, previewCampaign.id);
                  }}
                >
                  {copyingId === previewCampaign.id ? <Check size={14}/> : <Copy size={14}/>}
                  {copyingId === previewCampaign.id 
                    ? 'Copied!' 
                    : (previewCampaign.type === 'onsite survey' ? `HTML/CSS  Page ${activePageIndex + 1} Code` : 'HTML/CSS Code')
                  }
                </button>

                {/* Option to copy CWC right beside copy page button */}
                <button 
                  className={`btn ${copyingId === previewCampaign.id + '_cwc' ? 'btn-primary' : 'btn-ghost'}`} 
                  style={{padding: '6px 12px', fontSize: '0.75rem', height: '32px'}} 
                  onClick={() => {
                    handleCopy(previewCampaign.cwcCode || '', previewCampaign.id + '_cwc');
                  }}
                >
                  {copyingId === previewCampaign.id + '_cwc' ? <Check size={14}/> : <Copy size={14}/>}
                  {copyingId === previewCampaign.id + '_cwc' ? 'Copied!' : 'CWC'}
                </button>

                <button style={{background: '#f1f5f9', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}} onClick={() => setPreviewCampaign(null)}>
                  <X size={20}/>
                </button>
              </div>
            </div>
            <div style={{flex: 1, background: '#cbd5e1', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden'}}>

                  {previewCampaign.type === 'onsite survey' && previewCampaign.pages && previewCampaign.pages.length > 0 && (
                  <div className="page-tabs" style={{marginBottom: '1rem'}}>
                    {previewCampaign.pages.map((_, i) => (
                      <button 
                        key={i} 
                        className={`page-tab ${activePageIndex === i ? 'active' : ''}`} 
                        onClick={() => setActivePageIndex(i)}
                      >
                        Page {i+1}
                      </button>
                    ))}
                  </div>
                )}

              <iframe className="preview-frame" style={{width: '100%', maxWidth: '600px'}} srcDoc={generateIframeContent(previewCampaign.type === 'onsite survey' ? previewCampaign.pages?.[activePageIndex] : previewCampaign.code)} title="Full View" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}