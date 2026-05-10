import datetime
from mongoengine import (
    Document, StringField, EmailField, BooleanField,
    DateTimeField, ReferenceField, ListField,
)


class User(Document):
    username = StringField(required=True, unique=True, max_length=50)
    email = EmailField(required=True, unique=True)
    display_name = StringField(max_length=100, default='')
    bio = StringField(default='')
    avatar_url = StringField(default='')   # plain string — URLField rejects ''
    website = StringField(default='')      # plain string — URLField rejects ''
    location = StringField(max_length=100, default='')
    password_hash = StringField(required=True)
    is_active = BooleanField(default=True)
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    updated_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {'collection': 'users', 'indexes': ['username', 'email']}

    @property
    def pk(self):
        return str(self.id)

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def set_password(self, raw_password):
        from django.contrib.auth.hashers import make_password
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password):
        from django.contrib.auth.hashers import check_password
        return check_password(raw_password, self.password_hash)

    @property
    def followers_count(self):
        return Follow.objects(following=self).count()

    @property
    def following_count(self):
        return Follow.objects(follower=self).count()

    @property
    def posts_count(self):
        return Post.objects(author=self).count()

    def __str__(self):
        return self.username


class Follow(Document):
    follower = ReferenceField(User, required=True)
    following = ReferenceField(User, required=True)
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'follows',
        'indexes': [
            {'fields': ['follower', 'following'], 'unique': True},
            'follower', 'following',
        ],
    }


class Post(Document):
    author = ReferenceField(User, required=True)
    content = StringField(required=True, max_length=1000)
    image_url = StringField(default='')   # plain string for same reason
    tags = ListField(StringField(), default=list)
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    updated_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'posts',
        'indexes': ['author', '-created_at'],
        'ordering': ['-created_at'],
    }

    @property
    def pk(self):
        return str(self.id)

    @property
    def likes_count(self):
        return Like.objects(post=self).count()

    @property
    def comments_count(self):
        return Comment.objects(post=self).count()


class Like(Document):
    user = ReferenceField(User, required=True)
    post = ReferenceField(Post, required=True)
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'likes',
        'indexes': [{'fields': ['user', 'post'], 'unique': True}],
    }


class Comment(Document):
    author = ReferenceField(User, required=True)
    post = ReferenceField(Post, required=True)
    content = StringField(required=True, max_length=500)
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    updated_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'comments',
        'indexes': ['post', 'author'],
        'ordering': ['created_at'],
    }