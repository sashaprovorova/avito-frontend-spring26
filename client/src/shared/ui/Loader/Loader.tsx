import styles from "./Loader.module.css";

export const Loader = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.spinner}></div>
      <p className={styles.text}>Загрузка...</p>
    </div>
  );
};

export default Loader;
