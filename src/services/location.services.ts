import LocationModel, { LocationDocument } from "../models/location.model";


namespace LocationServices {
    export const getNearBy = async (longitude: number, latitude: number, page: number = 1,
        pageSize: number = 10, minDistance: number = 1000, maxDistance: number = 5000): Promise<{ locations: LocationDocument[], total: number }> => {
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

        const locationsQuery = LocationModel.find(
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

        return { locations, total:100 }
    }
}

export default LocationServices