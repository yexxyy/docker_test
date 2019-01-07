#coding=utf-8
from django.shortcuts import render
from django.http import HttpResponse,JsonResponse,HttpResponseBadRequest,HttpResponseRedirect
from .models import Record,ContactData
from django.http import Http404
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.template import loader

#records list
from django.views.decorators.http import require_GET

@require_GET
def get_record_list(request,record_type):
    records=Record.objects.all().order_by('-date')
    json_list = []
    if record_type == 'type_all':  # 请求所有列表
        pass
    else:
        records = records.filter(record_type=record_type)

    json_list=[]
    for record in records:
        record_detail=record.to_json()
        json_list.append(record_detail)

    return JsonResponse({
        'status':200,
        'message':'获取记录列表成功',
        'list':json_list,
    })



#获取记录详情
@require_GET
def get_record_detail(request,id):
    try:
        record=Record.objects.get(pk=id)
    except Record.DoesNotExist:
        raise Http404('记录不存在')

    return JsonResponse(record.to_json())


def get_record_list_view(request):

    # template = loader.get_template('record/record_list.html')
    # return HttpResponse(template.render(request))

    #或者:
    return render(request,'record/index.html')

#获取业力实验室主页
def get_home_html(request):
    return render(request, 'record/record_home.html')


#获取:业力实验室>联系我们
def get_about_html(request):
    return render(request,'record/record_about.html')


#存储用户提交的联系信息
def store_user_commit_data(request):
    params=request.POST

    print params
    try:
        name=params.get('name')
        mail=params.get('email')
        phone=params.get('phone')
        message=params.get('message')

        contectData = ContactData()
        contectData.name = name
        contectData.phone = phone
        contectData.mail = mail
        contectData.message = message
        contectData.save()
    except:
        pass
    return HttpResponseRedirect ('/index/')