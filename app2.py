from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
import os
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_login import UserMixin
from dotenv import load_dotenv
from datetime import datetime
from flask_migrate import Migrate
from flask_socketio import emit
from flask_socketio import SocketIO




# Load environment variables from .env file
load_dotenv()


#Init app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')
CORS(app, supports_credentials=True)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
jwt = JWTManager(app)
basedir = os.path.abspath(os.path.dirname(__file__))






#Database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'db.sqlite')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
#Init db
db = SQLAlchemy(app)
#init ma
ma = Marshmallow(app)
migrate = Migrate(app, db)


#Every table will get a class, User, Post, Comment!


#User class
class User(db.Model, UserMixin):
   # Database columns
   id = db.Column(db.Integer, primary_key=True)
   name = db.Column(db.String())
   hashed_password = db.Column(db.String())


   # Method to check if the entered password matches the hashed password in the database
   def check_password(self, password):
       return bcrypt.check_password_hash(self.hashed_password, password)


   # Constructor to initialize user object with name and hashed password
   def __init__(self, name, hashed_password):
       self.name = name
       self.hashed_password = hashed_password


   # Property: Returns True if the user is authenticated
   @property
   def is_authenticated(self):
       return True


   # Property: Returns True if the user is active
   @property
   def is_active(self):
       return True


   # Property: Returns False if the user is anonymous
   @property
   def is_anonymous(self):
       return False


   # Method: Returns a unique identifier for the user (required by Flask-Login)
   def get_id(self):
       return str(self.id)




#this decorator in Flask-Login isused to reload the user object from the user id stored in the session (when a user logs in their user id is stored in the session)
@login_manager.user_loader
def load_user(user_id):
   return User.query.get(int(user_id))


#define the fields you want to show
class UserSchema(ma.Schema):
   class Meta:
       fields = ('id', 'name', 'hashed_password')


#init schema
user_schema = UserSchema() #strinct=True to avoid console warnings
users_schema = UserSchema(many=True) #when dealing with more than 1 user


# Post class
class Post(db.Model):
   id = db.Column(db.Integer, primary_key=True)
   title = db.Column(db.String())
   content = db.Column(db.Text)
   timestamp = db.Column(db.DateTime, default=datetime.utcnow)
   user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) #foreign key to Posts
   user = db.relationship('User', backref=db.backref('posts', lazy=True))


class PostSchema(ma.Schema):
   class Meta:
       fields = ('id', 'title', 'content', 'timestamp', 'user_id')


post_schema = PostSchema()
posts_schema = PostSchema(many=True)




#Comments Class
class Comment(db.Model):
   id = db.Column(db.Integer, primary_key=True)
   content = db.Column(db.Text)
   timestamp = db.Column(db.DateTime, default=datetime.utcnow)
   user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
   post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
   user = db.relationship('User', backref=db.backref('comments', lazy=True))
   post = db.relationship('Post', backref=db.backref('comments', lazy=True))


class CommentSchema(ma.Schema):
   class Meta:
       fields = ('id', 'content', 'timestamp', 'user_id', 'post_id') #fields to send back to client


comment_schema = CommentSchema()
comments_schema = CommentSchema(many=True)






#Routes


#Register a new user (create)
"""
Endpoint to register a new user.


Expects JSON with 'name' and 'password' fields.


Returns JSON with the newly registered user information.
"""
@app.route('/user', methods=['POST'])
def register_user():
  
   print("Registering")
   name = request.json['name']
   #will need to hash password, by importing bcrypt
   password = request.json['password']
   hashed_password = bcrypt.generate_password_hash(password).decode('utf-8') #hashes password
  
   new_user = User(name, hashed_password) #instantiate the User Object


   #adds the user object to the database
   db.session.add(new_user)
   db.session.commit()


   #returns the newly registered user db row in json format
   return user_schema.jsonify(new_user)


#User login route
"""
Endpoint to log in a user.


Expects JSON with 'name' and 'password' fields.


Returns JSON with an access token and user information upon successful login.
"""
@app.route('/login', methods=['POST'])
def login():
   #grabs the name and password from the query parameters
   name = request.json['name']
   password = request.json['password']


   #gets the user object from the User class
   user = User.query.filter_by(name=name).first()


   #checks if the user object is not false(exist) and checks the users hashed password against the one in db
   if user and user.check_password(password):
       login_user(user) #session login
       access_token = create_access_token(identity=user.id) #Creates the access token used for authentication for user
       return jsonify(access_token=access_token, user=user_schema.dump(user)), 200
   else:
       return jsonify({'message': 'Invalid credentials'}), 401  #401=unauthorized


