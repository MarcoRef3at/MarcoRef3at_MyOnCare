import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TransitionAlerts from "./../main/shared/Alert";

function LoginForm({ Login, Register, error, setError }) {
  const [user, setUser] = useState({ username: "", email: "", password: "" });
  const [errorPopUp, setErrorPopUp] = useState(false);
  const [tab, setTab] = useState("Login");
  const submitHandler = () => {
    tab == "Login" ? Login(user) : Register(user);
  };
  const tabChange = (e, value) => {
    setTab(value);
  };

  React.useEffect(() => {
    error ? setErrorPopUp(true) : setErrorPopUp(false);
  }, [error]);
  React.useEffect(() => {
    errorPopUp == false && setError(null);
  }, [errorPopUp]);
  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: "85vh" }}
    >
      <Card sx={{ maxWidth: 345 }}>
        <TabContext value={tab}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={tabChange} aria-label="lab API tabs example">
              <Tab label="Login" value="Login" />
              <Tab label="Register" value="Register" />
            </TabList>
          </Box>
        </TabContext>
        <TransitionAlerts
          open={errorPopUp}
          setOpen={setErrorPopUp}
          message={error}
        ></TransitionAlerts>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {tab}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="username"
            label="Username"
            type="text"
            fullWidth
            variant="standard"
            value={user.username}
            onChange={e => setUser({ ...user, username: e.target.value })}
          />
          {tab == "Register" && (
            <TextField
              autoFocus
              margin="dense"
              id="email"
              label="Email"
              type="text"
              fullWidth
              variant="standard"
              value={user.email}
              onChange={e => setUser({ ...user, email: e.target.value })}
            />
          )}
          <TextField
            margin="dense"
            id="password"
            label="Password"
            type="password"
            fullWidth
            variant="standard"
            value={user.password}
            onChange={e => setUser({ ...user, password: e.target.value })}
          />
        </CardContent>

        <CardActions>
          <Button onClick={submitHandler}>{tab}</Button>
        </CardActions>
      </Card>
    </Grid>
  );
}

export default LoginForm;
