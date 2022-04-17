import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import { Typography } from "@mui/material";
import TransitionAlerts from "../main/shared/Alert";

export default function UserDialog({
  open,
  handleClose,
  title,
  user,
  setUser,
  onSubmit,
  error,
  errorPopUp,
  setErrorPopUp
}) {
  const roles = [
    { name: "Super Admin", value: "superAdmin" },
    { name: "Admin", value: "admin" },
    { name: "User", value: "user" }
  ];
  return (
    <div>
      {user && (
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{title}</DialogTitle>
          {error && open && (
            <TransitionAlerts
              open={errorPopUp}
              setOpen={setErrorPopUp}
              message={error}
            ></TransitionAlerts>
          )}
          <DialogContent>
            <FormControlLabel
              control={
                <Switch
                  margin="dense"
                  id="isActive"
                  checked={user.isActive}
                  onChange={() =>
                    setUser({ ...user, isActive: !user.isActive })
                  }
                />
              }
              label={user.isActive ? "Active" : "Inactive"}
            />
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
            <TextField
              margin="dense"
              id="email"
              label="Email Address"
              type="email"
              fullWidth
              variant="standard"
              value={user.email}
              onChange={e => setUser({ ...user, email: e.target.value })}
            />
            {title == "Add" && (
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
            )}
            <InputLabel>Role</InputLabel>

            <Select
              id="role"
              value={user.role}
              label="Role"
              onChange={e => setUser({ ...user, role: e.target.value })}
            >
              {roles.map(role => (
                <MenuItem value={role.value}>{role.name}</MenuItem>
              ))}
            </Select>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={onSubmit}>Submit</Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}
