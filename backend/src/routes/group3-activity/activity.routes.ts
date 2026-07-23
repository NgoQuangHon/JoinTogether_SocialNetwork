import { Router } from "express";
import { ActivityController } from "../../controllers/group3-activity/activity.controller";
import { authenticateToken } from "../../middlewares/auth.middleware";

const activityRouter = Router();
const activityController = new ActivityController();

// Categories (must be before /:id routes)
activityRouter.get("/categories", authenticateToken, activityController.getAllCategories);
activityRouter.post("/categories", authenticateToken, activityController.createCategory);
activityRouter.put("/categories/:id", authenticateToken, activityController.updateCategory);
activityRouter.delete("/categories/:id", authenticateToken, activityController.deleteCategory);

// Locations (must be before /:id routes)
activityRouter.get("/locations", authenticateToken, activityController.getAllLocations);
activityRouter.post("/locations", authenticateToken, activityController.createLocation);
activityRouter.put("/locations/:id", authenticateToken, activityController.updateLocation);
activityRouter.delete("/locations/:id", authenticateToken, activityController.deleteLocation);

// Activity CRUD
activityRouter.post("/", authenticateToken, activityController.createActivity);
activityRouter.get("/", authenticateToken, activityController.getAllActivities);
activityRouter.get("/:id", authenticateToken, activityController.getActivityById);
activityRouter.put("/:id", authenticateToken, activityController.updateActivity);
activityRouter.delete("/:id", authenticateToken, activityController.deleteActivity);

// Images (nested under activity)
activityRouter.post("/:id/images", authenticateToken, activityController.addImage);
activityRouter.delete("/images/:id", authenticateToken, activityController.deleteImage);

export default activityRouter;
