import { apiClient } from "../../../shared/api/apiClient";
import type { AdUpdatePayload } from "../../../shared/types/ad";

export const generateDescriptionApi = async (
  payload: AdUpdatePayload,
): Promise<{ suggestedDescription: string }> => {
  const response = await apiClient.post("/ai/generate-description", payload);
  return response.data;
};

export const suggestPriceApi = async (
  payload: AdUpdatePayload,
): Promise<{ suggestedPrice: number }> => {
  const response = await apiClient.post("/ai/suggest-price", payload);
  return response.data;
};
