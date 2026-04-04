import 'dotenv/config.js';
import connectDB from './src/config/db.config.js';
import { initQdrant } from './src/config/qdrant.config.js';
import app from './src/app.js';

connectDB();
initQdrant();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ToughtNet API running on port ${PORT}`));