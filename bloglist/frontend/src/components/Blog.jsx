import { Link } from "react-router-dom";

const Blog = ({ blog }) => {
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: "solid",
    borderWidth: 1,
    marginBottom: 5,
  };

  return (
    <div style={blogStyle} data-testid="blog-card">
      <Link to={`/blogs/${blog.id}`} data-testid="blog-title-author">
        {blog.title} {blog.author}
      </Link>
    </div>
  );
};

export default Blog;
