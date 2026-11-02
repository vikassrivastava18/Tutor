from django.urls import path
from .views import (QuizCreateView, 
                    CodingProblemCreateView,
                    CreateSubTopicView,
                    NoteCreateListView,
                    TopicListView,
                    TopicDetailView,
                    NoteDetailView,
                    TopicNotes,
                    ImageUploadView
                    )

urlpatterns = [
    path('subtopics/<int:subtopic_id>/quiz-create/', QuizCreateView.as_view(), name='subtopic-quiz'),
    path('subtopics/<int:subtopic_id>/coding-problems-create/', CodingProblemCreateView.as_view(), name='subtopic-coding-problems'),
    path('topic/<int:topic_id>/create-topic-summary-quiz-code/', CreateSubTopicView.as_view(), name='create-summary-quiz-code'),

    path('', NoteCreateListView.as_view(), name='note-list-create'),
    path('<int:pk>/', NoteDetailView.as_view(), name='note-detail'),
    path('topic/<int:topic_id>/', TopicNotes.as_view(), name='topic-notes'),
    path('upload-image/', ImageUploadView.as_view(), name='upload-image'),
    path('topics/', TopicListView.as_view(), name='topics-list'),
    path('topics/<int:pk>', TopicDetailView.as_view(), name='topics-detail')
]