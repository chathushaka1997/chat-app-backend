import { Document, Schema, SchemaOptions, model } from 'mongoose';

export interface LocationInput {
    location: {
        coordinates: number[];
        type: string
    };
    name: string;
}

export interface LocationDocument extends Document, LocationInput { }

const LocationOptions: SchemaOptions<LocationDocument> = {
    _id: true,
    id: false,
    timestamps: true,
    strict: true,
    toJSON: {
        getters: true,
        virtuals: true,
    },
};

export const locationSchema = new Schema<LocationDocument>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        location: {
            coordinates: [{
                type: Number,
                required: true,
            }],
            type: {
                type: String,
                required: true,
                default: "Point"
            }
        },
    },
    LocationOptions,
);

const LocationModel = model<LocationDocument>('location', locationSchema);
export default LocationModel;