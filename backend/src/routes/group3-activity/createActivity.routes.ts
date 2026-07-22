import { Router } from "express";
import { CreateActivityController } from "../../controllers/group3-activity/createActivity.controller";

const createActivityRouter = Router();
const createActivityController = new CreateActivityController();

createActivityRouter.post("/", createActivityController.createActivity);
createActivityRouter.get("/", createActivityController.getAllActivities);
createActivityRouter.get("/:id", createActivityController.getActivityById);
createActivityRouter.put("/:id", createActivityController.updateActivity);
createActivityRouter.delete("/:id", createActivityController.deleteActivity);

export default createActivityRouter;
