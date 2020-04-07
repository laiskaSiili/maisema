from django.urls import path
from maisema.views import HomeView, BrowserView

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('browser/<str:path>', BrowserView.as_view(), name='browser')
]
