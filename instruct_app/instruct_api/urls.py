from django.urls import path, include
from .views import (
    InstructView, InpaintView
)

urlpatterns = [
    path('instruct', InstructView.as_view()),
    path('inpaint', InpaintView.as_view()),

]