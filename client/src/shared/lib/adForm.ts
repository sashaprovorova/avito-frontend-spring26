import type { AdUpdatePayload } from "../types/ad";

export const sanitizeParams = (params: Record<string, unknown>) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      if (typeof value === "number" && Number.isNaN(value)) return false;
      return true;
    }),
  );
};

export const getEmptyParamsByCategory = (
  category: AdUpdatePayload["category"],
) => {
  switch (category) {
    case "auto":
      return {
        brand: "",
        model: "",
        yearOfManufacture: undefined,
        transmission: undefined,
        mileage: undefined,
        enginePower: undefined,
      };

    case "real_estate":
      return {
        type: undefined,
        address: "",
        area: undefined,
        floor: undefined,
      };

    case "electronics":
      return {
        type: undefined,
        brand: "",
        model: "",
        condition: undefined,
        color: "",
      };

    default:
      return {};
  }
};
