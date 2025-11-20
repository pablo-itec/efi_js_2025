# models/models.py (Clases Revertidas a Nombres Originales)

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
# **********************************************
# * CORRECCIÓN: IMPORTAR PYTZ *
# **********************************************
import pytz 

db = SQLAlchemy()

# ***************************************************************
# * CORRECCIÓN: DEFINIR ZONA HORARIA Y FUNCIÓN DE HORA LOCAL *
# ***************************************************************
# Usamos la zona horaria de Buenos Aires, Argentina
ARG_TIMEZONE = pytz.timezone('America/Argentina/Buenos_Aires') 

# Función para obtener la hora local en Argentina
def get_local_now():
    # Eliminamos 'timezone.utc' y usamos el objeto de zona horaria de pytz
    return datetime.now(ARG_TIMEZONE)
# ***************************************************************


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
    
    # Relación a UserCredentials (ORIGINAL)
    credential = db.relationship(
        'UserCredentials', 
        backref='user', 
        lazy=True, 
        uselist=False, # Un usuario tiene una sola credencial
        cascade="all, delete-orphan"
    )
    
    def __str__(self):
        return self.name

# Clase ContentUnit renombrada a Post (ORIGINAL)
class Post(db.Model):
    __tablename__ = 'post' # Mantiene el nombre de la tabla
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    
    # **********************************************
    # * CORRECCIÓN: Usar la hora local de Argentina *
    # **********************************************
    date_time = db.Column(db.DateTime, nullable=False, default=get_local_now) 
    
    # Relaciones FK
    user_id = db.Column(
        db.Integer, 
        db.ForeignKey('user.id', ondelete='CASCADE'), 
        nullable=False
    )
    categoria_id = db.Column(
        db.Integer, 
        db.ForeignKey('categoria.id'), 
        nullable=True
    )
    
    # Relaciones de objetos (backrefs)
    # Se relaciona con User (ORIGINAL)
    autor = db.relationship(
        'User', 
        backref='posts_authored', 
        lazy=True,
        foreign_keys=[user_id] # Especificamos la FK para evitar ambigüedad
    )
    # Se relaciona con Categoria (ORIGINAL)
    categoria = db.relationship(
        'Categoria', 
        backref='posts', 
        lazy=True,
        foreign_keys=[categoria_id]
    )
    
    # boolean para borrado logico
    is_active = db.Column(db.Boolean, default=True) 

    def __str__(self):
        return self.title

# Clase FeedbackUnit renombrada a Comment (ORIGINAL)
class Comment(db.Model):
    __tablename__ = 'comment' # Mantiene el nombre de la tabla
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    
    # **********************************************
    # * CORRECCIÓN: Usar la hora local de Argentina *
    # **********************************************
    date_time = db.Column(db.DateTime, nullable=False, default=get_local_now)
    
    # Relaciones FK
    user_id = db.Column(
        db.Integer, 
        db.ForeignKey('user.id', ondelete='CASCADE'), 
        nullable=False
    )
    post_id = db.Column(
        db.Integer, 
        db.ForeignKey('post.id', ondelete='CASCADE'), 
        nullable=False
    )
    
    # Relaciones de objetos (backrefs)
    # Se relaciona con User (ORIGINAL)
    user = db.relationship(
        'User', 
        backref='comments_made', 
        lazy=True,
        foreign_keys=[user_id]
    )
    # Se relaciona con Post (ORIGINAL)
    post = db.relationship(
        'Post', 
        backref='comments_on_post', 
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
    role = db.Column(db.String(50), nullable=False, default='user') # Nuevo rol
    
    def __str__(self):
        return f"{self.user.name} - {self.role}"