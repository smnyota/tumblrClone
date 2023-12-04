import Header from '../components/Header'
import React, {useState, useEffect} from 'react'
import {Link} from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const AddPost = () => {
const navigate = useNavigate();
// const access_token = Cookies.get('access_token');
const user_id = Cookies.get('user_id');
console.log("cookies");
console.log(document.cookie);
//   if (!access_token){
//     console.log("not logged in");
//     alert("You are not logged in")
//     navigate("/login");
//   }

  if (!user_id){
    console.log("not logged in");
    alert("You are not logged in")
    navigate("/login");
  }


// console.log('Access Token:', access_token);


  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const post = { title, content, user_id }; //from the submission form

    fetch('http://127.0.0.1:5000/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
                //   'Authorization': `Bearer ${access_token}`
    },
      body: JSON.stringify(post),
      credentials: 'include', // Include credentials (cookies)
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          alert('Failed to add a post!');
          setTitle('');
          setContent('');
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
      })
      .then((data) => {
        console.log('Adding a post');
        console.log(data); //extract the post id
        navigate('/home'); //navigate to the specific post
      })
      .catch((error) => {
        console.error('Adding a post failed:', error.message);
      });
  };

  return (
    <div>
     <Header />
      <h1>Add A Post</h1>
      <form onSubmit={handleSubmit}>
        <label>Title: </label>
        <input type="text" value={title} required onChange={(e) => setTitle(e.target.value)} />
        <br />
        <br />
        <label>Content: </label>
        <input type="text" value={content} required onChange={(e) => setContent(e.target.value)} />
        <br />
        <input type="submit" />
      </form>
    </div>
  );
};

export default AddPost;
