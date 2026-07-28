import { Router } from "express";
import { ConnectionController } from "../../controllers/group4-interaction/connection.controller";
import { FollowController } from "../../controllers/group4-interaction/follow.controller";
import { authenticateToken } from "../../middlewares/auth.middleware";

const connectionRouter = Router();
const connectionController = new ConnectionController();
const followController = new FollowController();

// Connection requests
connectionRouter.post(
  "/request",
  authenticateToken,
  connectionController.sendRequest,
);
connectionRouter.put(
  "/request/:id",
  authenticateToken,
  connectionController.respondToRequest,
);
connectionRouter.get(
  "/requests",
  authenticateToken,
  connectionController.getPendingRequests,
);

// Suggestions
connectionRouter.get(
  "/suggestions",
  authenticateToken,
  connectionController.getSuggestions,
);

// Follow
connectionRouter.post(
  "/:id/follow",
  authenticateToken,
  followController.follow,
);
connectionRouter.delete(
  "/:id/follow",
  authenticateToken,
  followController.unfollow,
);
connectionRouter.get(
  "/:id/follow",
  authenticateToken,
  followController.checkFollowing,
);

// Connections
connectionRouter.get(
  "/",
  authenticateToken,
  connectionController.getConnections,
);
connectionRouter.delete(
  "/:id",
  authenticateToken,
  connectionController.removeConnection,
);

export default connectionRouter;
