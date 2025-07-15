import express from "express";
import { DataScraperController } from "./dataScraper.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = express.Router();

router.post("/", DataScraperController.create);

router.get("/", DataScraperController.getAll);

export const DataScraperRoutes = router;
