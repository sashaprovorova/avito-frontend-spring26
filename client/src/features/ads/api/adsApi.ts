import { apiClient } from "../../../shared/api/apiClient";
import type { AdsListResponse, AdDetails } from "../../../shared/types/ad";

export const getAdsApi = async (): Promise<AdsListResponse> => {
  const response = await apiClient.get("/items");
  return response.data;
};

export const getAdByIdApi = async (id: string): Promise<AdDetails> => {
  const response = await apiClient.get(`/items/${id}`);
  return response.data;
};
