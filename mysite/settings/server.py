from setting import *


# DEBUG = False

# Database
# https://docs.djangoproject.com/en/1.10/ref/settings/#databases

DATABASES = {
    # 'default': {
    #     'ENGINE': 'django.db.backends.sqlite3',
    #     'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    # }

    #mysql database setting:
    #when the container link a mysql container,this container will has the env variable of "DB_PORT_3306_TCP_ADDR", the mysql host.
    'default':{
        'ENGINE': 'django.db.backends.mysql',
        'NAME':'docker_db',
        'USER':'root',
        'PASSWORD': os.environ.get('DB_ENV_MYSQL_ROOT_PASSWORD'),
        'HOST':os.environ.get('DB_PORT_3306_TCP_ADDR'),
        'PORT':3306,
        'OPTIONS':{

        }
    }




}




INSTALLED_APPS=BASE_INSTALLED_APPS+MY_INSTALLED_APPS

#when diploy nginx server , we need collect all django's static files
STATIC_ROOT = '/root/static'

MEDIA_ROOT='/root/media'


