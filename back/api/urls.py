from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view()),
    path('auth/login/', views.LoginView.as_view()),
    path('auth/logout/', views.LogoutView.as_view()),

    # Current user
    path('me/', views.MeView.as_view()),
    path('me/feed/', views.FeedView.as_view()),

    # User profiles
    path('users/<str:username>/', views.UserProfileView.as_view()),
    path('users/<str:username>/posts/', views.UserPostsView.as_view()),
    path('users/<str:username>/followers/', views.UserFollowersView.as_view()),
    path('users/<str:username>/following/', views.UserFollowingView.as_view()),
    path('users/<str:username>/follow/', views.FollowToggleView.as_view()),

    # Posts
    path('posts/', views.PostListCreateView.as_view()),
    path('posts/<str:pk>/', views.PostDetailView.as_view()),
    path('posts/<str:pk>/like/', views.LikeToggleView.as_view()),
    path('posts/<str:pk>/comments/', views.CommentListCreateView.as_view()),
    path('posts/<str:pk>/comments/<str:comment_pk>/', views.CommentDetailView.as_view()),

    # Explore / Search
    path('explore/', views.ExploreView.as_view()),
    path('search/', views.SearchView.as_view()),
    path('suggested/', views.SuggestedUsersView.as_view()),
]