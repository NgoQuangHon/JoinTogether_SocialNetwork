import { Router } from "express";
import { BaiVietController } from "../../controllers/group4-interaction/baiViet.controller";
import { authenticateToken } from "../../middlewares/auth.middleware";

const postRouter = Router();
const controller = new BaiVietController();

postRouter.post("/", authenticateToken, controller.create);
postRouter.get("/", authenticateToken, controller.getAll);

postRouter.post("/:id/like", authenticateToken, controller.like);
postRouter.delete("/:id/like", authenticateToken, controller.unlike);

postRouter.get("/:id/comments", authenticateToken, controller.getComments);
postRouter.post("/:id/comments", authenticateToken, controller.addComment);
postRouter.delete("/:id/comments/:commentId", authenticateToken, controller.deleteComment);

postRouter.post("/:id/share", authenticateToken, controller.share);

export default postRouter;
