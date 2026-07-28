import { Router } from "express";
import { FollowController } from "../../controllers/group4-interaction/follow.controller";
import { authenticateToken } from "../../middlewares/auth.middleware";

const followRouter = Router();
const controller = new FollowController();

followRouter.post("/:id/follow", authenticateToken, controller.follow);
followRouter.delete("/:id/follow", authenticateToken, controller.unfollow);
followRouter.get("/:id/follow", authenticateToken, controller.checkFollowing);

export default followRouter;
