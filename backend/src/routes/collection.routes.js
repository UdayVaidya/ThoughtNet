import express from 'express';
import * as ctrl from '../controllers/collection.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const collectionRouter = express.Router();
collectionRouter.use(protect);

/**
 * @route POST /api/collection
 * @access Private
 * @description Create a new collection
 */
collectionRouter.post("/", ctrl.createCollection);
/**
 * @route GET /api/collection
 * @access Private
 * @description Get all collections
 */
collectionRouter.get("/", ctrl.getAllCollections);
/**
 * @route GET /api/collection/:id
 * @access Private
 * @description Get collection by id
 */
collectionRouter.get("/:id", ctrl.getCollection);
/**
 * @route PUT /api/collection/:id
 * @access Private
 * @description Update collection
 */
collectionRouter.put("/:id", ctrl.updateCollection);
/**
 * @route DELETE /api/collection/:id
 * @access Private
 * @description Delete collection
 */
collectionRouter.delete("/:id", ctrl.deleteCollection);
/**
 * @route POST /api/collection/:id/add
 * @access Private
 * @description Add content to collection
 */
collectionRouter.post("/:id/add", ctrl.addToCollection);
/**
 * @route DELETE /api/collection/:id/remove/:contentId
 * @access Private
 * @description Remove content from collection
 */
collectionRouter.delete("/:id/remove/:contentId", ctrl.removeFromCollection);
export default collectionRouter;
