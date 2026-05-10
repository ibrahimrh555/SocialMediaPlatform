"""
Serializers for mongoengine Documents.
We use plain dicts / manual serialization since DRF ModelSerializer
is ORM-only. These functions convert Documents → JSON-safe dicts.
"""
from .models import User, Post, Like, Comment, Follow


def serialize_user(user, request_user=None, public=False):
    is_following = False
    if request_user and str(request_user.id) != str(user.id):
        is_following = Follow.objects(follower=request_user, following=user).count() > 0

    data = {
        'id': str(user.id),
        'username': user.username,
        'display_name': user.display_name or '',
        'bio': user.bio or '',
        'avatar_url': user.avatar_url or '',
        'location': user.location or '',
        'followers_count': user.followers_count,
        'following_count': user.following_count,
        'posts_count': user.posts_count,
        'is_following': is_following,
    }
    if not public:
        data['email'] = user.email
        data['website'] = user.website or ''
        data['created_at'] = user.created_at.isoformat() if user.created_at else None
    return data


def serialize_comment(comment, request_user=None):
    return {
        'id': str(comment.id),
        'author': serialize_user(comment.author, request_user, public=True),
        'post': str(comment.post.id),
        'content': comment.content,
        'created_at': comment.created_at.isoformat() if comment.created_at else None,
        'updated_at': comment.updated_at.isoformat() if comment.updated_at else None,
    }


def serialize_post(post, request_user=None):
    is_liked = False
    if request_user:
        is_liked = Like.objects(user=request_user, post=post).count() > 0

    recent_comments = Comment.objects(post=post).order_by('created_at')[:3]

    return {
        'id': str(post.id),
        'author': serialize_user(post.author, request_user, public=True),
        'content': post.content,
        'image_url': post.image_url or '',
        'tags': post.tags or [],
        'likes_count': post.likes_count,
        'comments_count': post.comments_count,
        'is_liked': is_liked,
        'recent_comments': [serialize_comment(c, request_user) for c in recent_comments],
        'created_at': post.created_at.isoformat() if post.created_at else None,
        'updated_at': post.updated_at.isoformat() if post.updated_at else None,
    }