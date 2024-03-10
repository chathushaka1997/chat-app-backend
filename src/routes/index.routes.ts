import { Request, Response, Router } from "express";
import { initUserRoutes } from "./user.routes";
import { initLocationRoutes } from "./location.routes";
import { initConnectionRoutes } from "./conenction.routes";


export function initRoutes() {

    const indexRouter = Router()

    initUserRoutes(indexRouter)
    initLocationRoutes(indexRouter)
    initConnectionRoutes(indexRouter)
    indexRouter.all('*', (req: Request, res: Response) => res.status(404).send({ error: "Route Not Found" }));
    return indexRouter
}


