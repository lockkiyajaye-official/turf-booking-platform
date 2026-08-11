import api from "./api";

export interface Turf {
    id: string;
    name: string;
    description: string;
    address: string;
    pricePerHour: number;
    images: string[];
    rating: number | string;
    totalReviews: number;
    amenities?: string[];
    contactEmail?: string;
    contactPhone?: string;
    rules?: string[];
}

export const getFavorites = async (): Promise<Turf[]> => {
    const response = await api.get("/favorites");
    return response.data?.data || [];
};

export const checkFavorite = async (turfId: string): Promise<boolean> => {
    const response = await api.get(`/favorites/check/${turfId}`);
    return !!response.data?.isFavorite;
};

export const addFavorite = async (turfId: string): Promise<void> => {
    await api.post(`/favorites/${turfId}`);
};

export const removeFavorite = async (turfId: string): Promise<void> => {
    await api.delete(`/favorites/${turfId}`);
};
