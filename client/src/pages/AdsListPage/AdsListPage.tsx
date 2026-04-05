import { useEffect, useState } from "react";
import { getAdsApi } from "../../features/ads/api/adsApi";
import type { AdListItem } from "../../shared/types/ad";
import Loader from "../../shared/ui/Loader/Loader";
import { AdsList } from "../../widgets/AdsList/AdsList";
import { useDebounce } from "../../shared/hooks/useDebounce";
import styles from "./AdsListPage.module.css";

export const AdsListPage = () => {
  const [ads, setAds] = useState<AdListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<
    ("auto" | "real_estate" | "electronics")[]
  >([]);
  const [onlyNeedsRevision, setOnlyNeedsRevision] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const limit = 10;
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategories.length > 0 ||
    onlyNeedsRevision ||
    sortOption !== "newest";

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        setError(null);

        const sortColumn = sortOption === "title-asc" ? "title" : "createdAt";
        const sortDirection = sortOption === "title-asc" ? "asc" : "desc";

        const data = await getAdsApi({
          q: debouncedSearchQuery,
          categories: selectedCategories,
          needsRevision: onlyNeedsRevision,
          sortColumn,
          sortDirection,
          limit,
          skip: (currentPage - 1) * limit,
        });

        setAds(data.items);
        setTotal(data.total);
      } catch (error) {
        console.error("Failed to load ads", error);
        setError("Failed to load ads");
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [
    debouncedSearchQuery,
    selectedCategories,
    onlyNeedsRevision,
    sortOption,
    currentPage,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedCategories, onlyNeedsRevision, sortOption]);

  if (loading) return <Loader />;
  if (error) return <div>{error}</div>;

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Мои объявления</h1>
          <p className={styles.subtitle}>{total} объявлений</p>
        </div>

        <div className={styles.topBar}>
          <div className={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Найти объявление...."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className={styles.searchInput}
            />
            <span className={styles.searchIcon}>⌕</span>
          </div>

          <div className={styles.viewToggle}>
            <button
              type="button"
              className={`${styles.viewButton} ${viewMode === "grid" ? styles.viewButtonActive : ""}`}
              onClick={() => setViewMode("grid")}
            >
              ⊞
            </button>

            <button
              type="button"
              className={`${styles.viewButton} ${viewMode === "list" ? styles.viewButtonActive : ""}`}
              onClick={() => setViewMode("list")}
            >
              ☰
            </button>
          </div>

          <select
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value)}
            className={styles.sortSelect}
          >
            <option value="newest">По новизне (сначала новые)</option>
            <option value="title-asc">По названию (А-Я)</option>
          </select>
        </div>

        <div className={styles.content}>
          <aside className={styles.sidebar}>
            <h2 className={styles.filtersTitle}>Фильтры</h2>

            <div className={styles.filterGroup}>
              <p className={styles.filterLabel}>Категория</p>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes("auto")}
                  onChange={() =>
                    setSelectedCategories((prev) =>
                      prev.includes("auto")
                        ? prev.filter((category) => category !== "auto")
                        : [...prev, "auto"],
                    )
                  }
                />
                Авто
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes("electronics")}
                  onChange={() =>
                    setSelectedCategories((prev) =>
                      prev.includes("electronics")
                        ? prev.filter((category) => category !== "electronics")
                        : [...prev, "electronics"],
                    )
                  }
                />
                Электроника
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes("real_estate")}
                  onChange={() =>
                    setSelectedCategories((prev) =>
                      prev.includes("real_estate")
                        ? prev.filter((category) => category !== "real_estate")
                        : [...prev, "real_estate"],
                    )
                  }
                />
                Недвижимость
              </label>
            </div>

            <div className={styles.filterDivider} />

            <label className={styles.revisionToggle}>
              <span>Только требующие доработок</span>
              <input
                type="checkbox"
                checked={onlyNeedsRevision}
                onChange={(event) => setOnlyNeedsRevision(event.target.checked)}
              />
            </label>

            <button
              type="button"
              className={`${styles.resetButton} ${hasActiveFilters ? styles.resetButtonActive : ""}`}
              onClick={() => {
                setSearchQuery("");
                setSelectedCategories([]);
                setOnlyNeedsRevision(false);
                setSortOption("newest");
                setCurrentPage(1);
              }}
            >
              Сбросить фильтры
            </button>
          </aside>

          <div className={styles.main}>
            <AdsList ads={ads} viewMode={viewMode} />

            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.pageArrow}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 1}
              >
                ‹
              </button>

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`${styles.pageNumber} ${currentPage === page ? styles.pageNumberActive : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                className={styles.pageArrow}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
