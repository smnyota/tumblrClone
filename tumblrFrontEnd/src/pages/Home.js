import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      fetch('http://127.0.0.1:5000/posts', {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',  // frontend url (development only)
        }
      }) 
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);
          setPosts(data);
        })
        .catch((error) => console.error('Error fetching posts:', error));
    };

    // Fetch data initially
    fetchData();

    // Poll for updates every second (adjust the interval based on your needs)
    //Future update will refactor for web polling, or a web socket
    //When demoing
    const intervalId = setInterval(fetchData,  80* 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures the effect runs once on mount

  return (
    <>
      <Header />
      <h1>Welcome to Flasker, a better Tumblr!</h1>

      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <Link to={`/post/${post.id}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Home;
