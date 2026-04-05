import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAdByIdApi, updateAdByIdApi } from "../../features/ads/api/adsApi";
import type { AdDetails, AdUpdatePayload } from "../../shared/types/ad";
import Loader from "../../shared/ui/Loader/Loader";
import styles from "./AdEditPage.module.css";

export const AdEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [formData, setFormData] = useState<AdUpdatePayload | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        setIsLoading(true);
        setErrorText(null);

        if (!id) {
          throw new Error("Missing ad id");
        }

        const ad: AdDetails = await getAdByIdApi(id);

        const draft = localStorage.getItem(`ad-edit-draft-${id}`);

        if (draft) {
          setFormData(JSON.parse(draft));
        } else {
          setFormData({
            category: ad.category,
            title: ad.title,
            description: ad.description ?? "",
            price: ad.price ?? 0,
            params: ad.params,
          });
        }
      } catch (error) {
        console.error(
          "Не удалось загрузить объявление для редактирования",
          error,
        );
        setErrorText("Не удалось загрузить объявление");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAd();
  }, [id]);

  useEffect(() => {
    if (!id || !formData) return;

    localStorage.setItem(`ad-edit-draft-${id}`, JSON.stringify(formData));
  }, [id, formData]);

  const handleChange = <K extends keyof AdUpdatePayload>(
    field: K,
    value: AdUpdatePayload[K],
  ) => {
    setFormData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleParamChange = (field: string, value: string | number) => {
    setFormData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        params: {
          ...prev.params,
          [field]: value,
        },
      };
    });
  };

  const handleSave = async () => {
    try {
      if (!id || !formData) return;

      setIsSaving(true);
      setErrorText(null);

      console.log("SENDING FORM DATA:", formData);

      const result = await updateAdByIdApi(id, formData);
      console.log("SAVE RESULT:", result);

      localStorage.removeItem(`ad-edit-draft-${id}`);
      navigate(`/ads/${id}`);
    } catch (error: any) {
      console.error("Не удалось сохранить объявление", error);
      console.error("SERVER ERROR:", error?.response?.data);

      setErrorText(
        error?.response?.data
          ? JSON.stringify(error.response.data)
          : "Не удалось сохранить объявление",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/ads/${id}`);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (errorText || !formData) {
    return <div>{errorText ?? "Не удалось открыть форму"}</div>;
  }
  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Редактирование объявления</h1>

        <div className={styles.section}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Категория</label>
              <select
                className={styles.select}
                value={formData.category}
                onChange={(event) =>
                  handleChange(
                    "category",
                    event.target.value as AdUpdatePayload["category"],
                  )
                }
              >
                <option value="auto">Авто</option>
                <option value="real_estate">Недвижимость</option>
                <option value="electronics">Электроника</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                <span className={styles.requiredMark}>*</span>
                Название
              </label>
              <input
                className={styles.input}
                value={formData.title}
                onChange={(event) => handleChange("title", event.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                <span className={styles.requiredMark}>*</span>
                Цена
              </label>
              <input
                className={styles.input}
                type="number"
                value={formData.price}
                onChange={(event) =>
                  handleChange("price", Number(event.target.value))
                }
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Характеристики</h2>

          <div className={styles.formGrid}>
            {"type" in formData.params && (
              <div className={styles.field}>
                <label className={styles.label}>Тип</label>
                <input
                  className={styles.input}
                  value={String(formData.params.type ?? "")}
                  onChange={(event) =>
                    handleParamChange("type", event.target.value)
                  }
                />
              </div>
            )}

            {"brand" in formData.params && (
              <div className={styles.field}>
                <label className={styles.label}>Бренд</label>
                <input
                  className={styles.input}
                  value={String(formData.params.brand ?? "")}
                  onChange={(event) =>
                    handleParamChange("brand", event.target.value)
                  }
                />
              </div>
            )}

            {"model" in formData.params && (
              <div className={styles.field}>
                <label className={styles.label}>Модель</label>
                <input
                  className={styles.input}
                  value={String(formData.params.model ?? "")}
                  onChange={(event) =>
                    handleParamChange("model", event.target.value)
                  }
                />
              </div>
            )}

            {"condition" in formData.params && (
              <div className={styles.field}>
                <label className={styles.label}>Состояние</label>
                <input
                  className={styles.input}
                  value={String(formData.params.condition ?? "")}
                  onChange={(event) =>
                    handleParamChange("condition", event.target.value)
                  }
                />
              </div>
            )}

            {"color" in formData.params && (
              <div className={styles.field}>
                <label className={styles.label}>Цвет</label>
                <input
                  className={styles.input}
                  value={String(formData.params.color ?? "")}
                  onChange={(event) =>
                    handleParamChange("color", event.target.value)
                  }
                />
              </div>
            )}

            {"address" in formData.params && (
              <div className={styles.field}>
                <label className={styles.label}>Адрес</label>
                <input
                  className={styles.input}
                  value={String(formData.params.address ?? "")}
                  onChange={(event) =>
                    handleParamChange("address", event.target.value)
                  }
                />
              </div>
            )}

            {"area" in formData.params && (
              <div className={styles.field}>
                <label className={styles.label}>Площадь</label>
                <input
                  className={styles.input}
                  type="number"
                  value={String(formData.params.area ?? "")}
                  onChange={(event) =>
                    handleParamChange("area", Number(event.target.value))
                  }
                />
              </div>
            )}

            {"floor" in formData.params && (
              <div className={styles.field}>
                <label className={styles.label}>Этаж</label>
                <input
                  className={styles.input}
                  type="number"
                  value={String(formData.params.floor ?? "")}
                  onChange={(event) =>
                    handleParamChange("floor", Number(event.target.value))
                  }
                />
              </div>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.descriptionRow}>
            <label className={styles.label}>Описание</label>
            <textarea
              className={styles.textarea}
              value={formData.description ?? ""}
              onChange={(event) =>
                handleChange("description", event.target.value)
              }
              maxLength={1000}
            />
            <span className={styles.counter}>
              {(formData.description ?? "").length} / 1000
            </span>
          </div>

          <button type="button" className={styles.aiButton}>
            Придумать описание
          </button>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
          </button>

          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleCancel}
          >
            Отменить
          </button>
        </div>
      </div>
    </section>
  );
};
