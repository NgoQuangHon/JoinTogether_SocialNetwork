import { Router } from "express";
import { BaiVietController } from "../../controllers/group4-interaction/baiViet.controller";
import { authenticateToken } from "../../middlewares/auth.middleware";

const postRouter = Router();
const controller = new BaiVietController();

postRouter.post("/", authenticateToken, controller.create);
postRouter.get("/", authenticateToken, controller.getAll);

export default postRouter;
