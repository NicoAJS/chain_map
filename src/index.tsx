import ReactDOM from "react-dom/client";
import App from "./App";
import "./components/index.css";

const rootElement = document.getElementById("app");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
} else {
  console.error("Root element with ID 'app' not found");
}
