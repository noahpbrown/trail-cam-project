

export default function ImageUpload({ uploadedImages, onUpload }) {
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const promises = files.map(file => {
      const reader = new FileReader();
      return new Promise(resolve => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(onUpload);
  };

  return (
    <div>
      <input type="file" accept="image/*" multiple onChange={handleImageChange} />
      {uploadedImages.length > 0 && <p>{uploadedImages.length} image(s) selected</p>}
    </div>
  );
}
