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
import { Link } from "react-router-dom";
import CryptoJS from "crypto-js";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serverMessage, setServerMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const hashedPassword = CryptoJS.SHA256(password).toString();
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password: hashedPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
      setServerMessage(error.message);
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
          Signup
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
          Register
        </Button>
        <Typography style={{ marginTop: "20px" }}>
          Already have an account? <Link to="/login">Login</Link>
        </Typography>
      </Box>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Server Message</DialogTitle>
        <DialogContent>{serverMessage}</DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </form>
  );
}
