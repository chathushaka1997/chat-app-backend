import { Router } from "express";
import ConnectionControllers from "../controllers/connection.controllers";

export function initConnectionRoutes(router: Router) {
    router.post('/connections/near-by', ConnectionControllers.getNearByUsers)
    router.post('/connections/create', ConnectionControllers.create)
}