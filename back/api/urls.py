from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Current user
    path('me/', views.MeView.as_view(), name='me'),
    path('me/feed/', views.FeedView.as_view(), name='feed'),

    # User profiles
    path('users/<str:username>/', views.UserProfileView.as_view(), name='user-profile'),
    path('users/<str:username>/posts/', views.UserPostsView.as_view(), name='user-posts'),
    path('users/<str:username>/followers/', views.UserFollowersView.as_view(), name='user-followers'),
    path('users/<str:username>/following/', views.UserFollowingView.as_view(), name='user-following'),
    path('users/<str:username>/follow/', views.FollowToggleView.as_view(), name='follow-toggle'),

    # Posts
    path('posts/', views.PostListCreateView.as_view(), name='posts'),
    path('posts/<int:pk>/', views.PostDetailView.as_view(), name='post-detail'),
    path('posts/<int:pk>/like/', views.LikeToggleView.as_view(), name='post-like'),
    path('posts/<int:pk>/comments/', views.CommentListCreateView.as_view(), name='post-comments'),
    path('posts/<int:pk>/comments/<int:comment_pk>/', views.CommentDetailView.as_view(), name='comment-detail'),

    # Explore & Search
    path('explore/', views.ExploreView.as_view(), name='explore'),
    path('search/', views.SearchView.as_view(), name='search'),
    path('suggested/', views.SuggestedUsersView.as_view(), name='suggested'),
]