const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  branch: { type: String, required: true },
  semester: { type: Number, required: true },
  year: { type: Number, required: true },
  subject: { type: String, required: true },
  fileUrl: { type: String, required: true },  // GitHub raw file URL
  uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);