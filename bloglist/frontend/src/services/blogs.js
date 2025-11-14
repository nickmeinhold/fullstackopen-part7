import axios from "axios";
const baseUrl = "/api/blogs";

let token = null;

const setToken = (newToken) => {
  token = newToken ? `Bearer ${newToken}` : null;
};

const getAll = async () => {
  const config = token ? { headers: { Authorization: token } } : undefined;
  const { data } = await axios.get(baseUrl, config);
  return data;
};

const create = async (blog) => {
  const config = token ? { headers: { Authorization: token } } : {};
  const { data } = await axios.post(baseUrl, blog, config);
  return data;
};

const update = async (id, blog) => {
  const config = token ? { headers: { Authorization: token } } : {};
  const { data } = await axios.put(`${baseUrl}/${id}`, blog, config);
  return data;
};

const remove = async (id) => {
  const config = token ? { headers: { Authorization: token } } : {};
  await axios.delete(`${baseUrl}/${id}`, config);
};

export default { getAll, create, update, remove, setToken };
