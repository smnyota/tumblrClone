import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const userId = Cookies.get('user_id');

  useEffect(() => {
    // Fetch user information when the component mounts
    if (userId) {
      fetch(`http://127.0.0.1:5000/user/${userId}`)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
          }
        })
        .then((data) => {
            console.log("we are here");
            console.log(data);
          setUser(data);
        })
        .catch((error) => {
          console.error('Error fetching user data:', error.message);
          setUser(null);
        });
    }
  }, [userId]);

  const handleLogout = () => {
    // Remove user_id cookie and navigate to the login page
    Cookies.remove('user_id');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="header">
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          {user ? (
            <>
              <li><Link to="/edit">Edit</Link></li>
              <li><Link to="/addpost">Add Post</Link></li>
              <li><button onClick={handleLogout}>Logout</button></li>
              {user.profile_picture && (
                <li>
                  <img
                    src={user.profile_picture}
                    alt="Profile"
                    style={{ width: '50px', borderRadius: '50%' }}
                  />
                </li>
              )}
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Header;
