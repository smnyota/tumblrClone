import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";

const CommentSection = ({ comments, post_id }) => {
  console.log(comments);
  console.log(post_id);

  const [newComment, setNewComment] = useState("");
  const user_id = Cookies.get('user_id');
  const navigate = useNavigate();

  const handleCommentSubmit = (e) => {
    e.preventDefault(); // prevents page reload

    if (!user_id) {
      alert("You are not logged in");
      navigate('/login'); // send a non-logged-in user to the login page
      return;
    }

    const commentData = {
      content: newComment,
      user_id: parseInt(user_id, 10),
    };

    fetch(`http://127.0.0.1:5000/post/${post_id}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentData),
      credentials: 'include', // Include credentials (cookies)
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          alert('Failed to add a comment!');
          setNewComment("");
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
      })
      .then((data) => {
        console.log('Adding a comment');
        console.log(data); // print the comment
        // If needed, update the state with the new comment data
      })
      .catch((error) => {
        console.error('Adding a comment failed:', error.message);
      });

    setNewComment("");
  };

  return (
    <div>
      <h2>Comments</h2>
      {comments.length === 0 ? (
        <p>No comments yet!</p>
      ) : (
        <ul>
          {comments.map((comment) => (
            <li key={comment.id}>
              <p>{comment.content}</p>
              <p>By: {comment.user_name}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleCommentSubmit}>
        <label>Add a Comment:</label>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          required
        ></textarea>
        <br />
        <button type="submit">Submit Comment</button>
      </form>
    </div>
  );
};

export default CommentSection;
