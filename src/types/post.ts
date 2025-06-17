
export type postT = {
    createdBy: any,
    title: string,
    description: string,
    amount: number,
    work_time: Date,
    deadline: Date,
    images: string[],
    location: any
}

export type updatePostT = {
    postId: any,
    createdBy: any,
    title: string,
    description: string,
    amount: number,
    work_time: Date,
    deadline: Date,
    images: string[],
    location: any,
    lat: number,
    lot: number
}