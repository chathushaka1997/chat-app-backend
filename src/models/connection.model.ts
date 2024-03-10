import { Document, Schema, SchemaOptions, model } from 'mongoose';

export interface ConnectionInput {
    socketId:string;
    userId: string;
    userName: string;
    currentlyChatWith: string | undefined;
    location: {
        coordinates: number[];
        type: string
    };
}

export interface ConnectionDocument extends Document, ConnectionInput { }

const ConnectionOptions: SchemaOptions<ConnectionDocument> = {
    _id: true,
    id: false,
    timestamps: true,
    strict: true,
    toJSON: {
        getters: true,
        virtuals: true,
    },
};

export const connectionSchema = new Schema<ConnectionDocument>(
    {
        userId: {
            type: String,
            required: true,
            unique:true
        },
        socketId: {
            type: String,
            required: true,
        },
        userName: {
            type: String,
            required: true,
        },
        currentlyChatWith: {
            type: String,
            required: false,
        },
        location: {
            /* First longitude and then latitude */
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
    ConnectionOptions,
);

const ConnectionModel = model<ConnectionDocument>('connection', connectionSchema);
export default ConnectionModel;