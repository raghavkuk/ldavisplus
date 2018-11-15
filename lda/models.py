from django.db import models
# from django.conf import reve

DATASET_CHOICES = (
    (1, 'Medium Articles'),
    (2, 'Reuters News')
)

class Document(models.Model):

    text = models.TextField()
    dataset_type = models.IntegerField(choices=DATASET_CHOICES)

    def __str__(self):
        return str(len(self.text))