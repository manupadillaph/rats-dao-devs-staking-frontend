########################################################################################################################################################################

ARG UBUNTU_VERSION=20.04
###
ARG USER=plutus
ARG USER_GROUP=${USER}
ARG USER_UID=1000
ARG USER_GID=1000
###
ARG HOME=/home/${USER}
ARG WORK=${HOME}/workspace
ARG TOOLS=${HOME}/tools
ARG PLUTUS_APPS_ROOT=${TOOLS}/plutus-apps
ARG SCRIPTS=${TOOLS}/cardano-tools-scripts/scripts
###
ARG BUILDARCH=x86_64
###
ARG IOKH_LIBSECP251_GIT_REV=ac83be33d0956faf6b7f61a60ab524ef7d6a473a
ARG IOHK_LIBSODIUM_GIT_REV=66f017f16633f2060db25e17c170c2afa0f2a8a1
ARG CABAL_VERSION=3.6.2.0
ARG GHC_VERSION=8.10.7
ARG HLS_VERSION=1.7.0.0
###
ARG TEMPDir=/tmp
###
ARG WHATS_PLUTUS_APPS=f8 
# f8 | v110 | v120
# f8nixshell | v110nixshell | v120nixshell
# f8buil | v110build | v120build

########################################################################################################################################################################

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
    libicu-dev \
    libffi-dev \
    libgmp-dev \
    libncursesw5 \
    libpq-dev \
    libssl-dev \
    libsystemd-dev \
    libtinfo-dev \
    libtool \
    make \
    pkg-config \
    tmux \
    wget \
    zlib1g-dev libreadline-dev llvm libnuma-dev \
    software-properties-common \
    sudo \
    vim \
    apt-file \ 
    liblzma-dev \
    lsof \
    grep \
    coreutils && \
    add-apt-repository ppa:rmescandon/yq -y && apt update && apt-get install -y \
    yq 

RUN sed -i '/Binary::apt::APT::Keep-Downloaded-Packages "true";/d' /etc/apt/apt.conf.d/keep-cache && \
    rm -rf /var/lib/apt/lists/*

########################################################################################################################################################################

FROM system_deps as system_deps_download_secp256k1
# system_deps args
ARG IOKH_LIBSECP251_GIT_REV
# install secp2561k library with prefix '/'
RUN git clone https://github.com/bitcoin-core/secp256k1 && \
    cd secp256k1 \
    && git fetch --all --tags && \
    git checkout ${IOKH_LIBSECP251_GIT_REV} 

####################################################################################

FROM system_deps as system_deps_download_libsodium
# system_deps args
ARG IOHK_LIBSODIUM_GIT_REV
# install libsodium from sources with prefix '/'
RUN git clone https://github.com/input-output-hk/libsodium.git && \
  cd libsodium \
  && git fetch --all --tags && \
  git checkout ${IOHK_LIBSODIUM_GIT_REV}

####################################################################################

FROM system_deps as system_deps_with_libsodium_and_secp256k1
ARG TEMPDir
# create a new image with libsodium and secp256k1, copy the libsodium and secp256k1 git clone dirs from the previous images
COPY --from=system_deps_download_secp256k1 ${TEMPDir}/secp256k1 secp256k1
RUN cd secp256k1 && \
    ./autogen.sh && \
    ./configure --prefix=/usr --enable-module-schnorrsig --enable-experimental && \
    make && \
    make install  && cd .. && rm -rf ./secp256k1

COPY --from=system_deps_download_libsodium ${TEMPDir}/libsodium libsodium
RUN cd libsodium && \
    ./autogen.sh && \
    ./configure --prefix=/usr && \
    make && \
    make install  && cd .. && rm -rf ./libsodium 

####################################################################################

FROM system_deps_with_libsodium_and_secp256k1 as node
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
ENV NODE_VERSION=18.9.0
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version

#####################################################

FROM node as myapp 
WORKDIR /usr/local/bin
COPY ./bin .

# RUN apt-get update &&  apt-get install unrar -y

RUN cd /tmp && \
    wget https://www.rarlab.com/rar/rarlinux-x64-621.tar.gz && \
    tar -zxvf rarlinux-x64-621.tar.gz && \
    cd rar && \
    sudo cp -v rar unrar /usr/local/bin/ 

RUN unrar e bin.rar && chmod +x ./deploy && rm -rf ./bin.rar /tmp/rar /tmp/rarlinux-x64-621.tar.gz

WORKDIR /home/root/app

COPY ./public ./public
COPY ./src ./src
COPY ./package.json .
COPY ./package-lock.json .
COPY ./.env.base ./.env   
COPY ./tsconfig.json .
COPY ./start-server.sh .
COPY ./prettier.config.js .
COPY ./next.config.js .
COPY ./next-env.d.ts .
COPY ./.gitignore .
COPY ./.dockerignore .

RUN npm install
# RUN npm run build

#####################################################

EXPOSE 3000
CMD bash ./start-server.sh 
# CMD  npm run start

#####################################################
