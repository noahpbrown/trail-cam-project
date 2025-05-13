import { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';

export default function ModelLoader() {
  const [model, setModel] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await tf.loadGraphModel(`${import.meta.env.BASE_URL}tfjs_model/model.json`);
        setModel(loadedModel);
        console.log('✅ Model loaded successfully!');
      } catch (error) {
        console.error('❌ Failed to load model:', error);
      }
    };

    loadModel();
  }, []);

  return (
    <div>
      <h2>Model Loader</h2>
      {model ? <p>Model is ready 🎉</p> : <p>Loading model...</p>}
    </div>
  );
}
