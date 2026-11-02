from rest_framework import serializers
from .models import Note, UploadedImage, Topic


class UploadedImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = UploadedImage
        fields = ('id', 'url')

    def get_url(self, obj):
        request = self.context.get('request')
        if request is None:
            return obj.file.url
        return request.build_absolute_uri(obj.file.url)


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ('id', 'title', 'blocks', 'created_at', 'updated_at', 'topic')


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ('id', 'topic')


class TopicNotesSerializer(serializers.Serializer):
    class Meta:
        model = Note
