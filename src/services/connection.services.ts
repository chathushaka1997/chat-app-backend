import ConnectionModel, { ConnectionDocument, ConnectionInput } from "../models/connection.model"

namespace ConnectionServices {
    export const createConnection = async (connectionData: ConnectionInput): Promise<ConnectionDocument | undefined> => {

        try {
            const newConnection = new ConnectionModel(connectionData)
            await newConnection.validate();
            return await newConnection.save()
        } catch (error) {
            console.log(error);
            throw error
        }

    }

    export const getNearBy = async (longitude: number, latitude: number, page: number = 1,
        pageSize: number = 10, minDistance: number = 1000, maxDistance: number = 5000): Promise<{ locations: ConnectionDocument[], total: number }> => {
        const skip = (page - 1) * pageSize;

        /*     const countQuery = LocationModel.find({
                location: {
                    $nearSphere: {
                        $geometry: { type: "Point", coordinates: [longitude, latitude] },
                        $minDistance: minDistance,
                        $maxDistance: maxDistance
                    }
                }
            }).countDocuments(); */

        const locationsQuery = ConnectionModel.find(
            {
                location:
                {
                    $nearSphere:
                    {
                        $geometry: { type: "Point", coordinates: [longitude, latitude] },
                        $minDistance: minDistance,
                        $maxDistance: maxDistance
                    }
                }
            }
        ).skip(skip)
            .limit(pageSize);

        const [locations] = await Promise.all([locationsQuery]);

        return { locations, total: 100 }
    }

}

export default ConnectionServices