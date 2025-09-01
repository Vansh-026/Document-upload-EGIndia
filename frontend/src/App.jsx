import { Link, Routes, Route, Navigate } from 'react-router-dom';
import UploadPanel from './components/UploadPanel';
import DocumentList from './components/DocumentList';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Document Service</h1>
        <nav>
          <Link to="/upload">Upload</Link> | <Link to="/documents">View/Download</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/upload" />} />  {/* Redirect root to upload */}
          <Route path="/upload" element={<UploadPanel />} />
          <Route path="/documents" element={<DocumentList />} />
        </Routes>
      </main>
      <footer className="footer">
        © 2025 Document Service
      </footer>
    </div>
  );
}

export default App;