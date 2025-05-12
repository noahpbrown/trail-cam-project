import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Deer from './pages/Deer';
import Turkey from './pages/Turkey';
import Hog from './pages/Hog';
import Coyote from './pages/Coyote';
import Other from './pages/Other';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/deer" element={<Deer />} />
        <Route path="/turkey" element={<Turkey />} />
        <Route path="/hog" element={<Hog />} />
        <Route path="/coyote" element={<Coyote />} />
        <Route path="/other" element={<Other />} />
      </Routes>
    </Router>
  );
}

export default App;
