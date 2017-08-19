# How to deploy Django with Docker

## docker demo

### Pre-knowledge

docker tutorial:
https://docs.docker.com/get-started/

django tutorial:
https://docs.djangoproject.com/en/1.11/intro/tutorial01/

Setting up Django and your web server with uWSGI and nginx:
https://uwsgi.readthedocs.io/en/latest/tutorials/Django_and_nginx.html

# docker入门，如何部署Django uwsgi nginx应用

![](http://upload-images.jianshu.io/upload_images/1271438-b67fdd6631efe10f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

[简书链接](http://www.jianshu.com/p/ef8f17442d8f)

有关docker的介绍啊，为什么 要使用docker啊这些就不说了，因为当你点开这篇作文的时候，你自己心里已经有了答案。那么我们现在就打开电脑，撸起袖子开始docker入门吧。

### 相关名词

**镜像（image）：** 一个打包好的应用，还有应用运行的系统、资源、配置文件等；


**容器（container）：** 镜像的实例。你可以这么理解，我们使用对象（镜像）可以alloc出来一个或者多个实例（容器）；

**仓库：** 我们管理代码有github，每个项目创建一个repository，管理镜像也是一样的。

### 安装docker

在这里下载相应的docker安装就好。

[docker下载页面](https://www.docker.com/community-edition)

我们构建自己的镜像是需要基础镜像的，比如CentOS，获取镜像直接从[Docker Hub](https://hub.docker.com/)pull就好，类似git clone操作。但是访问国外网站速度慢，可以到[阿里云](https://dev.aliyun.com/search.html)下载，或者是配置阿里云加速器

### 常用命令

这尼玛太多了，建议瞅瞅就直接略过吧。需要操作的时候回过来再查找相关命令就好。

**搜索镜像：** `docker search centos`

**获取镜像：** `docker pull registry.cn-hangzhou.aliyuncs.com/1hpc/centos`

**查看镜像：**
```
iMac:~ yetongxue$ docker images
REPOSITORY                                                TAG                 IMAGE ID            CREATED             SIZE
registry.cn-hangzhou.aliyuncs.com/yetongxue/docker_test   1.2                 f7d570f13f0a        7 days ago          515 MB
yetongxue/docker_test                                     1.2                 f7d570f13f0a        7 days ago          515 MB
mysql                                                     5.7                 c73c7527c03a        3 weeks ago         412 MB
centos                                                    7                   3bee3060bfc8        2 months ago        193 MB
```
**查看镜像id：** `docker images -q`

**删除镜像：** `docker rmi image_id`

**删除所有镜像：** `docker rmi $(docker images -q)`

**创建容器：** `docker run --name <container_name> centos:7`,container_name是自己定义的容器名

**查看所有容器：** `docker ps -a`

**查看运行容器：** `docker ps`

**查看容器id：** `docker ps -q`

**进入容器：** `docker exec -it <container_id> bash`

**退出容器：** `exit`

**删除容器：** `docker rm <container_id>`

**删除所有容器：** `docker rm $(docker ps -aq)`

**端口映射：** `docker run -d -p 8080:80 hub.c.163.com/library/nginx`，说明：-d 表示后台运行，-p 8080:80 表示将宿主机的8080端口映射到容器端口80。容器开放的端口在镜像说明里面会有，nginx开放80，mysql开放3306，一般本来他们监听什么端口，容器就开放什么端口。

**启动/停止/重启容器：** `docker start/stop/restart <container_id>`

**获取容器/镜像的元数据：** `docker inspect <container_id>`

**挂载数据卷：** `docker run -v host/machine/dir :container/path/dir  --name volume_test_container  centos:7`，说明：数据卷的挂载相当于在宿主机的目录与容器目录创建了一个链接，你修改任何一方的内容，另一方的内容也会同步修改。创建数据卷的作用：当容器被删除的时候，容器内的数据也一起被删除。像数据库、媒体资源等文件我们通常都会使用 -v 将容器中的内容链接到宿主机，这样我们重新创建容器的时候再次-v，数据又回来了。

**启动mysql容器：** `docker run --name some-mysql -e MYSQL_ROOT_PASSWORD=qwerasdf -d mysql:5.7`，默认用户为root，密码qwerasdf

mysql容器启动后，其他容器就可以来连接使用了，方法如下：

**容器连接：** `docker run --name some-app --link some-mysql:mysql -d application-that-uses-mysql`

### Dockerfile

以前上学的时候，好多课程学起来感觉没劲，那是因为我们不知道学习它除了考试之外还能做什么。一件事情，我们先有个宏观的认识，然后再分解成很多步骤，那么在每一步的时候，我们才知道这一步我们在做什么，这一步对于整体所具有的意义是什么。那样才会心里有数，做起来也更带感。
所以Dockerfile指令就不一一说明了，我们直接来整体感受下。

当然，下面说的都是假设你已经有了常规应用部署的经验了。本次demo采用的是django+uwsgi+nginx的一个搭配，数据库使用mysql。

**如果你还不太熟悉常规部署，请参照[Django uwsgi nginx 应用部署](http://www.jianshu.com/p/d6905be330f4)**

获取demo：`git clone https://github.com/shiyeli/docker_test.git`

![图1 项目目录结构](http://upload-images.jianshu.io/upload_images/1271438-f7481afddc57f6b9.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

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
# . 表示当前目录，一是Dockerfile所在的目录，二是刚刚设置的DOCKER_PROJECT目录，
#这一步操作将会把项目中application目录下的所有文件拷贝到镜像目录DOCKER_PROJECT=/root/project下面
COPY ./ ./
#这一步安装python依赖软件django、Pillow、mysql-python、uwsgi、django-ckeditor。
#补充，-i 是修改pip源，默认的源速度很慢，经常卡在这里。
RUN pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt
#暴露端口8000，到时候执行docker run 的时候才好把宿主机端口映射到8000
EXPOSE 8000
#赋予start_script执行权限
RUN chmod u+x start_script
#容器启动后要执行的命令
ENTRYPOINT ["./start_script"]
```
以上就是我们构建一个镜像所要进行的操作，有了这个Dockerfile，我们就可以进入Dockerfile所在的目录了，执行：`docker build -t yetongxue/docker_test:1.2  ./` 构建我们的镜像了。

我知道，现在你心里已经有很多疑问了：
这个容器启动后能工作吗？
我数据库上哪儿连啊？
还有nginx配置，python manage.py migrate 刷新数据库都还没有做，uwsgi还没启动咧！

是的是的，咋们继续分解分解...

### 启动脚本start_script
我们刚刚忽略了容器启动后还有执行的命令了。咋们一起来看看start_script里面在做什么。
```
#!/bin/bash

#sed是一个Linux编辑器吧，此命令的作用是查找文件/etc/nginx/nginx.conf中包含user的行，并将此行的nginx替换成root
sed -i '/user/{s/nginx/root/}' /etc/nginx/nginx.conf
#将项目nginx配置连接到nginx配置
ln -s /root/project/mysite_nginx.conf /etc/nginx/conf.d/
#启动nginx
nginx
#赋予wait-for-it.sh可执行权限
chmod u+x wait-for-it.sh
#判断数据库端口是否可用，因为数据库未准备好的话接下来的数据库刷新操作将失败。
#其实，假如我们事先启动好了一个数据库容器的话，此操作也可以省略。
#这样做是因为最后我们会使用docker-compose来一起管理两个或者多个容器，
#docker-compose里面三个关键字：link、depends_on、volume_from是可以确定容器的启动顺序的，
#但是，容器里面的mysql是否启动那就不一定了，所以我们检测下端口比较稳妥。
#没有好我们等几秒也无妨
#另外，这里的两个环境变量DB_PORT_3306_TCP_ADDR和DB_PORT_3306_TCP_PORT是mysql容器中的，
#不用猜也知道，一个是host，一个是port
#如果我们通过link将一个容器连接到mysql容器，mysql容器中的一些环境变量会共享出来的。
./wait-for-it.sh $DB_PORT_3306_TCP_ADDR:$DB_PORT_3306_TCP_PORT &
wait

#设置manage.py中使用的setting
export DJANGO_SETTINGS_MODULE=mysite.settings.server

#进入mysite目录（application下一级目录，不是mysite目录下的mysite）
#刚开始也许你有点困惑，不知道现在操作的目录到底在哪里，不像通常操作Linux，我可以pwd一下。
#其实是这样的，你以此脚本所在的位置为参照，你看项目目录结构发现，
#start_script与目录mysite是同一级的，manage.py在mysite之下，对吧
cd mysite
#刷新数据库
./manage.py migrate --noinput
#加载管理员用户到数据库，以便容器启动之后不必再进入容器执行python manage.py createsuperuser操作
./manage.py loaddata ./fixtures/superuser.json
#收集静态文件
./manage.py collectstatic --noinput

#返回上级目录，mysite_uwsgi.ini所在的目录
cd ..
#启动uwsgi
uwsgi --ini mysite_uwsgi.ini
```

**附一：** 链接过mysql容器的容器的环境变量
```
[root@d9f25c4909bb project]# env
HOSTNAME=d9f25c4909bb
DB_NAME=/web/db
DOCKER_HOME=/root
TERM=xterm
DB_PORT=tcp://172.17.0.2:3306
DB_PORT_3306_TCP_PORT=3306
DB_ENV_GOSU_VERSION=1.7
DB_PORT_3306_TCP_PROTO=tcp
DB_ENV_MYSQL_ROOT_PASSWORD=qwerasdf
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
DOCKER_PROJECT=/root/project
PWD=/root/project
TZ=Asia/Shanghai
DB_PORT_3306_TCP_ADDR=172.17.0.2
SHLVL=1
HOME=/root
DB_PORT_3306_TCP=tcp://172.17.0.2:3306
DB_ENV_MYSQL_VERSION=5.7.19-1debian8
LESSOPEN=||/usr/bin/lesspipe.sh %s
DB_ENV_MYSQL_MAJOR=5.7
DOCKER_SRC=mysite
_=/usr/bin/env
```
**附二：** server.py 设置中的数据库连接配置
```
DATABASES = {
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
```
**附三：** Django初始化数据
针对脚本里面的命令`./manage.py loaddata ./fixtures/superuser.json`，请参见[Providing initial data for models](https://docs.djangoproject.com/en/1.8/howto/initial-data/)
执行命令后数据库相应的表中会添加一条记录。
./fixtures/superuser.json内容如下：
```
[
    { "model": "auth.user",
        "pk": 1,
        "fields": {
            "username": "root",
            "password": "pbkdf2_sha256$30000$IdlNbZkEbkO3$4sqwI5SnLPDN2bhelVCE+Hu1rzspQU20OuYfQbW0G+c=",
            "is_superuser": true,
            "is_staff": true,
            "is_active": true
        }
    }
]
```
因为django的密码是经过的哈希的，所以这里填写的密码是你想要设置密码的哈希字符串。
生成django密码：
```
In [1]: from django.contrib.auth.hashers import make_password

In [2]: make_password('qwerasdf')
Out[2]: u'pbkdf2_sha256$30000$IdlNbZkEbkO3$4sqwI5SnLPDN2bhelVCE+Hu1rzspQU20OuYfQbW0G+c=‘
```

**附四：** nginx配置
```
# mysite_nginx.conf


# configuration of the server
server {
    # the port your site will be served on, default_server indicates that this server block
    # is the block to use if no blocks match the server_name
    listen      8000 default_server;

    # the domain name it will serve for
    server_name localhost; # substitute your machine's IP address or FQDN
    charset     utf-8;

    # max upload size
    client_max_body_size 75M;   # adjust to taste

    # Django media
    location /media  {
        alias /root/media;  # your Django project's media files - amend as required
    }

    location /static {
        alias /root/static; # your Django project's static files - amend as required
    }

    # Finally, send all non-media requests to the Django server.
    location / {
        uwsgi_pass  unix:///root/project/mysite/docker_app.sock; # for a file socket
        include     /root/project/uwsgi_params; # the uwsgi_params file you installed
    }
}
```
这下了然了噻。

### 运行容器
我们刚刚在Dockerfile所在的目录下执行`docker build -t yetongxue/docker_test:1.2  ./`得到了镜像yetongxue/docker_test:1.2。此容器运行是需要依赖mysql容器的。所以我们首先启动一个mysql容器：
`docker run --name db -d -e MYSQL_ROOT_PASSWORD=qwerasdf -e MYSQL_DATABASE=docker_db -v Users/yetongxue/Desktop/volumes/docker_test/db:/var/lib/mysql mysql:5.7
`
说明：
* --name给容器取个好听的名字；
* -d 后台运行；
* -e你要传递给容器的参数，你还可以指定用户名，不传默认root用户
* -v 容器中的数据库同步到宿主机以防不测。如果你创建了一个数据卷容器的话，你这里也可以使用参数 volume_from
* 最后是要采用的镜像及版本号

**补充：**
mysql的镜像其实跟我们刚刚构建的镜像一样，Dockerfile的最后会有一句`ENTRYPOINT ["docker-entrypoint.sh"]`，我们来看看这个脚本吧。
```
[root@iZ94l43yka9Z docker_test]# docker ps
CONTAINER ID        IMAGE                                                         COMMAND                  CREATED             STATUS              PORTS                    NAMES
70d1d4b59e06        registry.cn-hangzhou.aliyuncs.com/yetongxue/docker_test:1.2   "./start_script"         30 hours ago        Up 12 seconds       0.0.0.0:8100->8000/tcp   dockertest_web_1
6b5881e8c4b2        mysql:5.7                                                     "docker-entrypoint.sh"   30 hours ago        Up 12 seconds       3306/tcp                 dockertest_db_1
[root@iZ94l43yka9Z docker_test]# docker exec -it 6b5881e8c4b2 bash
root@6b5881e8c4b2:/# ls
bin   dev			  entrypoint.sh  home  lib64  mnt  proc  run   srv  tmp  var
boot  docker-entrypoint-initdb.d  etc		 lib   media  opt  root  sbin  sys  usr
root@6b5881e8c4b2:/# nl entrypoint.sh
     1	#!/bin/bash
     2	set -eo pipefail
     3	shopt -s nullglob

     4	# if command starts with an option, prepend mysqld
     5	if [ "${1:0:1}" = '-' ]; then
     6		set -- mysqld "$@"
     7	fi

     8	# skip setup if they want an option that stops mysqld
     9	wantHelp=
    10	for arg; do
    11		case "$arg" in
    12			-'?'|--help|--print-defaults|-V|--version)
    13				wantHelp=1
    14				break
    15				;;
    16		esac
    17	done

    18	# usage: file_env VAR [DEFAULT]
    19	#    ie: file_env 'XYZ_DB_PASSWORD' 'example'
    20	# (will allow for "$XYZ_DB_PASSWORD_FILE" to fill in the value of
    21	#  "$XYZ_DB_PASSWORD" from a file, especially for Docker's secrets feature)
    22	file_env() {
    23		local var="$1"
    24		local fileVar="${var}_FILE"
    25		local def="${2:-}"
    26		if [ "${!var:-}" ] && [ "${!fileVar:-}" ]; then
    27			echo >&2 "error: both $var and $fileVar are set (but are exclusive)"
    28			exit 1
    29		fi
    30		local val="$def"
    31		if [ "${!var:-}" ]; then
    32			val="${!var}"
    33		elif [ "${!fileVar:-}" ]; then
    34			val="$(< "${!fileVar}")"
    35		fi
    36		export "$var"="$val"
    37		unset "$fileVar"
    38	}

    39	_check_config() {
    40		toRun=( "$@" --verbose --help )
    41		if ! errors="$("${toRun[@]}" 2>&1 >/dev/null)"; then
    42			cat >&2 <<-EOM

    43				ERROR: mysqld failed while attempting to check config
    44				command was: "${toRun[*]}"

    45				$errors
    46			EOM
    47			exit 1
    48		fi
    49	}

    50	# Fetch value from server config
    51	# We use mysqld --verbose --help instead of my_print_defaults because the
    52	# latter only show values present in config files, and not server defaults
    53	_get_config() {
    54		local conf="$1"; shift
    55		"$@" --verbose --help --log-bin-index="$(mktemp -u)" 2>/dev/null | awk '$1 == "'"$conf"'" { print $2; exit }'
    56	}

    57	# allow the container to be started with `--user`
    58	if [ "$1" = 'mysqld' -a -z "$wantHelp" -a "$(id -u)" = '0' ]; then
    59		_check_config "$@"
    60		DATADIR="$(_get_config 'datadir' "$@")"
    61		mkdir -p "$DATADIR"
    62		chown -R mysql:mysql "$DATADIR"
    63		exec gosu mysql "$BASH_SOURCE" "$@"
    64	fi

    65	if [ "$1" = 'mysqld' -a -z "$wantHelp" ]; then
    66		# still need to check config, container may have started with --user
    67		_check_config "$@"
    68		# Get config
    69		DATADIR="$(_get_config 'datadir' "$@")"

    70		if [ ! -d "$DATADIR/mysql" ]; then
    71			file_env 'MYSQL_ROOT_PASSWORD'
    72			if [ -z "$MYSQL_ROOT_PASSWORD" -a -z "$MYSQL_ALLOW_EMPTY_PASSWORD" -a -z "$MYSQL_RANDOM_ROOT_PASSWORD" ]; then
    73				echo >&2 'error: database is uninitialized and password option is not specified '
    74				echo >&2 '  You need to specify one of MYSQL_ROOT_PASSWORD, MYSQL_ALLOW_EMPTY_PASSWORD and MYSQL_RANDOM_ROOT_PASSWORD'
    75				exit 1
    76			fi

    77			mkdir -p "$DATADIR"

    78			echo 'Initializing database'
    79			"$@" --initialize-insecure
    80			echo 'Database initialized'

    81			if command -v mysql_ssl_rsa_setup > /dev/null && [ ! -e "$DATADIR/server-key.pem" ]; then
    82				# https://github.com/mysql/mysql-server/blob/23032807537d8dd8ee4ec1c4d40f0633cd4e12f9/packaging/deb-in/extra/mysql-systemd-start#L81-L84
    83				echo 'Initializing certificates'
    84				mysql_ssl_rsa_setup --datadir="$DATADIR"
    85				echo 'Certificates initialized'
    86			fi

    87			SOCKET="$(_get_config 'socket' "$@")"
    88			"$@" --skip-networking --socket="${SOCKET}" &
    89			pid="$!"

    90			mysql=( mysql --protocol=socket -uroot -hlocalhost --socket="${SOCKET}" )

    91			for i in {30..0}; do
    92				if echo 'SELECT 1' | "${mysql[@]}" &> /dev/null; then
    93					break
    94				fi
    95				echo 'MySQL init process in progress...'
    96				sleep 1
    97			done
    98			if [ "$i" = 0 ]; then
    99				echo >&2 'MySQL init process failed.'
   100				exit 1
   101			fi

   102			if [ -z "$MYSQL_INITDB_SKIP_TZINFO" ]; then
   103				# sed is for https://bugs.mysql.com/bug.php?id=20545
   104				mysql_tzinfo_to_sql /usr/share/zoneinfo | sed 's/Local time zone must be set--see zic manual page/FCTY/' | "${mysql[@]}" mysql
   105			fi

   106			if [ ! -z "$MYSQL_RANDOM_ROOT_PASSWORD" ]; then
   107				export MYSQL_ROOT_PASSWORD="$(pwgen -1 32)"
   108				echo "GENERATED ROOT PASSWORD: $MYSQL_ROOT_PASSWORD"
   109			fi

   110			rootCreate=
   111			# default root to listen for connections from anywhere
   112			file_env 'MYSQL_ROOT_HOST' '%'
   113			if [ ! -z "$MYSQL_ROOT_HOST" -a "$MYSQL_ROOT_HOST" != 'localhost' ]; then
   114				# no, we don't care if read finds a terminating character in this heredoc
   115				# https://unix.stackexchange.com/questions/265149/why-is-set-o-errexit-breaking-this-read-heredoc-expression/265151#265151
   116				read -r -d '' rootCreate <<-EOSQL || true
   117					CREATE USER 'root'@'${MYSQL_ROOT_HOST}' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}' ;
   118					GRANT ALL ON *.* TO 'root'@'${MYSQL_ROOT_HOST}' WITH GRANT OPTION ;
   119				EOSQL
   120			fi

   121			"${mysql[@]}" <<-EOSQL
   122				-- What's done in this file shouldn't be replicated
   123				--  or products like mysql-fabric won't work
   124				SET @@SESSION.SQL_LOG_BIN=0;

   125				DELETE FROM mysql.user WHERE user NOT IN ('mysql.sys', 'mysqlxsys', 'root') OR host NOT IN ('localhost') ;
   126				SET PASSWORD FOR 'root'@'localhost'=PASSWORD('${MYSQL_ROOT_PASSWORD}') ;
   127				GRANT ALL ON *.* TO 'root'@'localhost' WITH GRANT OPTION ;
   128				${rootCreate}
   129				DROP DATABASE IF EXISTS test ;
   130				FLUSH PRIVILEGES ;
   131			EOSQL

   132			if [ ! -z "$MYSQL_ROOT_PASSWORD" ]; then
   133				mysql+=( -p"${MYSQL_ROOT_PASSWORD}" )
   134			fi

   135			file_env 'MYSQL_DATABASE'
   136			if [ "$MYSQL_DATABASE" ]; then
   137				echo "CREATE DATABASE IF NOT EXISTS \`$MYSQL_DATABASE\` ;" | "${mysql[@]}"
   138				mysql+=( "$MYSQL_DATABASE" )
   139			fi

   140			file_env 'MYSQL_USER'
   141			file_env 'MYSQL_PASSWORD'
   142			if [ "$MYSQL_USER" -a "$MYSQL_PASSWORD" ]; then
   143				echo "CREATE USER '$MYSQL_USER'@'%' IDENTIFIED BY '$MYSQL_PASSWORD' ;" | "${mysql[@]}"

   144				if [ "$MYSQL_DATABASE" ]; then
   145					echo "GRANT ALL ON \`$MYSQL_DATABASE\`.* TO '$MYSQL_USER'@'%' ;" | "${mysql[@]}"
   146				fi

   147				echo 'FLUSH PRIVILEGES ;' | "${mysql[@]}"
   148			fi

   149			echo
   150			for f in /docker-entrypoint-initdb.d/*; do
   151				case "$f" in
   152					*.sh)     echo "$0: running $f"; . "$f" ;;
   153					*.sql)    echo "$0: running $f"; "${mysql[@]}" < "$f"; echo ;;
   154					*.sql.gz) echo "$0: running $f"; gunzip -c "$f" | "${mysql[@]}"; echo ;;
   155					*)        echo "$0: ignoring $f" ;;
   156				esac
   157				echo
   158			done

   159			if [ ! -z "$MYSQL_ONETIME_PASSWORD" ]; then
   160				"${mysql[@]}" <<-EOSQL
   161					ALTER USER 'root'@'%' PASSWORD EXPIRE;
   162				EOSQL
   163			fi
   164			if ! kill -s TERM "$pid" || ! wait "$pid"; then
   165				echo >&2 'MySQL init process failed.'
   166				exit 1
   167			fi

   168			echo
   169			echo 'MySQL init process done. Ready for start up.'
   170			echo
   171		fi
   172	fi

   173	exec "$@"

```
哎呀卧槽，将近两百行，终于滚完了！

好吧，咋们抓重点看。

在第72行的时候，进行了一个判断，判断MYSQL_ROOT_PASSWORD、MYSQL_ALLOW_EMPTY_PASSWORD、MYSQL_RANDOM_ROOT_PASSWORD是否为空，不为空的话就进行Database initialize。

在第135行的时候判断MYSQL_DATABASE是否为空，不为空的话执行echo "CREATE DATABASE IF NOT EXISTS \`$MYSQL_DATABASE\` ;" | "${mysql[@]}"

紧接着在第140-148行进行了一个数据库权限的授予操作。

所以，我们启动mysql容器之后就可以开开心心的去使用了。


数据库容器启动了，接下来就是启动我们的应用容器，并与数据库容器链接。执行`docker run --name web -v Users/yetongxue/Desktop/volumes/docker_test/media:/root/media --link db docker_test:1.2`

**It works!**
现在呢，我们就基本上就把整个的过程走了一遍。

但是呢，我们现在有两个容器，我们就执行了两条启动命令，假如我们有三个四个呢？而且现在流行的微服务架构，很多服务唉……

不要担心，还有docker-compose!

### docker-compose
docker-compose是一个服务编排工具，简化复杂应用的利器，使用yaml语法。

对于yaml这里有个专门针对容器编排的教程[[docker-compose.yml 语法说明](http://www.cnblogs.com/freefei/p/5311294.html)](http://www.cnblogs.com/freefei/p/5311294.html)可以瞅瞅。

好啦，现在针对现在的两个容器，一个应用容器，一个数据库容器，我们来看看这个docker-compose.yml长啥样吧。
```
web:
    image: yetongxue/docker_test:1.2
    links:
      - "db"
    ports:
      - "8100:8000"
    volumes:
      - "${DOCKER_VOLUME_PATH}/docker_test/media:/root/media"
    restart: always

db:
    image: mysql:5.7
    environment:
      TZ: 'Asia/Shanghai'
      MYSQL_ROOT_PASSWORD: qwerasdf
      MYSQL_DATABASE: docker_db
    restart: always
    command: ['mysqld', '--character-set-server=utf8']
    volumes:
      - "${DOCKER_VOLUME_PATH}/docker_test/db:/var/lib/mysql"
```
**docker-compose命令**
* **启动：** docker-compose up (注意需要在docker-compose.yml文件目录下执行)
* **停止：** docker-compose stop
* **还有：** docker-compose start
其他的就自己--help吧。

### 应用的部署
好了，我们在自己的机器上已经大功告成了。是时候放到另外一台机器跑跑看了。

开始的时候就说到，git 有github，docker 有dockerhub。但是呢，这个dockerhub离我们太远了，网速慢。所以我们用国内的阿里云或者网易蜂巢。

我用的是阿里云。

登录》控制台》产品与服务》容器服务》新建镜像》新建镜像仓库。如下图：

![](http://upload-images.jianshu.io/upload_images/1271438-2c32105469704563.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](http://upload-images.jianshu.io/upload_images/1271438-8413a8983fc3c0ee.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](http://upload-images.jianshu.io/upload_images/1271438-ad8c553c588126fa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

创建镜像的时候，你可以设置代码源。我这里选择的是本地仓库。仓库创建好之后，我会获得一个仓库地址，拿到这个地址在本机执行：

`docker tag yetongxue/docker_test:1.2 registry.cn-hangzhou.aliyuncs.com/yetongxue/docker_test:1.2`

之后，`docker push registry.cn-hangzhou.aliyuncs.com/yetongxue/docker_test:1.2`

![](http://upload-images.jianshu.io/upload_images/1271438-bdad3fe7bc6cfc34.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

mysql镜像因为使用的就是网上的公开镜像，所以不用管。

在我们要部署的机器上面，创建好相关将要-v 的数据卷目录。

再将刚刚的docker-compose.yml修改web所使用的镜像就好。

```
web:
    image: registry.cn-hangzhou.aliyuncs.com/yetongxue/docker_test:1.2
    links:
      - "db"
    ports:
      - "8100:8000"
    volumes:
      - "${DOCKER_VOLUME_PATH}/docker_test/media:/root/media"
    restart: always

db:
    image: mysql:5.7
    environment:
      TZ: 'Asia/Shanghai'
      MYSQL_ROOT_PASSWORD: qwerasdf
      MYSQL_DATABASE: docker_db
    restart: always
    command: ['mysqld', '--character-set-server=utf8']
    volumes:
      - "${DOCKER_VOLUME_PATH}/docker_test/db:/var/lib/mysql"
```
见证奇迹的时刻到了，`docker-compose up`

**It works!**

### 写在后面

其实我也是个docker初学者，这个教程算是最近一两个月断断续续学习的一个总结吧。写得比较啰嗦，但我的本意是希望尽可能的把我觉得比较重要的点记录下来。程序员是热爱分享的一群人，作为程序员，我们都有看过别人写的教程。作为一个初学者，教程中任何重要信息的遗漏都有可能给我们造成困惑。所以我在每一处都进行了详细的说明。

希望能够帮到你。

---
我的博客 http://yeli.studio

![微信公众号](http://upload-images.jianshu.io/upload_images/1271438-988671689fcc61df.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)