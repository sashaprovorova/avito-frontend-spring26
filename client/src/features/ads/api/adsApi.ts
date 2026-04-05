import { apiClient } from "../../../shared/api/apiClient";
import type {
  AdsListResponse,
  AdDetails,
  AdUpdatePayload,
  AdCategory,
} from "../../../shared/types/ad";

type GetAdsParams = {
  q?: string;
  categories?: AdCategory[];
  needsRevision?: boolean;
  sortColumn?: "title" | "createdAt";
  sortDirection?: "asc" | "desc";
  limit?: number;
  skip?: number;
};

export const getAdsApi = async (
  params: GetAdsParams = {},
): Promise<AdsListResponse> => {
  const searchParams = new URLSearchParams();

  if (params.q) {
    searchParams.set("q", params.q);
  }

  if (params.categories && params.categories.length > 0) {
    searchParams.set("categories", params.categories.join(","));
  }

  if (params.needsRevision) {
    searchParams.set("needsRevision", "true");
  }

  if (params.sortColumn) {
    searchParams.set("sortColumn", params.sortColumn);
  }

  if (params.sortDirection) {
    searchParams.set("sortDirection", params.sortDirection);
  }

  if (typeof params.limit === "number") {
    searchParams.set("limit", String(params.limit));
  }

  if (typeof params.skip === "number") {
    searchParams.set("skip", String(params.skip));
  }

  const response = await apiClient.get(`/items?${searchParams.toString()}`);
  return response.data;
};

export const getAdByIdApi = async (id: string): Promise<AdDetails> => {
  const response = await apiClient.get(`/items/${id}`);
  return response.data;
};

export const updateAdByIdApi = async (
  id: string,
  payload: AdUpdatePayload,
): Promise<{ success: boolean }> => {
  const response = await apiClient.put(`/items/${id}`, payload);
  return response.data;
};
