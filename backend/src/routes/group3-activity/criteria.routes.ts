import { Router } from "express";
import { CriteriaController } from "../../controllers/group3-activity/criteria.controller";
import { authenticateToken } from "../../middlewares/auth.middleware";

const criteriaRouter = Router({ mergeParams: true });
const criteriaController = new CriteriaController();

// These routes will be mounted at /api/activities/:hoatDongId/criteria
criteriaRouter.get("/", authenticateToken, criteriaController.getCriteriaByActivity);
criteriaRouter.post("/", authenticateToken, criteriaController.addCriteria);

export default criteriaRouter;

// Separate router for direct criteria operations (mounted at /api/criteria)
const criteriaDirectRouter = Router();
criteriaDirectRouter.put("/:id", authenticateToken, criteriaController.updateCriteria);
criteriaDirectRouter.delete("/:id", authenticateToken, criteriaController.deleteCriteria);

export { criteriaDirectRouter };
