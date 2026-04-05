import styles from "./AdCard.module.css";
import type { AdListItem, AdCategory } from "../../shared/types/ad";
import { formatPrice } from "../../shared/lib/formatPrice";
import { Link } from "react-router-dom";

interface AdCardProps {
  ad: AdListItem;
  viewMode: "grid" | "list";
}

const categoryLabels: Record<AdCategory, string> = {
  auto: "Авто",
  real_estate: "Недвижимость",
  electronics: "Электроника",
};

export const AdCard = ({ ad, viewMode }: AdCardProps) => {
  return (
    <Link to={`/ads/${ad.id}`} className={styles.cardLink}>
      <div className={viewMode === "grid" ? styles.cardGrid : styles.cardList}>
        <div
          className={viewMode === "grid" ? styles.imageGrid : styles.imageList}
        >
          <span>Нет фото</span>
        </div>

        <div className={styles.content}>
          <span className={styles.category}>{categoryLabels[ad.category]}</span>
          <h3 className={styles.title}>{ad.title}</h3>
          <p className={styles.price}>{formatPrice(ad.price)}</p>
          {ad.needsRevision && (
            <span className={styles.badge}>Требует доработки</span>
          )}
        </div>
      </div>
    </Link>
  );
};
