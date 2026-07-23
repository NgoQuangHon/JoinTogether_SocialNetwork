import { Router } from "express";
import { SearchController } from "../../controllers/group3-activity/search.controller";
import { authenticateToken } from "../../middlewares/auth.middleware";

const searchRouter = Router();
const searchController = new SearchController();

// Search activities (mounted at /api/activities/search)
searchRouter.get("/", authenticateToken, searchController.searchActivities);

export default searchRouter;

// Search history routes (mounted at /api/search-history)
const searchHistoryRouter = Router();
searchHistoryRouter.get("/", authenticateToken, searchController.getSearchHistory);
searchHistoryRouter.delete("/", authenticateToken, searchController.clearSearchHistory);

export { searchHistoryRouter };
