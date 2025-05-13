import { useState } from 'react';

export default function Other({ images }) {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Other Images</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '10px',
      }}>
        {images.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`Other ${idx}`}
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
            onClick={() => setSelectedImage(src)}
          />
        ))}
      </div>

      {/* Zoom Modal */}
      {selectedImage && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
          onClick={() => setSelectedImage(null)} // Click anywhere to close
        >
          <img
            src={selectedImage}
            alt="Zoomed"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              borderRadius: '8px',
              boxShadow: '0 0 10px #fff',
            }}
          />
        </div>
      )}
    </div>
  );
}
