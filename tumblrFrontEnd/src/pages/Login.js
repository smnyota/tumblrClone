import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Header from '../components/Header';


const Login = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const user = { name, password };

    fetch('http://127.0.0.1:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
      credentials: 'include'  // Include credentials (cookies)
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          alert('Failed to login!');
          setName('');
          setPassword('');
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
      })
      .then((data) => {
        console.log('User Logged In');
        console.log(data);
        console.log("all cookies");
        console.log(document.cookie);
        Cookies.set('user_id', data.user.id); // set cookie (avoids attacks)
        alert("Login success!");
        navigate('/home');
      })
      .catch((error) => {
        console.error('Login failed:', error.message);
      });
  };

  return (
    <div>
      <Header />
      <h1>Login To Flasker!</h1>
      <form onSubmit={handleSubmit}>
        <label>Username: </label>
        <input type="text" value={name} required onChange={(e) => setName(e.target.value)} />
        <br />
        <br />
        <label>Password: </label>
        <input type="password" value={password} required onChange={(e) => setPassword(e.target.value)} />
        <br />
        <input type="submit" />
      </form>
    </div>
  );
};

export default Login;
