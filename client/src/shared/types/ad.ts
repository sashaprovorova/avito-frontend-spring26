export type AdCategory = "auto" | "real_estate" | "electronics";

export interface AdListItem {
  id: number;
  category: AdCategory;
  title: string;
  price: number | null;
  needsRevision: boolean;
}

export interface AdsListResponse {
  items: AdListItem[];
  total: number;
}

export interface AdDetails {
  id: number;
  category: AdCategory;
  title: string;
  description?: string;
  price: number | null;
  createdAt: string;
  updatedAt: string;
  needsRevision: boolean;
  params:
    | {
        brand?: string;
        model?: string;
        yearOfManufacture?: number;
        transmission?: "automatic" | "manual";
        mileage?: number;
        enginePower?: number;
      }
    | {
        type?: "flat" | "house" | "room";
        address?: string;
        area?: number;
        floor?: number;
      }
    | {
        type?: "phone" | "laptop" | "misc";
        brand?: string;
        model?: string;
        condition?: "new" | "used";
        color?: string;
      };
}

export type AdUpdatePayload = {
  category: "auto" | "real_estate" | "electronics";
  title: string;
  description?: string;
  price: number;
  params:
    | {
        brand?: string;
        model?: string;
        yearOfManufacture?: number;
        transmission?: "automatic" | "manual";
        mileage?: number;
        enginePower?: number;
      }
    | {
        type?: "flat" | "house" | "room";
        address?: string;
        area?: number;
        floor?: number;
      }
    | {
        type?: "phone" | "laptop" | "misc";
        brand?: string;
        model?: string;
        condition?: "new" | "used";
        color?: string;
      };
};
