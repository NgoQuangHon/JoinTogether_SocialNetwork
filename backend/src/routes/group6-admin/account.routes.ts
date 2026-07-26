import { Router } from "express";
import { AccountController } from "../../controllers/group6-admin/account.controller";
import { authenticateToken } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/authorization.middleware";

const accountRouter = Router();
const accountController = new AccountController();

// Tất cả route đều yêu cầu admin
accountRouter.use(authenticateToken, requireAdmin);

// --- UC7.1: Quản lý tài khoản ---
accountRouter.get("/", accountController.getUsers);
accountRouter.get("/:id", accountController.getUserById);
accountRouter.put("/:id", accountController.updateUser);
accountRouter.put("/:id/lock", accountController.lockAccount);
accountRouter.put("/:id/unlock", accountController.unlockAccount);

export default accountRouter;
