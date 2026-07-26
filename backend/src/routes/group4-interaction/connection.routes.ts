import { Router } from "express";
import { ConnectionController } from "../../controllers/group4-interaction/connection.controller";
import { authenticateToken } from "../../middlewares/auth.middleware";

const connectionRouter = Router();
const connectionController = new ConnectionController();

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
