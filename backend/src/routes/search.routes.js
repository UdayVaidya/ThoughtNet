import express from 'express';
import * as ctrl from '../controllers/search.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const searchRouter = express.Router();
searchRouter.use(protect);

searchRouter.get("/", ctrl.search);
searchRouter.get("/tags", ctrl.getAllTags);
searchRouter.get("/graph", ctrl.getGraphData);
searchRouter.get("/related/:id", ctrl.getRelated);
export default searchRouter;
