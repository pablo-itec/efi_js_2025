from models.models import db, User, Post, Comment
from datetime import datetime, timedelta, timezone

class StatsRepository:
    """Implementa métodos para obtener métricas y conteos directos de la BD."""

    @staticmethod
    def count_users():
        """Cuenta el total de usuarios activos."""
        return User.query.filter_by(is_active=True).count()

    @staticmethod
    def count_posts():
        """Cuenta el total de posts activos."""
        return Post.query.filter_by(is_active=True).count()

    @staticmethod
    def count_comments():
        """Cuenta el total de comentarios activos."""
        return Comment.query.filter_by(is_active=True).count()

    @staticmethod
    def count_posts_last_week():
        """Cuenta posts creados en los últimos 7 días (Solo Admin)."""
        one_week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        return Post.query.filter(Post.date_time >= one_week_ago).count()

    @staticmethod
    def count_comments_last_week():
        """Cuenta comentarios creados en los últimos 7 días (Solo Admin)."""
        one_week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        return Comment.query.filter(Comment.date_time >= one_week_ago).count()