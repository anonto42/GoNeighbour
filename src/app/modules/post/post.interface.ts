import { Types } from "mongoose"

export type postInterface = {
    createdBy: Types.ObjectId,
    title: string,
    description: string,
    amount: number,
    work_time: Date,
    deadline: Date,
    images: string[],
    // location: {
    //     inText: string,
    //     geoFormet: {
    //         type: string,
    //         coordinates: []
    //     }         
    // }
    address: string
    location: {
            type: string,
            coordinates: number[]
        } ,
    lat: number,
    lot: number
}