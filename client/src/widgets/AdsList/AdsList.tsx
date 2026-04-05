import type { AdListItem } from "../../shared/types/ad";
import { AdCard } from "../AdCard/AdCard";
import styles from "./AdsList.module.css";

type AdsListProps = {
  ads: AdListItem[];
  viewMode: "grid" | "list";
};

export const AdsList = ({ ads, viewMode }: AdsListProps) => {
  return (
    <div className={viewMode === "grid" ? styles.grid : styles.list}>
      {ads.map((ad, index) => (
        <AdCard key={`${ad.title}-${index}`} ad={ad} viewMode={viewMode} />
      ))}
    </div>
  );
};
