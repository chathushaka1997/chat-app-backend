import { Router } from "express";
import LocationControllers from "../controllers/location.controllers";


export function initLocationRoutes(router: Router) {
    router.post('/locations', LocationControllers.getNearByLocations)
}
