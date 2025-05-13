import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';

import Home from './pages/Home';
import Deer from './pages/Deer';
import Turkey from './pages/Turkey';
import Hog from './pages/Hog';
import Coyote from './pages/Coyote';
import Other from './pages/Other';

// ... imports
function App() {
  const [model, setModel] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [classifiedImages, setClassifiedImages] = useState({
    CoyoteImgs: [],
    DeerImgs: [],
    HogImgs: [],
    OtherImgs: [],
    TurkeyImgs: [],
  });
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      const loaded = await tf.loadGraphModel(`${import.meta.env.BASE_URL}tfjs_model/model.json`);
      setModel(loaded);
      console.log('✅ Model loaded');
    };
    loadModel();
  }, []);

  const handleUpload = (images) => {
    setUploadedImages(images);
    setSummary(null); // reset old summary
  };

  const classifyImages = async () => {
    if (!model || uploadedImages.length === 0) {
      console.log("🚫 No model or no uploaded images");
      return;
    }
  
    const CLASS_NAMES = ['CoyoteImgs', 'DeerImgs', 'HogImgs', 'OtherImgs', 'TurkeyImgs'];
    const CONFIDENCE_THRESHOLD = 0.7;
  
    const updated = {
      CoyoteImgs: [],
      DeerImgs: [],
      HogImgs: [],
      OtherImgs: [],
      TurkeyImgs: [],
    };
  
    for (const imageSrc of uploadedImages) {
      const img = new Image();
      img.src = imageSrc;
  
      await new Promise((resolve) => {
        img.onload = async () => {
          try {
            const tensor = tf.browser.fromPixels(img)
              .resizeNearestNeighbor([224, 224])
              .toFloat()
              .div(tf.scalar(255))
              .expandDims()
              .transpose([0, 3, 1, 2]);
  
            const prediction = await model.predict(tensor);
            const probs = await prediction.data();
            console.log("🧪 Raw prediction array:", probs);
  
            const maxProb = Math.max(...probs);
            const classIndex = probs.indexOf(maxProb);
  
            const label = maxProb >= CONFIDENCE_THRESHOLD
              ? CLASS_NAMES[classIndex]
              : 'OtherImgs';
  
            if (updated[label]) {
              updated[label].push(imageSrc);
              console.log(`✔️ ${label.toUpperCase()} (${maxProb.toFixed(2)})`);
            } else {
              console.warn("⚠️ Unexpected label:", label);
            }
          } catch (err) {
            console.error("❌ Prediction failed", err);
          }
          resolve();
        };
  
        img.onerror = () => {
          console.error("❌ Image failed to load:", imageSrc);
          resolve();
        };
      });
    }
  
    setClassifiedImages(updated);
    setSummary({
      DeerImgs: updated.DeerImgs.length,
      TurkeyImgs: updated.TurkeyImgs.length,
      HogImgs: updated.HogImgs.length,
      CoyoteImgs: updated.CoyoteImgs.length,
      OtherImgs: updated.OtherImgs.length,
    });
  
    console.log("🎉 Classification complete.");
  };
  

  const clearAll = () => {
    setUploadedImages([]);
    setClassifiedImages({
      CoyoteImgs: [],
      DeerImgs: [],
      HogImgs: [],
      OtherImgs: [],
      TurkeyImgs: [],
    });
    setSummary(null);
  };

  return (
    <Router>
      <div>
        <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
          <Link to="/" style={{ marginRight: 10 }}>Home</Link>
          <Link to="/deer" style={{ marginRight: 10 }}>Deer</Link>
          <Link to="/turkey" style={{ marginRight: 10 }}>Turkey</Link>
          <Link to="/hog" style={{ marginRight: 10 }}>Hog</Link>
          <Link to="/coyote" style={{ marginRight: 10 }}>Coyote</Link>
          <Link to="/other">Other</Link>
        </nav>

        <Routes>
          <Route path="/" element={
            <Home
              uploadedImages={uploadedImages}
              onUpload={handleUpload}
              onSubmit={classifyImages}
              onClear={clearAll}
              summary={summary}
            />
          } />
          <Route path="/deer" element={<Deer images={classifiedImages.DeerImgs} />} />
          <Route path="/turkey" element={<Turkey images={classifiedImages.TurkeyImgs} />} />
          <Route path="/hog" element={<Hog images={classifiedImages.HogImgs} />} />
          <Route path="/coyote" element={<Coyote images={classifiedImages.CoyoteImgs} />} />
          <Route path="/other" element={<Other images={classifiedImages.OtherImgs} />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;

