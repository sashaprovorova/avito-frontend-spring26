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

  const [descriptionSuggestion, setDescriptionSuggestion] = useState<
    string | null
  >(null);
  const [priceSuggestion, setPriceSuggestion] = useState<string | null>(null);
  const [isDescriptionAiLoading, setIsDescriptionAiLoading] = useState(false);
  const [isPriceAiLoading, setIsPriceAiLoading] = useState(false);
  const [aiErrorText, setAiErrorText] = useState<string | null>(null);

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

      await updateAdByIdApi(id, formData);
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

  const isSaveDisabled =
    !formData.title.trim() ||
    Number.isNaN(formData.price) ||
    formData.price < 0;

  const handleGenerateDescription = async () => {
    try {
      if (!formData) return;

      setIsDescriptionAiLoading(true);
      setAiErrorText(null);
      setDescriptionSuggestion(null);

      const generatedText = `Продаю ${formData.title}. ${
        "brand" in formData.params && formData.params.brand
          ? `Бренд: ${formData.params.brand}. `
          : ""
      }${
        "model" in formData.params && formData.params.model
          ? `Модель: ${formData.params.model}. `
          : ""
      }Состояние хорошее, объявление оформлено аккуратно.`;

      await new Promise((resolve) => setTimeout(resolve, 800));

      setDescriptionSuggestion(generatedText);
    } catch (error) {
      console.error("Ошибка генерации описания", error);
      setAiErrorText("Не удалось сгенерировать описание");
    } finally {
      setIsDescriptionAiLoading(false);
    }
  };

  const handleApplyDescription = () => {
    if (!descriptionSuggestion) return;

    handleChange("description", descriptionSuggestion);
    setDescriptionSuggestion(null);
  };

  const handleSuggestPrice = async () => {
    try {
      if (!formData) return;

      setIsPriceAiLoading(true);
      setAiErrorText(null);
      setPriceSuggestion(null);

      const generatedPrice =
        formData.price > 0
          ? String(Math.round(formData.price * 1.05))
          : "100000";

      await new Promise((resolve) => setTimeout(resolve, 800));

      setPriceSuggestion(generatedPrice);
    } catch (error) {
      console.error("Ошибка генерации цены", error);
      setAiErrorText("Не удалось определить рыночную цену");
    } finally {
      setIsPriceAiLoading(false);
    }
  };

  const handleApplyPrice = () => {
    if (!priceSuggestion) return;

    handleChange("price", Number(priceSuggestion));
    setPriceSuggestion(null);
  };

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

            {/* <div className={styles.field}>
              <label className={styles.label}>
                <span className={styles.requiredMark}>*</span>
                Цена
              </label>

              <div className={styles.aiRow}>
                <div className={styles.aiLeft}>
                  <input
                    className={styles.input}
                    type="number"
                    value={formData.price}
                    onChange={(event) =>
                      handleChange("price", Number(event.target.value))
                    }
                  />

                  <button
                    type="button"
                    className={styles.aiButton}
                    onClick={handleSuggestPrice}
                    disabled={isPriceAiLoading}
                  >
                    {isPriceAiLoading
                      ? "Определяем цену..."
                      : "Узнать рыночную цену"}
                  </button>
                </div>

                {priceSuggestion && (
                  <div className={styles.aiResultBox}>
                    <p className={styles.aiResultTitle}>Ответ AI:</p>
                    <p className={styles.aiResultText}>
                      Рекомендуемая цена: {priceSuggestion} ₽
                    </p>

                    <div className={styles.aiActions}>
                      <button
                        type="button"
                        className={styles.saveButton}
                        onClick={handleApplyPrice}
                      >
                        Применить
                      </button>

                      <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => setPriceSuggestion(null)}
                      >
                        Закрыть
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div> */}

            <div className={styles.field}>
              <label className={styles.label}>
                <span className={styles.requiredMark}>*</span>
                Цена
              </label>

              <div className={styles.descriptionAiRow}>
                <div className={styles.descriptionInputBlock}>
                  <input
                    className={styles.input}
                    type="number"
                    value={formData.price}
                    onChange={(event) =>
                      handleChange("price", Number(event.target.value))
                    }
                  />
                </div>

                <button
                  type="button"
                  className={styles.aiButtonInline}
                  onClick={handleSuggestPrice}
                  disabled={isPriceAiLoading}
                >
                  {isPriceAiLoading
                    ? "Определяем цену..."
                    : "Узнать рыночную цену"}
                </button>

                {priceSuggestion && (
                  <div className={styles.aiResultBox}>
                    <p className={styles.aiResultTitle}>Ответ AI:</p>
                    <p className={styles.aiResultText}>
                      Рекомендуемая цена: {priceSuggestion} ₽
                    </p>

                    <div className={styles.aiActions}>
                      <button
                        type="button"
                        className={styles.saveButton}
                        onClick={handleApplyPrice}
                      >
                        Применить
                      </button>

                      <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => setPriceSuggestion(null)}
                      >
                        Закрыть
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Характеристики</h2>

          <div className={styles.formGrid}>
            {"type" in formData.params && (
              <div className={styles.field}>
                <label className={styles.label}>Тип</label>
                <select
                  className={styles.select}
                  value={String(formData.params.type ?? "")}
                  onChange={(event) =>
                    handleParamChange("type", event.target.value)
                  }
                >
                  <option value="">Выберите тип</option>

                  {formData.category === "electronics" && (
                    <>
                      <option value="phone">Телефон</option>
                      <option value="laptop">Ноутбук</option>
                      <option value="misc">Другое</option>
                    </>
                  )}

                  {formData.category === "real_estate" && (
                    <>
                      <option value="flat">Квартира</option>
                      <option value="house">Дом</option>
                      <option value="room">Комната</option>
                    </>
                  )}
                </select>
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
                <select
                  className={styles.select}
                  value={String(formData.params.condition ?? "")}
                  onChange={(event) =>
                    handleParamChange("condition", event.target.value)
                  }
                >
                  <option value="">Выберите состояние</option>
                  <option value="new">Новый</option>
                  <option value="used">Б/у</option>
                </select>
              </div>
            )}

            {"transmission" in formData.params && (
              <div className={styles.field}>
                <label className={styles.label}>Коробка передач</label>
                <select
                  className={styles.select}
                  value={String(formData.params.transmission ?? "")}
                  onChange={(event) =>
                    handleParamChange("transmission", event.target.value)
                  }
                >
                  <option value="">Выберите коробку передач</option>
                  <option value="automatic">Автомат</option>
                  <option value="manual">Механика</option>
                </select>
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
          <div className={styles.descriptionAiRow}>
            <div className={styles.descriptionInputBlock}>
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

            <button
              type="button"
              className={styles.aiButtonInline}
              onClick={handleGenerateDescription}
              disabled={isDescriptionAiLoading}
            >
              {formData.description?.trim()
                ? isDescriptionAiLoading
                  ? "Улучшаем описание..."
                  : "Улучшить описание"
                : isDescriptionAiLoading
                  ? "Генерируем описание..."
                  : "Придумать описание"}
            </button>

            {descriptionSuggestion && (
              <div className={styles.aiResultBox}>
                <p className={styles.aiResultTitle}>Ответ AI:</p>
                <p className={styles.aiResultText}>{descriptionSuggestion}</p>

                <div className={styles.aiActions}>
                  <button
                    type="button"
                    className={styles.saveButton}
                    onClick={handleApplyDescription}
                  >
                    Применить
                  </button>

                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setDescriptionSuggestion(null)}
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            )}
          </div>

          {aiErrorText && <p className={styles.aiError}>{aiErrorText}</p>}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSave}
            disabled={isSaving || isSaveDisabled}
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
