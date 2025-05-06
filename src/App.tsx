import styles from "./App.module.css";
import CurrencyTable from "./components/Table";
import Chat from "./components/Chat";
function App() {
  return (
    <div className={styles.grid}>
      <CurrencyTable />
      <Chat />
    </div>
  );
}

export default App;
