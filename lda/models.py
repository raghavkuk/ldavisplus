from django.db import models
# from django.conf import reve

DATASET_CHOICES = (
    (1, 'Medium Articles'),
    (2, 'Reuters News')
)

class Document(models.Model):

    text = models.TextField(null=True)
    tag = models.TextField(null=True)
    sentiment_polarity = models.TextField(null=True)
    sentiment_confidence = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    dataset_type = models.IntegerField(choices=DATASET_CHOICES)

    def __str__(self):
        return str(len(self.text))