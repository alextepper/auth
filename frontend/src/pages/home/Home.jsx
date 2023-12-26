import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Box from "@mui/system/Box";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";

import api from "../../utils/api";
import NavigationBar from "../../components/NavigationBar";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [organizations, setOrganizations] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrganizations = async () => {
      const response = await api.get("/organizations");
      setOrganizations(response.data);
    };
    fetchOrganizations();
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setName("");
    setOpen(false);
  };

  const handleCreate = async () => {
    try {
      const response = await api.post("/create-org", { name });
      if (response.status === 200) {
        console.log(response.data.message);
        setOrganizations((prevOrgs) => [...prevOrgs, name]);
        setErrorMessage(""); // clear any previous error message
        setErrorDialogOpen(false);
      } else {
        // Handle error
        console.error(response.data.message);
      }
    } catch (error) {
      console.error("Error:", error.response.data.message);
      setErrorMessage(error.response.data.message);
      setErrorDialogOpen(true);
    }
    setOpen(false);
  };

  const handleErrorDialogClose = () => {
    setErrorDialogOpen(false);
  };

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
        <Button variant="contained" color="primary" onClick={handleClickOpen}>
          Create Organization
        </Button>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogContent>
            <TextField
              required
              autoFocus
              margin="dense"
              label="Name"
              type="text"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button disabled={name === ""} onClick={handleCreate}>
              Create
            </Button>
          </DialogActions>
        </Dialog>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Organizations
        </Typography>
        <List
          sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
          aria-label="contacts"
        >
          {organizations.map((org, index) => (
            <ListItem disablePadding key={index}>
              <ListItemButton onClick={() => navigate(`/organization/${org}`)}>
                <ListItemText primary={org} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Dialog open={errorDialogOpen} onClose={handleErrorDialogClose}>
          <DialogTitle>Error</DialogTitle>
          <DialogContent>{errorMessage}</DialogContent>
          <DialogActions>
            <Button onClick={handleErrorDialogClose}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