#User logout route
"""
Endpoint to log out a user.


Requires the user to be logged in.


Returns JSON with a message indicating the success of the logout.
"""
@app.route('/logout', methods=['POST'])
@login_required #this decorated ensures the user is logged in to access this route
def logout():
   if current_user.is_authenticated: #checks if a user is logged in
       logout_user() #log the user out


       return jsonify({'message': 'Logout Sucesful'}), 200
   else:
       return jsonify({'message': 'User not logged in'}), 401
  
  
#Get all users
"""
Endpoint to retrieve information about all registered users.


Returns JSON with a list of users.
"""
@app.route('/user', methods=['GET'])
def get_users():
   all_users = User.query.all()
   print("All users: ", all_users)
   result = user_schema.dump(all_users, many=True)
   print("Serialized Result:", result)
   return jsonify(result)




#Get a single user
"""
Endpoint to retrieve information about a specific user.


Expects the user ID as part of the URL.


Returns JSON with information about the requested user.
"""
@app.route('/user/<id>', methods=['GET'])
def get_user(id):
   user = User.query.get(id)
   print("Requested user: ", user)
   return user_schema.jsonify(user)




#Update a user (PUT)
"""
Endpoint to update user information.


Expects JSON with 'name' and 'password' fields.


Requires the user to be logged in.


Returns JSON with the updated user information.
"""
@app.route('/user/<id>', methods=['PUT'])
@login_required
def update_user(id):
   user = User.query.get(id) #gets the user row from db


   name = request.json['name']
   hashed_password = request.json['password'] #must hash password


   user.name = name #update db column
   user.hashed_password = hashed_password #update db colmn


   db.session.commit()
   return user_schema.jsonify(user)


#Delete User
"""
Endpoint to delete a user.


Expects the user ID as part of the URL.


Returns JSON with information about the deleted user.
"""
@app.route('/user/<id>', methods=['DELETE'])
def delete_user(id):
   user = User.query.get(id)


   if user is None:
       return jsonify({'message': 'User not found'}), 404


   # Delete all comments made by the user
   Comment.query.filter_by(user_id=id).delete()


   # Delete all posts made by the user
   Post.query.filter_by(user_id=id).delete()


   db.session.delete(user)
   db.session.commit()


   return user_schema.jsonify(user)






#Endpoints for Posts


# Gets all the Posts from db
"""
Endpoint to retrieve information about all posts.


Returns JSON with a list of posts.
"""
@app.route('/posts', methods=['GET'])
def get_posts():
   print("Getting all posts")
   all_posts = Post.query.all()


   # Use posts_schema to serialize the posts, including the user field
   result = posts_schema.dump(all_posts)
   return jsonify(result)




# Get a single post
"""
Endpoint to retrieve information about a specific post.


Expects the post ID as part of the URL.


Returns JSON with information about the requested post.
"""
@app.route('/post/<int:id>', methods=['GET'])
def get_post(id):
   post = Post.query.get(id)


   if post is None:
       return jsonify({'message': 'Post not found'}), 404


   return post_schema.jsonify(post)




# Add a post
"""
Endpoint to create a new post.


Expects JSON with 'title' and 'content' fields.


Requires the user to be logged in.


Returns JSON with information about the newly created post.
"""
@app.route('/post', methods=['POST'])
@login_required
def create_post():
   # Example (in Flask):
   # Check if 'title' and 'content' are present in the request JSON
   if 'title' not in request.json or 'content' not in request.json:
       return jsonify({'message': 'Missing required fields (title, content)'}), 400


   print("adding a post")
   title = request.json['title']
   content = request.json['content']
   user_id = current_user.id 


   new_post = Post(title=title, content=content, user_id=user_id)
   db.session.add(new_post)
   db.session.commit()


   return post_schema.jsonify(new_post)




