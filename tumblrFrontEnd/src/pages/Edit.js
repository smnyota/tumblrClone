import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Header from '../components/Header';

const EditPosts = () => {
  const [posts, setPosts] = useState([]);
  const [editedValues, setEditedValues] = useState({});
  const [comments, setComments] = useState([]);
  const [editedComments, setEditedComments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user_id = Cookies.get('user_id');

    if (!user_id) {
      alert("You are not logged in!");
      navigate('/login');
      return;
    }

    fetch('http://127.0.0.1:5000/posts', {
      method: 'GET',
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
      })
      .then((data) => {
        const userPosts = data.filter((post) => post.user_id === parseInt(user_id, 10));
        setPosts(userPosts);
        const initialEditedValues = userPosts.reduce((acc, post) => {
          acc[post.id] = { title: post.title, content: post.content };
          return acc;
        }, {});
        setEditedValues(initialEditedValues);
      })
      .catch((error) => {
        console.error('Failed to fetch posts:', error.message);
      });

    fetch('http://127.0.0.1:5000/comments', {
      method: 'GET',
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
      })
      .then((data) => {
        const userComments = data.filter((comment) => comment.user_id === parseInt(user_id, 10));
        setComments(userComments);
        const initialEditedComments = userComments.reduce((acc, comment) => {
          acc[comment.id] = { content: comment.content };
          return acc;
        }, {});
        setEditedComments(initialEditedComments);
      })
      .catch((error) => {
        console.error('Failed to fetch comments:', error.message);
      });
  }, [navigate]);

  const handleEditSubmit = (e, postId) => {
    e.preventDefault();

    const user_id = Cookies.get('user_id');

    if (!user_id) {
      alert("You are not logged in!");
      navigate('/login');
      return;
    }

    const editedPost = {
      title: editedValues[postId].title,
      content: editedValues[postId].content,
    };

    fetch(`http://127.0.0.1:5000/post/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedPost),
      credentials: 'include',
    })
      .then((response) => {
        if (response.ok) {
          alert('Post edited successfully!');
        } else {
          alert('Failed to edit post!');
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
      })
      .catch((error) => {
        console.error('Failed to edit post:', error.message);
      });
  };

  const handleDeleteSubmit = (e, postId) => {
    e.preventDefault();

    const user_id = Cookies.get('user_id');
    if (!user_id) {
      alert("You are not logged in!");
      navigate('/login');
      return;
    }

    fetch(`http://127.0.0.1:5000/post/${postId}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
          alert('Post deleted successfully!');
        } else {
          alert('Failed to delete post!');
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
      })
      .catch((error) => {
        console.error('Failed to delete post:', error.message);
      });
  };

  const handleCommentEditSubmit = (e, commentId) => {
    e.preventDefault();

    const user_id = Cookies.get('user_id');
    if (!user_id) {
      alert("You are not logged in!");
      navigate('/login');
      return;
    }

    const editedComment = {
      content: editedComments[commentId].content,
    };

    fetch(`http://127.0.0.1:5000/comment/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedComment),
      credentials: 'include',
    })
      .then((response) => {
        if (response.ok) {
          alert('Comment edited successfully!');
        } else {
          alert('Failed to edit comment!');
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
      })
      .catch((error) => {
        console.error('Failed to edit comment:', error.message);
      });
  };

  const handleCommentDeleteSubmit = (e, commentId) => {
    e.preventDefault();

    const user_id = Cookies.get('user_id');
    if (!user_id) {
      alert("You are not logged in!");
      navigate('/login');
      return;
    }

    fetch(`http://127.0.0.1:5000/comment/${commentId}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));
          alert('Comment deleted successfully!');
        } else {
          alert('Failed to delete comment!');
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
      })
      .catch((error) => {
        console.error('Failed to delete comment:', error.message);
      });
  };

  const handleInputChange = (postId, field, value) => {
    setEditedValues((prevEditedValues) => ({
      ...prevEditedValues,
      [postId]: {
        ...prevEditedValues[postId],
        [field]: value,
      },
    }));
  };

  const handleCommentInputChange = (commentId, field, value) => {
    setEditedComments((prevEditedComments) => ({
      ...prevEditedComments,
      [commentId]: {
        ...prevEditedComments[commentId],
        [field]: value,
      },
    }));
  };

  return (
    <div>
      <Header />
      <h1>Edit or Delete Your Posts!</h1>
      {posts.map((post) => (
        <div key={post.id} className="post-container">
          <form onSubmit={(e) => handleEditSubmit(e, post.id)}>
            <p>Title:</p>
            <input
              name="title"
              type="text"
              value={editedValues[post.id].title}
              onChange={(e) => handleInputChange(post.id, 'title', e.target.value)}
              required
            />
            <br />
            <br />
            <p>Content:</p>
            <textarea
              name="content"
              value={editedValues[post.id].content}
              onChange={(e) => handleInputChange(post.id, 'content', e.target.value)}
              required
            ></textarea>
            <br />
            <br />
            <input type="submit" value="Edit Post" />
          </form>

          <form onSubmit={(e) => handleDeleteSubmit(e, post.id)}>
            <input type="submit" value="Delete Post" />
          </form>
        </div>
      ))}
      <h1>Edit or Delete Your Comments</h1>
      {comments.map((comment) => (
        <div key={comment.id} className="comment-container">
          <form onSubmit={(e) => handleCommentEditSubmit(e, comment.id)}>
            <p>Content:</p>
            <textarea
              name="content"
              value={editedComments[comment.id].content}
              onChange={(e) => handleCommentInputChange(comment.id, 'content', e.target.value)}
              required
            ></textarea>
            <br />
            <br />
            <input type="submit" value="Edit Comment" />
          </form>

          <form onSubmit={(e) => handleCommentDeleteSubmit(e, comment.id)}>
            <input type="submit" value="Delete Comment" />
          </form>
        </div>
      ))}
    </div>
  );
};

export default EditPosts;
