import React from "react";
import Button from "@mui/material/Button";
import { Navigate } from "react-router-dom";

function Homepage({ user, Logout }) {
  return (
    <div>
      {user && (
        <h2>
          Welcome, <span>{user.username}</span>
        </h2>
      )}
      <Button variant="contained" onClick={Logout}>
        Logout
      </Button>
    </div>
  );
}

export default Homepage;
