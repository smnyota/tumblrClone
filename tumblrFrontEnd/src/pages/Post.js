import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import PostBody from '../components/PostBody';
import CommentSection from '../components/CommentSection';

const Post = () => {
  const { id } = useParams(); // Get the post ID from the route parameters
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchPostData = () => {
      fetch(`http://127.0.0.1:5000/post/${id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Post data");
          console.log(data);
          setPost(data);
        })
        .catch((error) => console.error('Error fetching post:', error));
    };

    const fetchComments = () => {
      fetch(`http://127.0.0.1:5000/post/${id}/comments`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("This is the comment data");
          console.log(data);
          setComments(data);
        })
        .catch((error) => console.error('Error fetching comments:', error));
    };

    // Fetch post and comments initially
    fetchPostData();
    fetchComments();

    // Polls for updates every seconds (dependent on interval I set)
    const intervalId = setInterval(() => {
      fetchPostData();
      fetchComments();
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [id]); // Dependency on 'id' ensures the effect runs whenever the post ID changes (aka when we enter a new post page)

  return (
    <>
      <Header />
      {post && (
        <>
          <h1>{post.title}</h1>
          <PostBody content={post.content} />
          <CommentSection comments={comments} post_id = {post.id}/>
        </>
      )}
    </>
  );
};

export default Post;
