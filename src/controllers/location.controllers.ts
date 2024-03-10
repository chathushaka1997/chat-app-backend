import { NextFunction, Request, Response } from "express";
import LocationServices from "../services/location.services";


namespace LocationControllers {
    export const getNearByLocations = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { longitude, latitude, minDistance, maxDistance } = req.body
            const locationList = await LocationServices.getNearBy(longitude, latitude,1,10, minDistance, maxDistance)
            res.send({ data: locationList })
        } catch (error) {
            if (error instanceof Error) {

                res.status(500).send({ error: error.message })
            } else {
                res.status(500).send({ error: "Unknown error occurred" })
            }
        }

    }
}

export default LocationControllers