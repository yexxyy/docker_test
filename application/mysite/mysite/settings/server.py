from setting import *


# DEBUG = False



STATICFILES_DIRS = [
    os.path.join(os.path.join(BASE_DIR,os.pardir), 'static'),
]

INSTALLED_APPS=BASE_INSTALLED_APPS+MY_INSTALLED_APPS

#when diploy nginx server , we need collect all django's static files
STATIC_ROOT = '/root/static'

MEDIA_ROOT='/root/media'


