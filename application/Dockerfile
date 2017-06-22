# Copyright 2013 Thatcher Peskens
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

FROM ubuntu:16.04

MAINTAINER yetongxue

# Local directory with project source
ENV DOCKER_SRC=mysite
# Directory in container for all project files
ENV DOCKER_HOME=/root
# Directory in container for project source files
ENV DOCKER_PROJECT=/root/project

# Create application subdirectories
WORKDIR $DOCKER_HOME
RUN mkdir media static logs
VOLUME ["$DOCKER_HOME/media/", "$DOCKER_HOME/logs/"]


# Install required packages and remove the apt packages cache when done.

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y \
	git \
	python \
	python-dev \
	python-setuptools \
	python-pip \
	nginx \
	supervisor && \
	pip install -U pip setuptools && \
  	rm -rf /var/lib/apt/lists/*

# install uwsgi now because it takes a little while
RUN pip install uwsgi

# setup all the configfiles
RUN echo "daemon off;" >> /etc/nginx/nginx.conf
COPY mysite_nginx.conf /etc/nginx/sites-available/default
COPY supervisor-app.conf /etc/supervisor/conf.d/

# COPY requirements.txt and RUN pip install BEFORE adding the rest of your code, this will cause Docker's caching mechanism
# to prevent re-installinig (all your) dependencies when you made a change a line or two in your app.

COPY . $DOCKER_PROJECT
RUN pip install -r requirement.txt


EXPOSE 8000
CMD ["supervisord", "-n"]

# Copy entrypoint script into the image
ENTRYPOINT ["entry_point.sh"]
