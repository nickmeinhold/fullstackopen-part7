import { Link } from "react-router-dom";
import { AppBar, Toolbar, Button, Typography } from "@mui/material";

const Navigation = ({ user, handleLogout }) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Button color="inherit" component={Link} to="/">
          blogs
        </Button>
        <Button color="inherit" component={Link} to="/users">
          users
        </Button>
        {user && (
          <Typography variant="body1" sx={{ marginLeft: "auto" }}>
            <em>{user.name}</em> logged in{" "}
            <Button color="inherit" onClick={handleLogout}>
              logout
            </Button>
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
