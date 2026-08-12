const mongoose = require('mongoose');
const dns = require('node:dns');

const connectDB = async () => {
  // Workaround for networks whose system DNS resolver refuses SRV queries,
  // which breaks `mongodb+srv://` connections. Try the default resolver first;
  // if it fails with a DNS error, retry using public DNS servers.
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB connected.');
    return;
  } catch (error) {
    if (!/querySrv|ECONNREFUSED|ENOTFOUND|EAI_AGAIN/i.test(error.message)) {
      console.error('MongoDB connection error:', error.message);
      process.exit(1);
    }
    // Reset any partially-created connection before retrying.
    await mongoose.disconnect();
  }

  try {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
    console.log('Retrying MongoDB connection using public DNS servers...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('MongoDB connected (public DNS fallback).');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
