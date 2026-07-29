import { Router } from "express";
import { AuthController } from "../../controllers/group1-user/auth.controller";
import { authenticateToken } from "../../middlewares/auth.middleware";

const authRouter = Router();
const authController = new AuthController();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/verify-email", authController.verifyEmail);
authRouter.post("/resend-code", authController.resendCode);
authRouter.post("/request-password-reset", authController.requestPasswordReset);
authRouter.post("/reset-password", authController.resetPassword);
authRouter.put("/change-password", authenticateToken, authController.changePassword);
authRouter.post("/send-phone-otp", authenticateToken, authController.sendPhoneOtp);
authRouter.post("/verify-phone-otp", authenticateToken, authController.verifyPhoneOtp);

export default authRouter;
