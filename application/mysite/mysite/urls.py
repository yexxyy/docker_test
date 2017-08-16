"""mysite URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url,include
from django.contrib import admin
import views
from django.views.generic import TemplateView

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^assets/(?P<file_path>.*)',views.get_asstes),
    # url(r'^index/$',TemplateView.as_view(template_name="record/index.html")),
    # url (r'^resources/(?P<file_path>.*)', views.get_pictures),
    url (r'^ckeditor/', include ('ckeditor_uploader.urls')),

    url (r'^index/', include ('polls.urls')),
    # url (r'^management/', include ('management.urls'))

]
