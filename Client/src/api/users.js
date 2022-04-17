import client from "./client";
import endPoints from "./endPoints";
import { getHeaders } from "./auth";
// let userToken =

const getUsersApi = async params => {
  let config = { ...getHeaders(), params };
  let users = await client.get(endPoints.users, config);

  return users;
};
const addUserApi = async user => {
  let users = await client.post(endPoints.users, user, getHeaders());

  return users;
};
const deleteUserApi = async id => {
  let users = await client.delete(`${endPoints.users}/${id}`, getHeaders());

  return users;
};
const editUserApi = async user => {
  let users = await client.put(
    `${endPoints.users}/${user.id}`,
    user,
    getHeaders()
  );

  return users;
};

export { getUsersApi, addUserApi, deleteUserApi, editUserApi };
