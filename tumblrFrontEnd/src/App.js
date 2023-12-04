import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Post from "./pages/Post";
import NoPage from "./pages/NoPage";
import AddPost from "./pages/AddPost";
import Edit from "./pages/Edit";
import Register from "./pages/Register";
import "./index.css"; 


export default function App() {
  return (
    <div>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/post" element={<Post />} />
            <Route path="/post/:id" element={<Post />} />
            <Route path="/AddPost" element={<AddPost />} />
            <Route path="/Edit" element={<Edit />} />
            <Route path="/Register" element={<Register />} />
            <Route path="*" element={<NoPage />} />
          </Routes>
        </BrowserRouter>
    </div>
  );
}
