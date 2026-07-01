import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './Login';
import CampaignGallery from './CampaignGallery';

function App() {
  return (
    <BrowserRouter basename="/webengage-campaigns">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/gallery" element={<CampaignGallery />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;