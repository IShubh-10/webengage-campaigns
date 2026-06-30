import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Login from './Login'
import CampaignGallery from './CampaignGallery'
import ImageUploader from './imageUploader'
// import ImageUploader from './imageUploader'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/gallery" element={<CampaignGallery />} />
        <Route path="/uploader" element={<ImageUploader />} />
        {/* Fallback route: redirects any unknown URL back to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App