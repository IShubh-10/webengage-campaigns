import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';

const Header = ({ view, setView, setEditingId, setFormData, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Read admin state directly from localStorage to keep props clean
  const userAdmin = localStorage.getItem("isLogedIn");
  const guestUser = localStorage.getItem("isGuestUser");

  const handleLogoOrGalleryClick = () => {
    if (setView) setView('gallery');
    navigate('/gallery');
  };

  const handleNewCampaignClick = () => {
    if (setEditingId && setFormData && setView) {
      setEditingId(null);
      setFormData({
        type: 'Email',
        title: '',
        tags: '',
        asanaLink: '',
        code: '',
        cwcCode: '',
        pages: ['']
      });
      setView('admin');
    }
    navigate('/gallery');
  };

  return (
  <>
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
    <nav className="navbar">
      {/* Brand Logo */}
      <div className="logo" onClick={handleLogoOrGalleryClick}>
        <div style={{color: 'white', padding: '6px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(91, 61, 245, 0.25)', height:'30px'}}>
          <img width={30} src='https://res.cloudinary.com/djoqxegkb/image/upload/v1780386730/mxdccfpslyc7bmxi2vag.jpg' alt="Logo" />
        </div>
        <div>Campaign<span>Hub</span></div>
      </div>

      {/* Navigation Actions */}
      <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
        
        {/* Image Uploader Button */}
        {/* <button 
          onClick={() => navigate("/uploader")} 
          className={`btn ${location.pathname === '/uploader' ? 'btn-primary' : 'btn-ghost'}`}
        >
          Image Uploader
        </button> */}

        {/* Gallery Button */}
        <button 
          onClick={handleLogoOrGalleryClick} 
          className={`btn ${location.pathname === '/gallery' && view === 'gallery' ? 'btn-primary' : 'btn-ghost'}`}
        >
          Gallery
        </button>

        {/* Create New Campaign Button */}
        {userAdmin === "true" ? (
          <button onClick={handleNewCampaignClick} className="btn btn-primary">
            <Plus size={18}/> New
          </button>
        ) : null }

        {/* Logout Button */}
          <button onClick={handleLogout} className="btn btn-ghost btn-primary">
            Logout
          </button>

        {/* User Profile Avatar */}
        {userAdmin === "true" ? (
          <span>
            <img 
              style={{width:30, display: "flex", border:"1px solid", borderRadius:"50%", alignItems: "center", justifyContent: "center", padding: "5px"}} 
              src='https://res.cloudinary.com/djoqxegkb/image/upload/v1783148634/bkmbwrhh8lzu72tlwkby.webp' 
              alt="Admin Profile"
            />
          </span>
        ) : (
          <span>
            <img 
              style={{width:40, display: "flex", border:"1px solid", borderRadius:"50%", alignItems: "center", justifyContent: "center"}} 
              src='https://res.cloudinary.com/djoqxegkb/image/upload/v1779811356/e6f4zvc1ojk4a9dj19ta.png' 
              alt="Guest Profile"
            />
          </span>
        )}
      </div>
    </nav>
    </>
  );
};

export default Header;