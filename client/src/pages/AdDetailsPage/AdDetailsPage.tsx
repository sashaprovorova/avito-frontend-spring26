import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAdByIdApi } from "../../features/ads/api/adsApi";
import type { AdDetails } from "../../shared/types/ad";
import { formatPrice } from "../../shared/lib/formatPrice";
import Loader from "../../shared/ui/Loader/Loader";
import styles from "./AdDetailsPage.module.css";

const paramLabels: Record<string, string> = {
  description: "Описание",
  brand: "Бренд",
  model: "Модель",
  yearOfManufacture: "Год выпуска",
  transmission: "Коробка передач",
  mileage: "Пробег",
  enginePower: "Мощность двигателя",
  type: "Тип",
  address: "Адрес",
  area: "Площадь",
  floor: "Этаж",
  condition: "Состояние",
  color: "Цвет",
};

const requiredFieldsByCategory = {
  auto: [
    "brand",
    "model",
    "yearOfManufacture",
    "transmission",
    "mileage",
    "enginePower",
  ],
  real_estate: ["type", "address", "area", "floor"],
  electronics: ["type", "brand", "model", "condition", "color"],
} as const;

const getMissingFields = (ad: AdDetails): string[] => {
  const missingFields: string[] = [];

  if (!ad.description?.trim()) {
    missingFields.push(paramLabels.description);
  }

  const requiredParams = requiredFieldsByCategory[ad.category] ?? [];

  requiredParams.forEach((fieldName) => {
    const value = ad.params?.[fieldName as keyof typeof ad.params];

    if (value === undefined || value === null || value === "") {
      missingFields.push(paramLabels[fieldName] ?? fieldName);
    }
  });

  return missingFields;
};

export const AdDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ad, setAd] = useState<AdDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        setIsLoading(true);
        setErrorText(null);

        if (!id) {
          throw new Error("Missing ad id");
        }

        const data = await getAdByIdApi(id);
        setAd(data);
      } catch (error) {
        console.error("Не удалось загрузить объявление", error);
        setErrorText("Не удалось загрузить объявление");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAd();
  }, [id]);

  if (isLoading) {
    return <Loader />;
  }

  if (errorText || !ad) {
    return <div>{errorText ?? "Объявление не найдено"}</div>;
  }

  const missingFields = getMissingFields(ad);

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div>
            <h1 className={styles.title}>{ad.title}</h1>

            <button
              className={styles.edit}
              onClick={() => navigate(`/ads/${ad.id}/edit`)}
            >
              Редактировать
            </button>
          </div>

          <div className={styles.priceBlock}>
            <div className={styles.price}>{formatPrice(ad.price)}</div>

            <div className={styles.dates}>
              <p>
                Опубликовано: {new Date(ad.createdAt).toLocaleString("ru-RU")}
              </p>
              <p>
                Отредактировано:{" "}
                {new Date(ad.updatedAt).toLocaleString("ru-RU")}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.main}>
          <div className={styles.imageColumn}>
            <div className={styles.image}>Нет фото</div>

            <div className={styles.thumbnails}>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className={styles.thumbnail}>
                  Нет фото
                </div>
              ))}
            </div>
          </div>

          <div className={styles.info}>
            {ad.needsRevision && (
              <div className={styles.warning}>
                <div className={styles.warningHeader}>
                  <span className={styles.warningIcon}>!</span>
                  <span className={styles.warningTitle}>
                    Требуются доработки
                  </span>
                </div>

                <p className={styles.warningText}>
                  У объявления не заполнены поля:
                </p>

                <ul className={styles.warningList}>
                  {missingFields.map((field) => (
                    <li key={field}>{field}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.characteristics}>
              <h3>Характеристики</h3>

              {Object.entries(ad.params ?? {}).map(([key, value]) => (
                <div key={key} className={styles.row}>
                  <span className={styles.label}>
                    {paramLabels[key] ?? key}
                  </span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.descriptionBlock}>
          <h3>Описание</h3>
          <p>{ad.description || "Описание не указано"}</p>
        </div>
      </div>
    </section>
  );
};
