import { Router } from "express";
import { DashboardController } from "../../controllers/producer/dashboard.controller";
import { authenticateJWT, checkStatus } from "../../middlewares/auth.middleware";

const DashboardRouter = Router();

DashboardRouter.use(authenticateJWT);
DashboardRouter.use(checkStatus);

DashboardRouter.get("/overview", DashboardController.getOverview);
DashboardRouter.get("/user-insights", DashboardController.getUserInsights);
DashboardRouter.get("/trends", DashboardController.getTrends);
DashboardRouter.get("/ratings", DashboardController.getRatings);
DashboardRouter.get("/event-insights", DashboardController.getEventInsights);
DashboardRouter.get("/dish-ratings", DashboardController.getDishRatings);
DashboardRouter.get("/get-categories", DashboardController.getCategories);
DashboardRouter.get("/menu-overview", DashboardController.getMenuOverview);
DashboardRouter.get("/dish-drop-alerts",DashboardController.getDishDropAlerts);


export default DashboardRouter;
