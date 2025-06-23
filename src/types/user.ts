
export type register = {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

export type filterType = {
    userLat: number;
    userLng: number;
    maxDistance: number;
    minPrice: number;
    maxPrice: number;
}