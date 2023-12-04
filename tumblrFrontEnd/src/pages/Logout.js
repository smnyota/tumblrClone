import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Header from '../components/Header';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Perform logout actions

    // Clear the user ID cookie
    Cookies.remove('user_id');

    // You may want to send a request to the backend to perform server-side logout if needed

    // Redirect to the login page
    navigate('/login');
  }, [navigate]);

  return (
    <div>
      <Header/>
      <h1>Logging Out...</h1>
    </div>
  );
};

export default Logout;
