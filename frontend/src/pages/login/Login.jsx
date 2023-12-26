import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import api from "../../utils/api";

export default function Login() {
  const [email, setEmail] = useState("qwerty@qwe.com");
  const [password, setPassword] = useState("asdasd");
  const [serverMessage, setServerMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const hashedPassword = CryptoJS.SHA256(password).toString();
      const response = await api.post("/signin", {
        email,
        password: hashedPassword,
      });
      if (response.status === 200) {
        localStorage.setItem("access_token", response.data.access_token);
        navigate("/");
      } else {
        // Handle error
        console.error(response.data.message);
        setServerMessage(response.data.message);
        setDialogOpen(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setServerMessage(error.response.data.message);
      setDialogOpen(true);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };
  return (
    <form onSubmit={handleSubmit}>
      <Box
        className="App"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: "100vh" }}
      >
        <Typography variant="h4" style={{ marginBottom: "20px" }}>
          Login
        </Typography>
        <TextField
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: "20px" }}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: "20px" }}
        />
        <Button
          disabled={password === "" || email === ""}
          variant="contained"
          color="primary"
          type="submit"
        >
          Login
        </Button>
        <Typography style={{ marginTop: "20px" }}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </Typography>
      </Box>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>{serverMessage}</DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </form>
  );
}
