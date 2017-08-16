
from  django.conf.urls import include,url
from . import views


urlpatterns = [
    url(r'^$',views.get_record_list_view),
    url(r'^list/(?P<record_type>\w*)\/*$',views.get_record_list),
    url(r'^detail/(?P<id>\d+)/$',views.get_record_detail),
    url(r'^home/$',views.get_home_html),
    url(r'^about/$',views.get_about_html),
    url(r'^contact/$',views.store_user_commit_data),
]
