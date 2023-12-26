import re
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from werkzeug.security import generate_password_hash, check_password_hash
# config data from config.py
from config import Config
# migrate
from flask_migrate import Migrate
from flask_cors import CORS
from datetime import timedelta

# create the app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE"], "allow_headers": "*"}})

# from config file
app.config.from_object(Config)

app.config['SQLALCHEMY_DATABASE_URI']
app.config['JWT_SECRET_KEY'] 
# disables a feature that automatically tracks modifications to objects and emits signals 
app.config['SQLALCHEMY_TRACK_MODIFICATIONS']
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

# this variable, db, will be used for all SQLAlchemy commands
db = SQLAlchemy(app)

migrate = Migrate(app, db)

jwt = JWTManager(app)

# class represent a table in database
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(1000), nullable=False)
    organization_id = db.Column(db.Integer, db.ForeignKey('organization.id', ondelete='SET NULL'), nullable=True)

class Organization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80),unique=True, nullable=False)
    users = db.relationship('User', backref='organization', lazy=True)

with app.app_context():
    db.create_all()



@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    email_regex = "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    if not re.match(email_regex, email):
        return jsonify({"message": "Invalid email format"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"message": "Email is already taken"}), 400

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created!"}), 201

@app.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()  # Modified here
    # tests log
    print("Req data =>", data)
    print("DB query user", user)
    
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({"message": "Invalid credentials!"}), 401
    access_token = create_access_token(identity=user.email)  # Use email as identity
    return jsonify({"access_token": access_token})

@app.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    users = User.query.all()
    users_list = [{"id": user.id, "email": user.email, "organization_id": user.organization_id} for user in users]
    return jsonify(users_list), 200

@app.route('/create-org', methods=['POST'])
@jwt_required()
def create_organization():
    data = request.get_json()
    name = data.get('name')
    if not name:
        return jsonify({"message": "Name is required!"}), 400

    existing_organization = Organization.query.filter_by(name=name).first()
    if existing_organization:
        return jsonify({"message": "Organization with this name already exists"}), 400

    organization = Organization(name=name)
    db.session.add(organization)
    db.session.commit()
    return jsonify({"message": "Organization created!"}), 201

@app.route('/organizations', methods=['GET'])
@jwt_required()
def get_organizations():
    organizations = Organization.query.all()
    return jsonify([org.name for org in organizations]), 200

@app.route('/organization/<org_name>', methods=['GET'])
@jwt_required()
def get_users(org_name):
    organization = Organization.query.filter_by(name=org_name).first()
    if organization is None:
        return jsonify({'error': 'Organization not found'}), 404
    users = User.query.filter_by(organization_id=organization.id).all()
    return jsonify([user.email for user in users]), 200

@app.route('/add-user-to-org', methods=['POST'])
@jwt_required()
def add_user_to_org():
    data = request.get_json()
    email = data.get('email')
    name = data.get('org_name')

    user = User.query.filter_by(email=email).first()
    organization = Organization.query.filter_by(name=name).first()

    if not user or not organization:
        return jsonify({"error": "User or Organization not found"}), 404

    if user.organization_id == organization.id:
        return jsonify({"message": "User is already in this organization"}), 200

    user.organization_id = organization.id
    db.session.commit()

    return jsonify({"message": "User added to organization successfully"}), 200

if __name__ == '__main__':
    app.run(debug=True)