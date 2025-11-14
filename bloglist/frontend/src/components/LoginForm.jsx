import { useState } from "react";

// Controlled login form. Calls handleLogin({ username, password }) on submit.
const LoginForm = ({ handleLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleLogin({ username, password });
    setUsername("");
    setPassword("");
  };

  return (
    <>
      <h2>log in to application</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>
            username
            <input
              type="text"
              value={username}
              onChange={({ target }) => setUsername(target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            password
            <input
              type="password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
          </label>
        </div>
        <button type="submit">login</button>
      </form>
    </>
  );
};
export default LoginForm;
