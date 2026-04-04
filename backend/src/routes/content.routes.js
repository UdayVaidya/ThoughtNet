import express from 'express';
import * as ctrl from '../controllers/content.controller.js';
import { validateContent } from '../middleware/validate.middleware.js';
import { protect } from '../middleware/auth.middleware.js';

const contentRouter = express.Router();
contentRouter.use(protect);
/**
 * @route GET /api/content
 * @access Private
 * @description Get all content
 */
contentRouter.get("/stats", ctrl.getStats);

/**
 * @route GET /api/content
 * @access Private
 * @description Resurface memories
 */
contentRouter.get("/resurface", ctrl.resurfaceMemories);

/**
 * @route GET /api/content
 * @access Private
 * @description Save content
 */
contentRouter.post("/", validateContent, ctrl.saveContent);

/**
 * @route GET /api/content
 * @access Private
 * @description Get all content
 */
contentRouter.get("/", ctrl.getAllContent);

/**
 * @route GET /api/content
 * @access Private
 * @description Get content by id
 */
contentRouter.get("/:id", ctrl.getContent);
/**
 * @route GET /api/content
 * @access Private
 * @description Update content
 */
contentRouter.put("/:id", ctrl.updateContent);
/**
 * @route GET /api/content
 * @access Private
 * @description Delete content
 */
contentRouter.delete("/:id", ctrl.deleteContent);
/**
 * @route GET /api/content
 * @access Private
 * @description Add highlight
 */
contentRouter.post("/:id/highlight", ctrl.addHighlight);
/**
 * @route GET /api/content
 * @access Private
 * @description Remove highlight
 */
contentRouter.delete("/:id/highlight/:highlightId", ctrl.removeHighlight);
/**
 * @route GET /api/content
 * @access Private
 * @description Toggle favorite
 */
contentRouter.patch("/:id/favorite", ctrl.toggleFavorite);
/**
 * @route GET /api/content
 * @access Private
 * @description Toggle archive
 */
contentRouter.patch("/:id/archive", ctrl.toggleArchive);
/**
 * @route GET /api/content
 * @access Private
 * @description Update progress
 */
contentRouter.patch("/:id/progress", ctrl.updateProgress);

export default contentRouter;
