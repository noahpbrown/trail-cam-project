import ImageUpload from '../components/ImageUpload';

export default function Home({ uploadedImages, onUpload, onSubmit, onClear, summary }) {
  return (
    <div>
      <h1>Upload Trail Cam Images</h1>
      <ImageUpload uploadedImages={uploadedImages} onUpload={onUpload} />
      <div style={{ marginTop: '1rem' }}>
        <button onClick={onSubmit} disabled={uploadedImages.length === 0}>Submit</button>
        <button onClick={onClear} style={{ marginLeft: '10px' }}>Clear</button>
      </div>

      {summary && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Classification Summary:</h3>
          <ul>
            <li>Deer: {summary?.DeerImgs || 0}</li>
            <li>Turkey: {summary?.TurkeyImgs || 0}</li>
            <li>Hog: {summary?.HogImgs || 0}</li>
            <li>Coyote: {summary?.CoyoteImgs || 0}</li>
            <li>Other: {summary?.OtherImgs || 0}</li>
            </ul>

          <p>✅ Images sorted into pages. Use the navigation bar to view them.</p>
        </div>
      )}
    </div>
  );
}
