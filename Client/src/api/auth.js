import client from "./client";
import endPoints from "./endPoints";

export const getHeaders = () => {
  let userToken = localStorage.getItem("TOKEN");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${userToken}`
  };
  return {
    withCredentials: true,
    headers: headers
  };
};

const loginApi = ({ username, password }) => {
  let body = JSON.stringify({
    username,
    password
  });

  return client.post(endPoints.login, body);
};
const tokenRefresherApi = () => {
  return client.get(endPoints.getMe, getHeaders());
};

const logoutApi = () => {
  return client.get(endPoints.logout, getHeaders());
};

const registerApi = ({ username, email, password }) => {
  let body = JSON.stringify({
    username,
    password,
    email
  });

  return client.post(endPoints.register, body);
};

export { loginApi, registerApi, logoutApi, tokenRefresherApi };
