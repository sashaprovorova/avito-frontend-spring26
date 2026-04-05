import { apiClient } from "../../../shared/api/apiClient";
import type { AdsListResponse } from "../../../shared/types/ad";

export const getAdsApi = async (): Promise<AdsListResponse> => {
  const response = await apiClient.get("/items");
  return response.data;
};
