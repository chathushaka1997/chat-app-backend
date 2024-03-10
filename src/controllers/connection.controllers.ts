import { NextFunction, Request, Response } from "express";
import ConnectionServices from "../services/connection.services";

namespace ConnectionControllers {

    export const create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { data } = req.body
            const newConnection = await ConnectionServices.createConnection(data)
            res.send({ data: newConnection })
        } catch (error) {
            if (error instanceof Error) {

                res.status(500).send({ error: error.message })
            } else {
                res.status(500).send({ error: "Unknown error occurred" })
            }
        }
    }
    export const getNearByUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { longitude, latitude, minDistance, maxDistance } = req.body
            const newConnection = await ConnectionServices.getNearBy(longitude, latitude,1,10, minDistance, maxDistance)
            res.send({ data: newConnection })
        } catch (error) {
            if (error instanceof Error) {

                res.status(500).send({ error: error.message })
            } else {
                res.status(500).send({ error: "Unknown error occurred" })
            }
        }
    }

}
export default ConnectionControllers