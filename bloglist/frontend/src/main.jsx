import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import store from "./store/store";
import { NotificationContextProvider } from "./contexts/NotificationContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <NotificationContextProvider>
      <App />
    </NotificationContextProvider>
  </Provider>
);
