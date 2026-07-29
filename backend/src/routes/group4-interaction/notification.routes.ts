import { Router } from "express";
import { NotificationController } from "../../controllers/group4-interaction/notification.controller";
import { authenticateToken } from "../../middlewares/auth.middleware";

const notificationRouter = Router();
const notificationController = new NotificationController();

notificationRouter.get(
  "/",
  authenticateToken,
  notificationController.getNotifications,
);

notificationRouter.delete(
  "/:id",
  authenticateToken,
  notificationController.deleteNotification,
);

export default notificationRouter;
