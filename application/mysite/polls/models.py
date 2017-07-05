#-*- coding: utf-8 -*-

from __future__ import unicode_literals

import os
from uuid import uuid4
from django.utils.encoding import python_2_unicode_compatible
from django.db import models



def pic_upload_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = '{}.{}'.format(uuid4().hex, ext)
    return os.path.join('polls/', filename)


# Create your models here.
GENDER=[
	('m','男'),
	('f','女')
]


@python_2_unicode_compatible
class Student(models.Model):
	name=models.CharField(max_length=10,null=False)
	gender=models.CharField(max_length=10,choices=GENDER)
	avatar=models.ImageField(upload_to=pic_upload_path)

	def __str__(self):
		return self.name
