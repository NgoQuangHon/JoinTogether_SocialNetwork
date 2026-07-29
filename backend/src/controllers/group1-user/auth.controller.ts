import { Request, Response } from "express";
import { AuthService } from "../../services/group1-user/auth.service";
import { asyncHandler } from "../../utils/asyncHandler";

export class AuthController {
  private authService = new AuthService();

  public register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.register(req.body);
    res.status(201).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  });

  public login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.login(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  public verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { taiKhoanId, maXacThuc } = req.body;
    const result = await this.authService.verifyEmail(taiKhoanId, maXacThuc);
    res.status(200).json({
      success: true,
      message: result.message,
      data: { token: result.token, nguoiDungId: result.nguoiDungId, roles: result.roles, role: result.role },
    });
  });

  public resendCode = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { taiKhoanId } = req.body;
    const result = await this.authService.resendVerificationCode(taiKhoanId);
    res.status(200).json({ success: true, message: result.message });
  });

  public requestPasswordReset = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    const result = await this.authService.requestPasswordReset(email);
    res.status(200).json({ success: true, message: result.message });
  });

  public resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.resetPassword(req.body);
    res.status(200).json({ success: true, message: result.message });
  });
}
