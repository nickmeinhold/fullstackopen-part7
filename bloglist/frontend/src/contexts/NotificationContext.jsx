import { createContext, useReducer, useContext } from "react";

const notificationReducer = (state, action) => {
  switch (action.type) {
    case "SET":
      return action.payload;
    case "CLEAR":
      return null;
    default:
      return state;
  }
};

const NotificationContext = createContext();

export const NotificationContextProvider = ({ children }) => {
  const [notification, dispatch] = useReducer(notificationReducer, null);

  const setNotification = (text, type = "success", duration = 4000) => {
    dispatch({
      type: "SET",
      payload: { text, type },
    });

    setTimeout(() => {
      dispatch({ type: "CLEAR" });
    }, duration);
  };

  return (
    <NotificationContext.Provider value={{ notification, setNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationContextProvider"
    );
  }
  return context;
};

export default NotificationContext;
