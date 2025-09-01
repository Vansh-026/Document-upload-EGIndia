const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const { Octokit } = require('octokit');
const Document = require('./models/Document');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Multer for file upload (in-memory storage, since we send to GitHub)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GitHub Octokit instance
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// Upload route
app.post('/api/upload', upload.single('file'), async (req, res) => {
  const { branch, semester, year, subject } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  // Upload to GitHub (create file in repo)
  const filePath = `${branch}/${semester}/${year}/${subject}/${file.originalname}`;
  try {
    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path: filePath,
      message: `Upload ${file.originalname}`,
      content: file.buffer.toString('base64')
    });

    // GitHub raw URL for view/download
    const fileUrl = `https://raw.githubusercontent.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/master/${filePath}`;

    // Save metadata to MongoDB
    const doc = new Document({ branch, semester, year, subject, fileUrl });
    await doc.save();

    res.json({ message: 'Upload successful', fileUrl });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed', details: err });
  }
});

// Get all documents route (for view/download page)
app.get('/api/documents', async (req, res) => {
  const docs = await Document.find();
  res.json(docs);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));