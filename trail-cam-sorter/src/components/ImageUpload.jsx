import { useState } from 'react';

export default function ImageUpload() {
  const [images, setImages] = useState([]);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    const filePreviews = files.map(file => URL.createObjectURL(file));
    setImages(filePreviews);
  };

  return (
    <div>
      <input type="file" multiple accept="image/*" onChange={handleUpload} />
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {images.map((src, idx) => (
          <img key={idx} src={src} alt="preview" width="150" style={{ margin: 5 }} />
        ))}
      </div>
    </div>
  );
}
