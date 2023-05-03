####################################################################################
ARG UBUNTU_VERSION=20.04
ARG NODE_VERSION=18.12
###
ARG USER=frontend
ARG USER_UID=1000
ARG USER_GID=100
###
ARG HOME=/home/${USER}
ARG WORK=${HOME}/workspace
ARG TOOLS=${HOME}/tools
###
ARG BUILDARCH=x86_64
###
ARG TEMPDir=/container.tmp

####################################################################################

FROM ubuntu:${UBUNTU_VERSION} as system_deps
ARG TEMPDir
ENV DEBIAN_FRONTEND=nonintercative
WORKDIR ${TEMPDir}

# Allow ubuntu to cache package downloads
RUN rm -f /etc/apt/apt.conf.d/docker-clean; echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache
# development dependencies
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked,id=var.cache.apt \
    --mount=type=cache,target=/var/lib/apt,sharing=locked,id=var.lib.apt \
    apt-get update -y && apt-get install  -y \
    curl \
    xz-utils \
    automake \
    build-essential \
    g++\
    git \
    jq \
    # libicu-dev \
    # libffi-dev \
    # libgmp-dev \
    # libncursesw5 \
    # libpq-dev \
    # libssl-dev \
    # libsystemd-dev \
    # libtinfo-dev \
    # libtool \
    make \
    pkg-config \
    tmux \
    wget \
    # zlib1g-dev libreadline-dev llvm libnuma-dev \
    software-properties-common \
    sudo \
    vim \
    apt-file \ 
    # liblzma-dev \
    lsof \
    grep \
    coreutils && \
    add-apt-repository ppa:rmescandon/yq -y && apt update && apt-get install -y \
    yq 


    #pv #para ver el progreso de los comandos

RUN sed -i '/Binary::apt::APT::Keep-Downloaded-Packages "true";/d' /etc/apt/apt.conf.d/keep-cache && \
    rm -rf /var/lib/apt/lists/*

####################################################################################

FROM system_deps as system_deps_with_user
ARG USER
ARG USER_UID
ARG USER_GID
ARG HOME
ARG WORK
ARG TOOLS
ARG SCRIPTS
ARG PLUTUS_APPS_ROOT
ENV USER=${USER}
ENV USER_UID=${USER_UID}
ENV USER_GID=${USER_GID}
ENV HOME=${HOME}
ENV WORK=${WORK}
ENV TOOLS=${TOOLS}
ENV SCRIPTS=${SCRIPTS}
ENV PLUTUS_APPS_ROOT=${PLUTUS_APPS_ROOT}
#  groupadd -g ${USER_GID} users && \ 
RUN useradd -u ${USER_UID} -g ${USER_GID}  -ms /bin/bash ${USER} && \ 
    echo "${USER} ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
RUN chown ${USER} -hR ${TEMPDir}
USER ${USER}

####################################################################################

FROM system_deps_with_user as nodejs
ARG NODE_VERSION
ENV NODE_VERSION=${NODE_VERSION}
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
ENV NVM_DIR=${HOME}/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="${USER}/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
# RUN node --version
# RUN npm --version

####################################################################################

FROM nodejs as system_deps_final

USER root
# delete TEMPDir folder
RUN rm -rf ${TEMPDir}

USER ${USER} 
WORKDIR ${WORK}


####################################################################################