# Update a post (PUT)
"""
Endpoint to update a post.


Expects the post ID as part of the URL and JSON with 'title' and 'content' fields.


Requires the user to be the owner of the post.


Returns JSON with information about the updated post.
"""
@app.route('/post/<int:id>', methods=['PUT'])
@login_required
def update_post(id):
   post = Post.query.get(id)


   if post is None:
       return jsonify({'message': 'Post not found'}), 404


   # Check if 'title' and 'content' are present in the request JSON
   if 'title' not in request.json or 'content' not in request.json:
       return jsonify({'message': 'Missing required fields (title, content)'}), 400


   # Check if the current user is the owner of the post (only the creator of the post can edit it)
   if post.user_id != current_user.id:
       return jsonify({'message': 'Permission denied'}), 403


   # Update the post fields
   post.title = request.json['title']
   post.content = request.json['content']


   db.session.commit()


   return post_schema.jsonify(post)




# Delete a post
"""
Endpoint to delete a post.


Expects the post ID as part of the URL.


Requires the user to be the owner of the post.


Returns JSON with information about the deleted post.
"""
@app.route('/post/<int:id>', methods=['DELETE'])
@login_required
def delete_post(id):
   post = Post.query.get(id)


   if post is None:
       return jsonify({'message': 'Post not found'}), 404


   # Check if the current user is the owner of the post
   if post.user_id != current_user.id:
       return jsonify({'message': 'Permission denied'}), 403
  
   # Delete associated comments
   Comment.query.filter_by(post_id=id).delete()


   db.session.delete(post)
   db.session.commit()


   return post_schema.jsonify(post)


#Routes for comments


# Get all comments for a specific post
"""
Endpoint to retrieve all comments for a specific post.


Expects the post ID as part of the URL.


Returns JSON with information about all comments on the specified post.
"""
@app.route('/post/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
   post = Post.query.get(post_id)


   if post is None:
       return jsonify({'message': 'Post not found'}), 404


   comments = post.comments
   result = []


   for comment in comments:
       comment_data = comment_schema.dump(comment)
       # Include user's name in the comment data
       comment_data['user_name'] = comment.user.name
       result.append(comment_data)


   return jsonify(result)




# Get all comments in the db (for testing purpoes)
@app.route('/comments', methods=['GET'])
def get_allcomments():
   print("Getting all comments")
   all_comments = Comment.query.all()


   # Use posts_schema to serialize the posts, including the user field
   result = posts_schema.dump(all_comments)


   return jsonify(result)




# Add a comment to a specific post
"""
Endpoint to add a comment to a specific post.


Expects the post ID as part of the URL and JSON with 'content' field.


Requires the user to be logged in.


Returns JSON with information about the newly created comment.
"""
@app.route('/post/<int:post_id>/comment', methods=['POST'])
@login_required
def create_comment(post_id):
   post = Post.query.get(post_id)


   if post is None:
       return jsonify({'message': 'Post not found'}), 404


   content = request.json['content']
   user_id = current_user.id


   new_comment = Comment(content=content, user_id=user_id, post_id=post_id)
   db.session.add(new_comment)
   db.session.commit()


   return comment_schema.jsonify(new_comment)




# Update a comment
"""
Endpoint to update a comment.


Expects the comment ID as part of the URL and JSON with 'content' field.


Requires the user to be the owner of the comment.


Returns JSON with information about the updated comment.
"""
@app.route('/comment/<int:comment_id>', methods=['PUT'])
@login_required
def update_comment(comment_id):
   comment = Comment.query.get(comment_id)


   if comment is None:
       return jsonify({'message': 'Comment not found'}), 404


   if comment.user_id != current_user.id:
       return jsonify({'message': 'Permission denied'}), 403


   content = request.json['content']
   comment.content = content


   db.session.commit()


   return comment_schema.jsonify(comment)


# Delete a comment
"""
Endpoint to delete a comment.


Expects the comment ID as part of the URL.


Requires the user to be the owner of the comment.


Returns JSON with information about the deleted comment.
"""
@app.route('/comment/<int:comment_id>', methods=['DELETE'])
@login_required
def delete_comment(comment_id):
   comment = Comment.query.get(comment_id)


   if comment is None:
       return jsonify({'message': 'Comment not found'}), 404


   if comment.user_id != current_user.id:
       return jsonify({'message': 'Permission denied'}), 403


   db.session.delete(comment)
   db.session.commit()


   return comment_schema.jsonify(comment)




@app.route('/', methods=['GET'])
def get():
   print("Regular access")
   return jsonify({ 'msg': 'Hello World!!'})


#Run Server
if __name__ == '__main__':
   app.run(port=5001)

