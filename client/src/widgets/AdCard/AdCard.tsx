import styles from "./AdCard.module.css";
import type { AdListItem, AdCategory } from "../../shared/types/ad";
import { formatPrice } from "../../shared/lib/formatPrice";

interface AdCardProps {
  ad: AdListItem;
  onClick?: () => void;
}

const categoryLabels: Record<AdCategory, string> = {
  auto: "Авто",
  real_estate: "Недвижимость",
  electronics: "Электроника",
};

export const AdCard = ({ ad, onClick }: AdCardProps) => {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.image}>Нет фото</div>

      <div className={styles.content}>
        <span className={styles.category}>{categoryLabels[ad.category]}</span>
        <h3 className={styles.title}>{ad.title}</h3>
        <p className={styles.price}>{formatPrice(ad.price)}</p>
        {ad.needsRevision && (
          <span className={styles.badge}>Требует доработки</span>
        )}
      </div>
    </div>
  );
};
