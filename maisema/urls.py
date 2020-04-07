from django.urls import path
from maisema.views import HomeView

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
]
