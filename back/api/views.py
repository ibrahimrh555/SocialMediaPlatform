import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from mongoengine.errors import NotUniqueError, DoesNotExist
from mongoengine.queryset.visitor import Q

from .models import User, Post, Like, Comment, Follow
from .serializers import serialize_user, serialize_post, serialize_comment
from .auth import get_tokens_for_user


# ─── Auth ─────────────────────────────────────────────────────────────────────

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        password2 = data.get('password2', '')
        display_name = data.get('display_name', '').strip()

        errors = {}
        if not username:
            errors['username'] = 'Required.'
        if not email:
            errors['email'] = 'Required.'
        if not password:
            errors['password'] = 'Required.'
        if password != password2:
            errors['password'] = 'Passwords do not match.'
        if len(password) < 6:
            errors['password'] = 'Must be at least 6 characters.'
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        user = User(username=username, email=email, display_name=display_name)
        user.set_password(password)
        try:
            user.save()
        except NotUniqueError:
            return Response({'error': 'Username or email already taken.'}, status=400)

        tokens = get_tokens_for_user(user)
        return Response({
            'user': serialize_user(user),
            **tokens,
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')
        try:
            user = User.objects.get(username=username)
        except DoesNotExist:
            return Response({'error': 'Invalid credentials'}, status=401)

        if not user.check_password(password):
            return Response({'error': 'Invalid credentials'}, status=401)

        tokens = get_tokens_for_user(user)
        return Response({'user': serialize_user(user), **tokens})


class LogoutView(APIView):
    def post(self, request):
        # JWT is stateless; client discards the token
        return Response({'message': 'Logged out successfully'})


# ─── Current User ─────────────────────────────────────────────────────────────

class MeView(APIView):
    def get(self, request):
        return Response(serialize_user(request.user))

    def patch(self, request):
        user = request.user
        allowed = ['display_name', 'bio', 'avatar_url', 'website', 'location']
        for field in allowed:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.updated_at = datetime.datetime.utcnow()
        user.save()
        return Response(serialize_user(user))


# ─── User Profiles ─────────────────────────────────────────────────────────────

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            return Response(serialize_user(user, request.user, public=True))
        except DoesNotExist:
            return Response({'error': 'User not found'}, status=404)


class UserPostsView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
        except DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        posts = Post.objects(author=user).order_by('-created_at')
        return Response([serialize_post(p, request.user) for p in posts])


class UserFollowersView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
        except DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        follows = Follow.objects(following=user).select_related()
        users = [f.follower for f in follows]
        return Response([serialize_user(u, request.user, public=True) for u in users])


class UserFollowingView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
        except DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        follows = Follow.objects(follower=user).select_related()
        users = [f.following for f in follows]
        return Response([serialize_user(u, request.user, public=True) for u in users])


# ─── Follow ────────────────────────────────────────────────────────────────────

class FollowToggleView(APIView):
    def post(self, request, username):
        try:
            target = User.objects.get(username=username)
        except DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        if str(target.id) == str(request.user.id):
            return Response({'error': 'Cannot follow yourself'}, status=400)

        existing = Follow.objects(follower=request.user, following=target).first()
        if existing:
            existing.delete()
            return Response({'following': False, 'followers_count': target.followers_count})
        else:
            Follow(follower=request.user, following=target).save()
            return Response({'following': True, 'followers_count': target.followers_count})


# ─── Posts ─────────────────────────────────────────────────────────────────────

class FeedView(APIView):
    def get(self, request):
        following_ids = [f.following.id for f in Follow.objects(follower=request.user).only('following')]
        following_ids.append(request.user.id)
        posts = Post.objects(author__in=following_ids).order_by('-created_at')
        return Response([serialize_post(p, request.user) for p in posts])


class ExploreView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        posts = Post.objects.order_by('-created_at').limit(50)
        return Response([serialize_post(p, request.user if request.user.is_authenticated else None) for p in posts])


class PostListCreateView(APIView):
    def get(self, request):
        posts = Post.objects(author=request.user).order_by('-created_at')
        return Response([serialize_post(p, request.user) for p in posts])

    def post(self, request):
        content = request.data.get('content', '').strip()
        if not content:
            return Response({'content': 'Required.'}, status=400)
        post = Post(
            author=request.user,
            content=content,
            image_url=request.data.get('image_url', ''),
            tags=request.data.get('tags', []),
        )
        post.save()
        return Response(serialize_post(post, request.user), status=201)


class PostDetailView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_post(self, pk):
        try:
            return Post.objects.get(id=pk)
        except (DoesNotExist, Exception):
            return None

    def get(self, request, pk):
        post = self.get_post(pk)
        if not post:
            return Response({'error': 'Not found'}, status=404)
        return Response(serialize_post(post, request.user if request.user.is_authenticated else None))

    def patch(self, request, pk):
        post = self.get_post(pk)
        if not post:
            return Response({'error': 'Not found'}, status=404)
        if str(post.author.id) != str(request.user.id):
            return Response({'error': 'Permission denied'}, status=403)
        for field in ['content', 'image_url', 'tags']:
            if field in request.data:
                setattr(post, field, request.data[field])
        post.updated_at = datetime.datetime.utcnow()
        post.save()
        return Response(serialize_post(post, request.user))

    def delete(self, request, pk):
        post = self.get_post(pk)
        if not post:
            return Response({'error': 'Not found'}, status=404)
        if str(post.author.id) != str(request.user.id):
            return Response({'error': 'Permission denied'}, status=403)
        Like.objects(post=post).delete()
        Comment.objects(post=post).delete()
        post.delete()
        return Response(status=204)


# ─── Likes ─────────────────────────────────────────────────────────────────────

class LikeToggleView(APIView):
    def post(self, request, pk):
        try:
            post = Post.objects.get(id=pk)
        except (DoesNotExist, Exception):
            return Response({'error': 'Not found'}, status=404)

        existing = Like.objects(user=request.user, post=post).first()
        if existing:
            existing.delete()
            return Response({'liked': False, 'likes_count': post.likes_count})
        Like(user=request.user, post=post).save()
        return Response({'liked': True, 'likes_count': post.likes_count})


# ─── Comments ──────────────────────────────────────────────────────────────────

class CommentListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, pk):
        try:
            post = Post.objects.get(id=pk)
        except (DoesNotExist, Exception):
            return Response({'error': 'Not found'}, status=404)
        comments = Comment.objects(post=post).order_by('created_at')
        return Response([serialize_comment(c, request.user if request.user.is_authenticated else None) for c in comments])

    def post(self, request, pk):
        try:
            post = Post.objects.get(id=pk)
        except (DoesNotExist, Exception):
            return Response({'error': 'Not found'}, status=404)
        content = request.data.get('content', '').strip()
        if not content:
            return Response({'content': 'Required.'}, status=400)
        comment = Comment(author=request.user, post=post, content=content)
        comment.save()
        return Response(serialize_comment(comment, request.user), status=201)


class CommentDetailView(APIView):
    def delete(self, request, pk, comment_pk):
        try:
            comment = Comment.objects.get(id=comment_pk, post=pk)
        except (DoesNotExist, Exception):
            return Response({'error': 'Not found'}, status=404)
        if str(comment.author.id) != str(request.user.id):
            return Response({'error': 'Permission denied'}, status=403)
        comment.delete()
        return Response(status=204)


# ─── Search ────────────────────────────────────────────────────────────────────

class SearchView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        if not q:
            return Response({'users': [], 'posts': []})

        users = User.objects(
            Q(username__icontains=q) | Q(display_name__icontains=q)
        ).limit(10)

        posts = Post.objects(content__icontains=q).order_by('-created_at').limit(20)

        req_user = request.user if request.user.is_authenticated else None
        return Response({
            'users': [serialize_user(u, req_user, public=True) for u in users],
            'posts': [serialize_post(p, req_user) for p in posts],
        })


# ─── Suggested Users ───────────────────────────────────────────────────────────

class SuggestedUsersView(APIView):
    def get(self, request):
        following_ids = [f.following.id for f in Follow.objects(follower=request.user).only('following')]
        following_ids.append(request.user.id)
        suggested = User.objects(id__nin=following_ids).limit(6)
        return Response([serialize_user(u, request.user, public=True) for u in suggested])