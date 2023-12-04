import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Header from "../components/Header";

const Register = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const navigate = useNavigate();

  const handleProfilePictureUpload = () => {
    const formData = new FormData();
    formData.append("file", profilePictureFile);

    return fetch("http://127.0.0.1:5000/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
      });
  };

  const handleUserRegistration = (profilePictureUrl) => {
    const user = { name, password, profile_picture: profilePictureUrl };

    return fetch("http://127.0.0.1:5000/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // First, upload the profile picture
    handleProfilePictureUpload()
      .then((pictureData) => {
        // Second, send a request for user registration
        return handleUserRegistration(pictureData.file_url);
      })
      .then((userData) => {
        console.log("User Registered");
        console.log(userData);
        Cookies.set("user_id", userData.id);
        alert("Registration success!");
        navigate("/home");
      })
      .catch((error) => {
        console.error("Registration failed:", error.message);
        alert("Registration failed!");
        setName("");
        setPassword("");
        setProfilePicture("");
        setProfilePictureFile(null);
      });
  };

  return (
    <div>
      <Header />
      <h1>Register for Flasker!</h1>
      <form onSubmit={handleSubmit}>
        <label>Username: </label>
        <input
          type="text"
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
        />
        <br />
        <br />
        <label>Password: </label>
        <input
          type="password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <br />
        <label>Profile Picture: </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProfilePictureFile(e.target.files[0])}
        />
        <br />
        <input type="submit" />
      </form>
    </div>
  );
};

export default Register;
