import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Grid from "@mui/material/Grid";
import UserDialog from "./UsersDialog";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TransitionAlerts from "./../main/shared/Alert";
import {
  addUserApi,
  deleteUserApi,
  editUserApi,
  getUsersApi
} from "../../api/users";

const columns = [
  { id: "id", label: "ID", maxWidth: 40 },
  { id: "username", label: "Username", minWidth: 100 },
  {
    id: "email",
    label: "Email",
    minWidth: 170,
    align: "center",
    format: value => value
  },
  {
    id: "role",
    label: "Role",
    minWidth: 170,
    align: "center",
    format: value => value
  },
  {
    id: "isActive",
    label: "Status",
    minWidth: 170,
    align: "center",
    format: value => {
      return value ? "Active" : "InActive";
    }
  },
  {
    id: "actions",
    label: "Actions",
    maxWidth: 80,
    align: "center"
  }
];

function Users() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(1);
  const [allCount, setAllCount] = React.useState(0);
  const [users, setUsers] = React.useState([]);
  const [targetUser, setTargetUser] = React.useState(null);
  const [title, setTitle] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [errorPopUp, setErrorPopUp] = React.useState(false);

  const dialogOpen = () => {
    setOpen(true);
  };

  const dialogClose = () => {
    setError(null);
    setOpen(false);
  };

  const pagination = async (newPage, newRows) => {
    let params = { page: newPage + 1 || 1, limit: newRows || rowsPerPage };
    let users = await getUsersApi(params);
    setUsers(users.data.data);
    setAllCount(users.data.allCount);
  };
  const handleChangePage = async (event, newPage) => {
    setPage(newPage);
    await pagination(newPage);
  };

  const handleChangeRowsPerPage = async event => {
    setRowsPerPage(+event.target.value);
    setPage(0);
    await pagination(0, event.target.value);
  };

  const onSubmit = async () => {
    try {
      if (targetUser.id) {
        await editUserApi(targetUser);
      } else {
        await addUserApi(targetUser);
      }
      await pagination();
      dialogClose();
    } catch (error) {
      setError(error.response.data.error);
      console.log("error:", error.response);
    }
  };

  const removeUser = async id => {
    try {
      // let newArr = users.filter(usr => usr.id != id);
      await deleteUserApi(id);
      let users = await getUsersApi();
      setUsers(users.data.data);
    } catch (error) {
      setError(error.response.data.error);
    }
  };

  const addUser = () => {
    setTitle("Add");
    setTargetUser({
      username: "",
      email: "",
      password: "",
      role: "user",
      isActive: false
    });
    dialogOpen();
  };

  React.useEffect(() => {
    pagination();
  }, []);
  React.useEffect(() => {
    error ? setErrorPopUp(true) : setErrorPopUp(false);
  }, [error]);
  React.useEffect(() => {
    errorPopUp == false && setError(null);
  }, [errorPopUp]);
  React.useEffect(() => {
    setError(null);
  }, [open]);

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: "85vh" }}
    >
      {!open && (
        <TransitionAlerts
          open={errorPopUp}
          setOpen={setErrorPopUp}
          message={error}
        ></TransitionAlerts>
      )}
      <Button variant="outlined" onClick={addUser}>
        Add User
      </Button>
      <Paper>
        <UserDialog
          open={open}
          handleClose={dialogClose}
          title={title}
          user={targetUser}
          setUser={setTargetUser}
          onSubmit={onSubmit}
          error={error}
          errorPopUp={errorPopUp}
          setErrorPopUp={setErrorPopUp}
        />
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map(column => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(row => {
                return (
                  <TableRow hover key={row.id}>
                    {columns.map(column => {
                      const value = row[column.id];
                      return column.id !== "actions" ? (
                        <TableCell key={column.id} align={column.align}>
                          {column.format ? column.format(value) : value}
                        </TableCell>
                      ) : (
                        <TableCell key={column.id} align={column.align}>
                          <IconButton
                            onClick={() => {
                              setTargetUser(row);
                              setTitle("Edit");
                              dialogOpen();
                            }}
                          >
                            <EditIcon color="primary" />
                          </IconButton>
                          <IconButton onClick={() => removeUser(row.id)}>
                            <DeleteIcon color="secondary" />
                          </IconButton>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[1, 5, 10]}
          component="div"
          count={allCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Grid>
  );
}

export default Users;
