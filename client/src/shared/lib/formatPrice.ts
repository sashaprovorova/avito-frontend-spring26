export const formatPrice = (price: number | null): string => {
  if (price === null) {
    return "Цена не указана";
  }

  return `${price.toLocaleString("ru-RU")} ₽`;
};
