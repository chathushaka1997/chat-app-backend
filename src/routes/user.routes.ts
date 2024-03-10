import { Router } from "express";
import UserControllers from "../controllers/user.controllers";



export function initUserRoutes(router: Router) {
    router.get('/example', UserControllers.CreateUser)
}

