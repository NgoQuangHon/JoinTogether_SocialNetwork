import { Router } from "express";
import { RolePermissionController } from "../../controllers/group6-admin/rolePermission.controller";
import { authenticateToken } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/authorization.middleware";

const rolePermissionRouter = Router();
const rpController = new RolePermissionController();

// Tất cả route đều yêu cầu admin
rolePermissionRouter.use(authenticateToken, requireAdmin);

// --- UC7.2: Vai trò ---
rolePermissionRouter.get("/roles", rpController.getRoles);
rolePermissionRouter.get("/roles/:id", rpController.getRoleById);
rolePermissionRouter.post("/roles", rpController.createRole);
rolePermissionRouter.put("/roles/:id", rpController.updateRole);
rolePermissionRouter.delete("/roles/:id", rpController.deleteRole);

// --- UC7.2: Quyền hạn ---
rolePermissionRouter.get("/permissions", rpController.getPermissions);
rolePermissionRouter.get("/permissions/:id", rpController.getPermissionById);
rolePermissionRouter.post("/permissions", rpController.createPermission);
rolePermissionRouter.put("/permissions/:id", rpController.updatePermission);
rolePermissionRouter.delete("/permissions/:id", rpController.deletePermission);

export default rolePermissionRouter;

