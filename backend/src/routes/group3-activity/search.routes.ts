import { Router } from "express";
import { SearchController } from "../../controllers/group3-activity/search.controller";
import { authenticateToken } from "../../middlewares/auth.middleware";

// SearchRouter — mounted at /api/activities/search
const searchRouter = Router();
const searchController = new SearchController();

searchRouter.get("/", authenticateToken, searchController.searchActivities);

export default searchRouter;

// SearchHistoryRouter — mounted at /api/activities/search-history
const searchHistoryRouter = Router();

searchHistoryRouter.get("/", authenticateToken, searchController.getSearchHistory);
searchHistoryRouter.delete("/", authenticateToken, searchController.clearSearchHistory);

export { searchHistoryRouter };
