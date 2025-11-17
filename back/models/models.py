# models/models.py (Clases Revertidas a Nombres Originales)

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

db = SQLAlchemy()


# Clase Profile renombrada a User (ORIGINAL)
class User(db.Model):
    __tablename__ = 'user' # Mantiene el nombre de la tabla
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique = True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    is_active = db.Column(db.Boolean, default=True) 
    
    # ¡IMPORTANTE! Las relaciones deben apuntar al nombre de la CLASE: Post y Comment (ORIGINAL)
    # Antes: content_units = db.relationship('ContentUnit', backref='profile', lazy=True)
    posts = db.relationship('Post', backref='author_of_posts', lazy=True)
    comments = db.relationship('Comment', backref='user_comments', lazy=True)
    
    def __str__(self):
        return self.name

# Clase ContentUnit renombrada a Post (ORIGINAL)
class Post(db.Model):
    __tablename__ = 'post' # Mantiene el nombre de la tabla
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    date_time = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))  
    
    # FK y Relación a User (antes Profile)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    # Se relaciona con la clase User (ORIGINAL)
    user = db.relationship(
        'User',
        backref = 'posts_authored',
        lazy = True
    )
    
    is_active = db.Column(db.Boolean, default=True) 
    
    # FK y Relación a Categoria (antes Grouping)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categoria.id'), nullable=True)
    # Se relaciona con la clase Categoria (ORIGINAL)
    categoria = db.relationship(
        'Categoria',
        backref = 'posts',
        lazy = True
    )

    def __str__(self):
        return self.title

# Clase FeedbackUnit renombrada a Comment (ORIGINAL)
class Comment(db.Model):
    __tablename__ = 'comment' # Mantiene el nombre de la tabla
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    date_time = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))
    
    # Relaciones FK a User y Post
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)

    # Se relaciona con User (ORIGINAL)
    user = db.relationship(
        'User', 
        backref='comments_given', 
        lazy=True,
        foreign_keys=[user_id]
    )
    # Se relaciona con Post (ORIGINAL)
    post = db.relationship(
        'Post', 
        backref='comments', 
        lazy=True,
        foreign_keys=[post_id]
    )
    
    is_active = db.Column(db.Boolean, default=True) 

    def __str__(self):
        # Necesita que la relación exista para este str
        return f"Comment by {self.user.name} on post {self.post.title}"
    
# Clase Grouping renombrada a Categoria (ORIGINAL)
class Categoria(db.Model):
    __tablename__ = 'categoria' # Mantiene el nombre de la tabla
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    
    def __str__(self):
        return self.name

# Clase ProfileCredentials renombrada a UserCredentials (ORIGINAL)
class UserCredentials(db.Model):
    __tablename__ = "user_credentials" # Mantiene el nombre de la tabla
    
    id = db.Column(db.Integer, primary_key=True)
    # FK renombrada a user_id
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('user.id', ondelete='CASCADE'),
        nullable=False,
        unique=True
    )
    password_hash = db.Column(db.String(512), nullable=False)
    role = db.Column(db.String(100), default='user')
    
    # Relación con User (ORIGINAL)
    user = db.relationship(
        'User',
        backref=db.backref('credential', uselist=False, cascade='all, delete'),
        lazy=True,
        foreign_keys=[user_id]
    )