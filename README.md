# How to deploy Django with Docker

## docker demo

### Pre-knowledge

docker tutorial:
https://docs.docker.com/get-started/

django tutorial:
https://docs.djangoproject.com/en/1.11/intro/tutorial01/

Setting up Django and your web server with uWSGI and nginx:
https://uwsgi.readthedocs.io/en/latest/tutorials/Django_and_nginx.html

---
---

![](http://upload-images.jianshu.io/upload_images/1271438-b67fdd6631efe10f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

有关docker的介绍啊，为什么 要使用docker啊这些就不说了，因为当你点开这篇作文的时候，你自己心里已经有了答案。那么我们现在就打开电脑，撸起袖子开始docker入门吧。

### docker名词
镜像／image：一个打包好的应用，还有应用运行的系统、资源、配置文件等；
容器／container：镜像的实例。你可以这么理解，我们使用对象（镜像）可以alloc出来一个或者多个实例（容器）
仓库：我们管理代码有github，每个项目创建一个repository，管理镜像也是一样的。
### docker安装

在这里下载相应的docker安装就好。
[docker下载页面](https://www.docker.com/community-edition)
我们构建自己的镜像是需要基础镜像的，比如CentOS，获取镜像直接从[Docker Hub](https://hub.docker.com/)pull就好，类似git clone操作。但是访问国外网站速度慢，可以到[阿里云](https://dev.aliyun.com/search.html)下载，或者是配置阿里云加速器

### docker常用命令
搜索镜像：`docker search centos`

获取镜像：`docker pull registry.cn-hangzhou.aliyuncs.com/1hpc/centos`

查看镜像：
```
iMac:~ yetongxue$ docker images
REPOSITORY                                                TAG                 IMAGE ID            CREATED             SIZE
registry.cn-hangzhou.aliyuncs.com/yetongxue/docker_test   1.2                 f7d570f13f0a        7 days ago          515 MB
yetongxue/docker_test                                     1.2                 f7d570f13f0a        7 days ago          515 MB
mysql                                                     5.7                 c73c7527c03a        3 weeks ago         412 MB
centos                                                    7                   3bee3060bfc8        2 months ago        193 MB
```
查看镜像id：`docker images -q`

删除镜像：`docker rmi image_id`

删除所有镜像：`docker rmi $(docker images -q)`

创建容器：`docker run --name <container_name> centos:7`,container_name是自己定义的容器名

查看所有容器：`docker ps -a`

查看运行容器：`docker ps`

查看容器id：`docker ps -q`

进入容器：`docker exec -it <container_id> bash`

退出容器：`exit`

删除容器：`docker rm <container_id>`

删除所有容器：`docker rm $(docker ps -aq)`

端口映射：`docker run -d -p 8080:80 hub.c.163.com/library/nginx`，说明：-d 表示后台运行，-p 8080:80 表示将宿主机的8080端口映射到容器端口80。容器开放的端口在镜像说明里面会有，nginx开放80，mysql开放3306，一般本来他们监听什么端口，容器就开放什么端口。

启动/停止/重启容器：`docker start/stop/restart <container_id>`

获取容器/镜像的元数据：`docker inspect <container_id>`

挂载数据卷：`docker run -v host/machine/dir :container/path/dir  --name volume_test_container  centos:7`，说明：数据卷的挂载相当于在宿主机的目录与容器目录创建了一个链接，你修改任何一方的内容，另一方的内容也会同步修改。创建数据卷的作用：当容器被删除的时候，容器内的数据也一起被删除。像数据库、媒体资源等文件我们通常都会使用 -v 将容器中的内容链接到宿主机，这样我们重新创建容器的时候再次-v，数据又回来了。


### Dockerfile
以前上学的时候，好多课程学起来感觉没劲，那是因为我们不知道学习它除了考试之外还能做什么。一件事情，我们先有个宏观的认识，然后再分解成很多步骤，那么在每一步的时候，我们才知道这一步我们在做什么，这一步对于整体所具有的意义是什么。那样才会心里有数，做起来也更带感。
所以Dockerfile指令就不一一说明了，我们直接来整体感受下。

当然，下面说的都是假设你已经有了常规应用部署的经验了。本次demo采用的是django+uwsgi+nginx的一个搭配，数据库使用mysql。

**如果你还不太熟悉常规部署，请参照[Django uwsgi nginx 应用部署](http://www.jianshu.com/p/d6905be330f4)**

获取demo：`git clone https://github.com/shiyeli/docker_test.git`

![图1 项目目录结构](http://upload-images.jianshu.io/upload_images/1271438-dafe33fbd909872c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**Dockerfile内容详解**

```
#当你写下FROM centos:7的时候，你就要想着，在这以后的每一步操作都是在centos 7系统镜像中进行的操作，
#你以前是怎么部署应用的，那么请按照你以前的步骤一步一步来就好。
FROM centos:7
#声明镜像制作者
MAINTAINER yetongxue <yeli.studio@qq.com>
#设置时区
ENV TZ "Asia/Shanghai"

# 设置系统环境变量DOCKER_SRC
ENV DOCKER_SRC=mysite
# 设置系统环境变量DOCKER_HOME
ENV DOCKER_HOME=/root
# 设置系统环境变量DOCKER_PROJECT
ENV DOCKER_PROJECT=/root/project

#这句指令相当与：cd /root
WORKDIR $DOCKER_HOME
#紧接着在root目录下面创建了两个文件夹
RUN mkdir media static

#安装应用运行所需要的工具依赖pip，git好像没用上，mysql客户端，
#nc是一个网络工具，端口检测脚本wait-for-it.sh里面有使用这个软件
RUN yum -y install epel-release && \
    yum -y install python-pip && \
    yum -y install git nginx gcc gcc-c++ python-devel && yum -y install mysql && \
    yum -y install mysql-devel && yum install nc -y && yum clean all && \
    pip install --upgrade pip

# cd $DOCKER_PROJECT
WORKDIR $DOCKER_PROJECT
# . 表示当前目录，一是Dockerfile所在的目录，二是刚刚设置的DOCKER_PROJECT目录，这一步操作将会把application目录下的所有文件拷贝到镜像目录DOCKER_PROJECT=/root/project下面
COPY ./ ./
#这一步安装python依赖软件django、Pillow、mysql-python、uwsgi、django-ckeditor。
#补充，-i 是修改pip源，默认的源速度很慢。
RUN pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt
#暴露端口8000，到时候执行docker run 的时候才好把宿主机端口映射到8000
EXPOSE 8000
#赋予start_script执行权限
RUN chmod u+x start_script
#容器启动后要执行的命令
ENTRYPOINT ["./start_script"]
```

以上就是构建镜像所进行的一些操作，你把这想象成都是在centos里面操作就很好理解了。

等用此Dockerfile构建的镜像运行起来的时候，你通过命令查看容器里面的内容，正是我们刚刚操作的结果。
```
iMac:test yetongxue$ docker exec -it ec03d0395eb4 bash
[root@ec03d0395eb4 project]# ls
Dockerfile   docker-compose.yml  mysite_nginx.conf  requirements.txt  uwsgi_params
__init__.py  mysite              mysite_uwsgi.ini   start_script      wait-for-it.sh
[root@ec03d0395eb4 project]# cd;ls
anaconda-ks.cfg  media  original-ks.cfg  project  static
```











