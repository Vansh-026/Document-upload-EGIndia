import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from './Loader';
import './DocumentList.css';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [groupedDocs, setGroupedDocs] = useState({});
  const [expandedBranches, setExpandedBranches] = useState({});
  const [expandedYears, setExpandedYears] = useState({});
  const [expandedSems, setExpandedSems] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/documents')
      .then(res => {
        setDocuments(res.data);
        const grouped = res.data.reduce((acc, doc) => {
          if (!acc[doc.branch]) acc[doc.branch] = {};
          if (!acc[doc.branch][doc.year]) acc[doc.branch][doc.year] = {};
          if (!acc[doc.branch][doc.year][doc.semester]) acc[doc.branch][doc.year][doc.semester] = [];
          acc[doc.branch][doc.year][doc.semester].push({ subject: doc.subject, fileUrl: doc.fileUrl });
          return acc;
        }, {});
        setGroupedDocs(grouped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleBranch = (branch) => {
    setExpandedBranches(prev => ({ ...prev, [branch]: !prev[branch] }));
  };

  const toggleYear = (branch, year) => {
    setExpandedYears(prev => ({ ...prev, [`${branch}-${year}`]: !prev[`${branch}-${year}`] }));
  };

  const toggleSem = (branch, year, sem) => {
    setExpandedSems(prev => ({ ...prev, [`${branch}-${year}-${sem}`]: !prev[`${branch}-${year}-${sem}`] }));
  };

  // ✅ Force download function
  const handleDownload = async (url, filename) => {
    try {
      const response = await axios.get(url, { responseType: "blob" });
      const blob = new Blob([response.data]);
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="document-list">
      <h2>Documents</h2>
      {Object.keys(groupedDocs).map(branch => (
        <div key={branch} className="section">
          <button onClick={() => toggleBranch(branch)} className="toggle-btn">
            {branch} {expandedBranches[branch] ? '▼' : '▶'}
          </button>
          {expandedBranches[branch] && (
            <div className="subsection">
              {Object.keys(groupedDocs[branch]).map(year => (
                <div key={year}>
                  <button onClick={() => toggleYear(branch, year)} className="toggle-btn">
                    Year: {year} {expandedYears[`${branch}-${year}`] ? '▼' : '▶'}
                  </button>
                  {expandedYears[`${branch}-${year}`] && (
                    <div className="subsection">
                      {Object.keys(groupedDocs[branch][year]).map(sem => (
                        <div key={sem}>
                          <button onClick={() => toggleSem(branch, year, sem)} className="toggle-btn">
                            Semester: {sem} {expandedSems[`${branch}-${year}-${sem}`] ? '▼' : '▶'}
                          </button>
                          {expandedSems[`${branch}-${year}-${sem}`] && (
                            <ul className="subject-list">
                              {groupedDocs[branch][year][sem].map((item, idx) => (
                                <li key={idx}>
                                  {item.subject}:{" "}
                                  <a
                                    href={item.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="view-link"
                                  >
                                    View
                                  </a>{" "}
                                  |{" "}
                                  <a
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleDownload(item.fileUrl, `${item.subject}.pdf`);
                                    }}
                                    className="view-link"
                                  >
                                    Download
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      {documents.length === 0 && <p>No documents available.</p>}
    </div>
  );
};

export default DocumentList;
