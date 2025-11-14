import { useState, forwardRef, useImperativeHandle } from "react";
import { Button, Box } from "@mui/material";

const Togglable = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);

  const hideWhenVisible = { display: visible ? "none" : "" };
  const showWhenVisible = { display: visible ? "" : "none" };

  const toggleVisibility = () => {
    setVisible(!visible);
  };

  useImperativeHandle(ref, () => ({
    toggleVisibility,
  }));

  return (
    <Box sx={{ marginY: 2 }}>
      <Box style={hideWhenVisible}>
        <Button variant="contained" color="primary" onClick={toggleVisibility}>
          {props.buttonLabel}
        </Button>
      </Box>
      <Box style={showWhenVisible}>
        {props.children}
        <Button variant="outlined" onClick={toggleVisibility}>
          cancel
        </Button>
      </Box>
    </Box>
  );
});

Togglable.displayName = "Togglable";

export default Togglable;
