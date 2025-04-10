const express = require('express');
const emailRoutes = require('./routes/emailRoutes');
const eventRoutes = require('./routes/eventRoutes');
const cors = require('cors');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());
// Mount email routes
app.use('/', emailRoutes);
// Mount event routes
app.use('/api', eventRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});