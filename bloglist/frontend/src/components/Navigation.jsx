import { Link } from "react-router-dom";

const Navigation = ({ user, handleLogout }) => {
  const padding = {
    paddingRight: 5,
  };

  const navStyle = {
    backgroundColor: "#e0e0e0",
    padding: "10px",
    marginBottom: "10px",
  };

  return (
    <div style={navStyle}>
      <Link to="/" style={padding}>
        blogs
      </Link>
      <Link to="/users" style={padding}>
        users
      </Link>
      {user && (
        <span>
          <em>{user.name}</em> logged in{" "}
          <button onClick={handleLogout}>logout</button>
        </span>
      )}
    </div>
  );
};

export default Navigation;
