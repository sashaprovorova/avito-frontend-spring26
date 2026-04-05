import { useEffect, useState } from "react";
import { getAdsApi } from "../../features/ads/api/adsApi";
import type { AdListItem } from "../../shared/types/ad";
import Loader from "../../shared/ui/Loader/Loader";
import { AdsList } from "../../widgets/AdsList/AdsList";

export const AdsListPage = () => {
  const [ads, setAds] = useState<AdListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getAdsApi();
        setAds(data.items);
      } catch (error) {
        console.error("Failed to load ads", error);
        setError("Failed to load ads");
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  if (loading) return <Loader />;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Мои объявления</h1>
      <p>{ads.length} объявлений</p>
      <AdsList ads={ads} />
    </div>
  );
};
