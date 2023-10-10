const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1/landen-google-search-books');

module.exports = mongoose.connection;