import 'dotenv/config.js';
import connectDB from './src/config/db.config.js';
import { initQdrant } from './src/config/qdrant.config.js';
import app from './src/app.js';

// Run the worker inside the same process to avoid the $7/mo charge on Render
import './src/queue/content.worker.js';

connectDB();
initQdrant();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ToughtNet API + Background Worker running on port ${PORT}`));