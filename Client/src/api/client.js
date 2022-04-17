import axios from "axios";

const apiClient = axios.create({
  baseURL:
    `${process.env.REACT_APP_SERVER_URL}/api/v2` ||
    "http://localhost:5000/api/v2",
  headers: {
    "content-type": "application/json"
  }
});

export default apiClient;
