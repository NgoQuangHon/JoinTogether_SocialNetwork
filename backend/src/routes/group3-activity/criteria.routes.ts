import { Router } from "express";
import { CriteriaController } from "../../controllers/group3-activity/criteria.controller";
import { authenticateToken } from "../../middlewares/auth.middleware";
import {
  requireActivityOwner,
  requireCriteriaOwner,
} from "../../middlewares/authorization.middleware";

const criteriaRouter = Router({ mergeParams: true });
const criteriaController = new CriteriaController();

// These routes will be mounted at /api/activities/:hoatDongId/criteria
criteriaRouter.get("/", authenticateToken, criteriaController.getCriteriaByActivity);
criteriaRouter.post("/", authenticateToken, requireActivityOwner("hoatDongId"), criteriaController.addCriteria);

export default criteriaRouter;

// Separate router for direct criteria operations (mounted at /api/criteria)
const criteriaDirectRouter = Router();
criteriaDirectRouter.put("/:id", authenticateToken, requireCriteriaOwner("id"), criteriaController.updateCriteria);
criteriaDirectRouter.delete("/:id", authenticateToken, requireCriteriaOwner("id"), criteriaController.deleteCriteria);

export { criteriaDirectRouter };
