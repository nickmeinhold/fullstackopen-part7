import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  CardActionArea,
  Box,
} from "@mui/material";

const Blog = ({ blog }) => {
  return (
    <Card sx={{ marginBottom: 2 }} data-testid="blog-card">
      <CardActionArea component={Link} to={`/blogs/${blog.id}`}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              component="div"
              data-testid="blog-title-author"
            >
              {blog.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {blog.author}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default Blog;
