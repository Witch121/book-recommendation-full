const express = require('express');
const cors = require('cors');
const recommendationRoutes = require('./routes/recommendationRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', recommendationRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});