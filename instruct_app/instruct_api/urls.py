from django.urls import path, include
from .views import (
    InstructView,
)

urlpatterns = [
    path('api', InstructView.as_view()),
]