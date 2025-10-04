import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { HonkaiStarRail } from './pages/honkai-star-rail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/genshin" element={<Dashboard />} />
        <Route path="/honkai-star-rail" element={<HonkaiStarRail />} />
      </Routes>
    </Router>
  );
}

export default App;
