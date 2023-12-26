import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Box,
  ListItemButton,
  MenuItem,
} from "@mui/material";
import api from "../../utils/api";
import NavigationBar from "../../components/NavigationBar";

export default function Organization() {
  const { org_name } = useParams();
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [allUsers, setAllUsers] = useState([]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await api.post("/add-user-to-org", { email, org_name });
    if (response.status === 200) {
      setUsers((prevUsers) => [...prevUsers, email]);
    }
    console.log(response.data);
    handleClose();
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await api.get(`/organization/${org_name}`);
      setUsers(response.data);
    };
    const fetchAllUsers = async () => {
      const response = await api.get("/users");
      setAllUsers(response.data);
    };
    fetchUsers();
    fetchAllUsers();
  }, [org_name]);

  return (
    <Box>
      <NavigationBar />
      <Box
        sx={{
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h4" component="h2">
          Users in {org_name}
        </Typography>
        <List>
          {users.map((user, index) => (
            <ListItem key={index}>
              <ListItemButton>
                <ListItemText primary={user} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Button variant="outlined" onClick={handleClickOpen}>
          Add User
        </Button>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Add User to Organization</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To add a user to this organization, please enter their email
              address here.
            </DialogContentText>
            <TextField
              select
              autoFocus
              margin="dense"
              id="email"
              label="Email Address"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            >
              {allUsers.map((user) => (
                <MenuItem key={user.id} value={user.email}>
                  {user.email}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Add</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
