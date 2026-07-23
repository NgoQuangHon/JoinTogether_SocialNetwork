import { Router } from "express";
import { ActivityController } from "../../controllers/group3-activity/activity.controller";
import { authenticateToken } from "../../middlewares/auth.middleware";
import {
  requireActivityOwner,
  requireAdmin,
  requireImageOwner,
} from "../../middlewares/authorization.middleware";

const activityRouter = Router();
const activityController = new ActivityController();

// Categories (must be before /:id routes)
activityRouter.get("/categories", authenticateToken, activityController.getAllCategories);
activityRouter.post("/categories", authenticateToken, requireAdmin, activityController.createCategory);
activityRouter.put("/categories/:id", authenticateToken, requireAdmin, activityController.updateCategory);
activityRouter.delete("/categories/:id", authenticateToken, requireAdmin, activityController.deleteCategory);

// Locations (must be before /:id routes)
activityRouter.get("/locations", authenticateToken, activityController.getAllLocations);
activityRouter.post("/locations", authenticateToken, requireAdmin, activityController.createLocation);
activityRouter.put("/locations/:id", authenticateToken, requireAdmin, activityController.updateLocation);
activityRouter.delete("/locations/:id", authenticateToken, requireAdmin, activityController.deleteLocation);

// Activity CRUD
activityRouter.post("/", authenticateToken, activityController.createActivity);
activityRouter.get("/", authenticateToken, activityController.getAllActivities);
activityRouter.get("/:id", authenticateToken, activityController.getActivityById);
activityRouter.put("/:id", authenticateToken, requireActivityOwner("id"), activityController.updateActivity);
activityRouter.delete("/:id", authenticateToken, requireActivityOwner("id"), activityController.deleteActivity);

// Images (nested under activity)
activityRouter.post("/:id/images", authenticateToken, requireActivityOwner("id"), activityController.addImage);
activityRouter.delete("/images/:id", authenticateToken, requireImageOwner("id"), activityController.deleteImage);

export default activityRouter;
