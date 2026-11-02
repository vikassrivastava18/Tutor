import logging

from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import (SessionAuthentication,
                                           TokenAuthentication)

from .models import Note, UploadedImage
from .serializers import (NoteSerializer,
                          UploadedImageSerializer,
                          Topic)
from app.models import SubTopic, Topic
from .utils import (
    create_coding_problems,
    create_quizzes,
    create_subtopics,
    create_topic_summary,
)
# Create your views here.


logger = logging.getLogger(__name__)


class CodingProblemCreateView(APIView):
    permission_classes = (IsAdminUser,)

    def post(self, request, subtopic_id):
        # Generate coding problems from the selected subtopic and persist them.
        subtopic = get_object_or_404(SubTopic, pk=subtopic_id)
        codes = create_coding_problems(subtopic.summary).model_dump()
        SubTopic.objects.filter(pk=subtopic.pk).update(codes=codes)
        return Response(codes)


class QuizCreateView(APIView):
    permission_classes = (IsAdminUser,)

    def post(self, request, subtopic_id):
        # Build quiz content from the selected subtopic and return it to the client.
        subtopic = get_object_or_404(SubTopic, pk=subtopic_id)
        quizzes = create_quizzes(subtopic.summary)
        return Response(quizzes.model_dump())


class CreateSubTopicView(APIView):
    permission_classes = (IsAdminUser,)

    def post(self, request, topic_id):
        # Refresh the topic summary before generating its learning sequence.
        topic = get_object_or_404(Topic, pk=topic_id)

        summary = create_topic_summary(topic.content)
        topic.summary = summary
        topic.save(update_fields=["summary"])

        generated_subtopics = create_subtopics(summary).model_dump()
        subtopics = generated_subtopics.get("subtopics", [])

        for item in subtopics:
            # Enrich every generated lesson with practice problems and quizzes.
            content = item["summary"]
            title = item["title"]
            item["codes"] = create_coding_problems(content).model_dump()
            item["quizzes"] = create_quizzes(content).model_dump()

            SubTopic.objects.create(
                topic=topic,
                title=title,
                summary=content,
                codes=item["codes"],
                quizzes=item["quizzes"],
            )

        return Response({
            "summary": summary,
            "subtopics": subtopics,
        })


class NoteCreateListView(generics.ListCreateAPIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Note.objects.all().order_by('-updated_at')
    serializer_class = NoteSerializer


class TopicNotes(generics.ListAPIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = NoteSerializer

    def get_queryset(self):
        topic_id = self.kwargs['topic_id']
        return (
            Note.objects
            .filter(topic=topic_id)
            .order_by('-updated_at')
        )


class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Note.objects.all()
    serializer_class = NoteSerializer


class ImageUploadView(APIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]
    # Accepts multipart/form-data with a field 'file'
    def post(self, request, format=None):
        try:
            file_obj = request.FILES.get('file')
            if not file_obj:
                return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
            img = UploadedImage.objects.create(file=file_obj)
            serializer = UploadedImageSerializer(img, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            logger.error(f"Error occurred in image upload: {e}")
            return Response({'error': 'Image upload failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TopicListView(generics.ListCreateAPIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Topic.objects.all()
    serializer_class = Topic


class TopicDetailView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Topic.objects.all()
    serializer_class = Topic