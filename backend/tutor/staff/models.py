from django.db import models
from django.db.models import JSONField as BuiltinJSONField


class Topic(models.Model):
    topic = models.CharField(max_length=20)

    def __str__(self):
        return self.topic

class Note(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    blocks = BuiltinJSONField(default=list) # list of blocks: {type: 'heading'|'paragraph'|'image', content: '...'}
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


# Simple image model so we can store uploaded files and return a URL
class UploadedImage(models.Model):
    file = models.ImageField(upload_to='note_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.file.name)