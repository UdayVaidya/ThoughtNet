import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.config.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import contentRoutes from './routes/content.routes.js';
import collectionRoutes from './routes/collection.routes.js';
import searchRoutes from './routes/search.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(helmet());
app.use('/api/docs', (req, res, next) => {
  res.setHeader('Content-Security-Policy', '');
  next();
});
const frontendBaseUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
app.use(cors({ origin: frontendBaseUrl, credentials: true }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/search", searchRoutes);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'ToughtNet API Docs',
  customCss: `
    .topbar { background: #0b0b0f; }
    .topbar-wrapper img { content: url(''); }
    .swagger-ui .info h2 { color: #f59e0b; }
  `,
  swaggerOptions: { persistAuthorization: true },
}));
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "ToughtNet API", version: "1.0.0", timestamp: new Date() });
});

app.use(notFound);
app.use(errorHandler);

export default app;