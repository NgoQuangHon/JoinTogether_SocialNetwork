import { Router } from "express";
import { ActivityController } from "../../controllers/group3-activity/activity.controller";
import { CriteriaController } from "../../controllers/group3-activity/criteria.controller";
import searchRouter, { searchHistoryRouter } from "../../routes/group3-activity/search.routes";
import memberRouter from "../../routes/group3-activity/member.routes";
import { authenticateToken } from "../../middlewares/auth.middleware";
import {
  requireActivityOwner,
  requireAdmin,
  requireImageOwner,
} from "../../middlewares/authorization.middleware";

// "báo" — Router cha duy nhất quản lý toàn bộ sub-route của /api/activities
// Không cho phép bất kỳ route nào "đẻ con" (tự sinh standalone) ngoài bao này
const activityRouter = Router();
const activityController = new ActivityController();
const criteriaController = new CriteriaController();

// ⚠️ ORDER IMPORTANT: Static routes must be defined BEFORE parameterized routes /:id!

// --- Search (must be before /:id routes) ---
activityRouter.use("/search", searchRouter);

// --- Search history (must be before /:id routes) ---
activityRouter.use("/search-history", searchHistoryRouter);

// --- Categories (must be before /:id routes) ---
activityRouter.get("/categories", authenticateToken, activityController.getAllCategories);
activityRouter.post("/categories", authenticateToken, requireAdmin, activityController.createCategory);
activityRouter.put("/categories/:id", authenticateToken, requireAdmin, activityController.updateCategory);
activityRouter.delete("/categories/:id", authenticateToken, requireAdmin, activityController.deleteCategory);

// --- Locations (must be before /:id routes) ---
activityRouter.get("/locations", authenticateToken, activityController.getAllLocations);
activityRouter.post("/locations", authenticateToken, activityController.createLocation);
activityRouter.put("/locations/:id", authenticateToken, activityController.updateLocation);
activityRouter.delete("/locations/:id", authenticateToken, activityController.deleteLocation);

// --- Criteria direct routes (MUST be before /:id — otherwise Express matches /:id first) ---
activityRouter.put("/criteria/:id", authenticateToken, criteriaController.updateCriteria);
activityRouter.delete("/criteria/:id", authenticateToken, criteriaController.deleteCriteria);

// --- Criteria nested under /:hoatDongId/criteria (static path "criteria" won't conflict with /:id) ---
activityRouter.get("/:hoatDongId/criteria", authenticateToken, criteriaController.getCriteriaByActivity);
activityRouter.post("/:hoatDongId/criteria", authenticateToken, requireActivityOwner(), criteriaController.addCriteria);

// --- Member/Join routes (must be before generic /:id CRUD) ---
activityRouter.use("/", memberRouter);

// --- Activity CRUD (parameterized /:id routes — must come AFTER all static routes!) ---
activityRouter.post("/", authenticateToken, activityController.createActivity);
activityRouter.get("/", authenticateToken, activityController.getAllActivities);
activityRouter.get("/:id", authenticateToken, activityController.getActivityById);
activityRouter.put("/:id", authenticateToken, requireActivityOwner("id"), activityController.updateActivity);
activityRouter.delete("/:id", authenticateToken, requireActivityOwner("id"), activityController.deleteActivity);

// --- Images (nested under /:id/images + /images/:id) ---
activityRouter.post("/:id/images", authenticateToken, requireActivityOwner("id"), activityController.addImage);
activityRouter.delete("/images/:id", authenticateToken, requireImageOwner("id"), activityController.deleteImage);

export default activityRouter;
