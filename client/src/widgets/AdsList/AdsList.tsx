import { useNavigate } from "react-router-dom";
import type { AdListItem } from "../../shared/types/ad";
import { AdCard } from "../AdCard/AdCard";
import styles from "./AdsList.module.css";

interface AdsListProps {
  ads: AdListItem[];
}

export const AdsList = ({ ads }: AdsListProps) => {
  const navigate = useNavigate();

  return (
    <div className={styles.grid}>
      {ads.map((ad, index) => (
        <AdCard
          key={`${ad.title}-${index}`}
          ad={ad}
          onClick={() => navigate(`/ads/${index + 1}`)}
        />
      ))}
    </div>
  );
};
