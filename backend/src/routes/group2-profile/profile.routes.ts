import { Router } from "express";
import { ProfileController } from "../../controllers/group2-profile/profile.controller";
import { authenticateToken } from "../../middlewares/auth.middleware";

const profileRouter = Router();
const profileController = new ProfileController();

// UC1.3 - Profile Management
profileRouter.get(
  "/my-profile",
  authenticateToken,
  profileController.getMyProfile,
);
profileRouter.put("/", authenticateToken, profileController.updateProfile);
profileRouter.put("/avatar", authenticateToken, profileController.updateAvatar);

// UC1.4 - Interest Management
profileRouter.get(
  "/interests/categories",
  authenticateToken,
  profileController.getAllInterestCategories,
);
profileRouter.get(
  "/interests",
  authenticateToken,
  profileController.getUserInterests,
);
profileRouter.post(
  "/interests",
  authenticateToken,
  profileController.addInterest,
);
profileRouter.delete(
  "/interests/:soThichId",
  authenticateToken,
  profileController.removeInterest,
);
profileRouter.put(
  "/interests/goals",
  authenticateToken,
  profileController.updateGoals,
);
profileRouter.get(
  "/ai-match",
  authenticateToken,
  profileController.getAIMatches,
);
profileRouter.get("/:id", authenticateToken, profileController.getProfile);

export default profileRouter;
