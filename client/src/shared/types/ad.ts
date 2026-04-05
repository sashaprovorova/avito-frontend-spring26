export type AdCategory = "auto" | "real_estate" | "electronics";

export interface AdListItem {
  category: AdCategory;
  title: string;
  price: number | null;
  needsRevision: boolean;
}

export interface AdsListResponse {
  items: AdListItem[];
  total: number;
}
