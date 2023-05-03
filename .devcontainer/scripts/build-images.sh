#!/bin/bash

docker run -d -p 5000:5000 --name registry registry:2.7 # inicio un container con un registro local para mis imagenes
docker container start -i registry

docker build --pull --rm -f ".devcontainer/createImage/system_deps/Dockerfile" -t localhost:5000/manupadilla/system_deps  ".devcontainer/createImage/system_deps/Dockerfile"
# Agrego la imagen a mi registro local
# docker logs -f registry # view logs
# docker tag manupadilla/system_dep localhost:5000/manupadilla/system_dep # como puse en el nombre ya toda la ruta, parece que funciona bien... si no deberia poner aqui el localhost:5000/ pero este camino de usar docker tag no me funciono

docker push localhost:5000/manupadilla/system_deps # subo la imagen al registro local

# testear si funciona, abrir terminal en container con esa imagen:
# docker run -it -d --name system_deps_container localhost:5000/manupadilla/system_deps # crea un container a partir de la imagen
# docker stop system_deps_container
# docker start system_deps_container
# docker container start -i system_deps_container # abre una terminar en el container


docker build --pull --rm -f ".devcontainer/createImage/system_deps_manu/Dockerfile" -t localhost:5000/manupadilla/system_deps_manu  ".devcontainer/createImage/system_deps_manu/Dockerfile"
docker build --pull --rm  -f ".devcontainer/createImage/system_deps_manu_nix_shell/Dockerfile" -t localhost:5000/manupadilla/system_deps_manu_nix_shell ".devcontainer/createImage/system_deps_manu_nix_shell/Dockerfile"


docker build --pull --rm -f ".devcontainer/createImage/system_deps_manu2/Dockerfile" -t localhost:5000/manupadilla/system_deps_manu2  ".devcontainer/createImage/system_deps_manu2/Dockerfile"
docker run -it -d --name system_deps_manu2_container localhost:5000/manupadilla/system_deps_manu2 # crea un container a partir de la imagen
docker container start -i system_deps_manu2_container 

docker build --pull --rm -f ".devcontainer/createImage/system_deps_manu-v120/Dockerfile" -t localhost:5000/manupadilla/system_deps_manu-v120  ".devcontainer/createImage/system_deps_manu-v120/Dockerfile"
docker run -it -d --name system_deps_manu-v120_container localhost:5000/manupadilla/system_deps_manu-v120 # crea un container a partir de la imagen
docker container start -i system_deps_manu-v120_container 


docker build --pull --rm -f ".devcontainer/createImage/ubuntu_full/Dockerfile" -t localhost:5000/manupadilla/ubuntu_full  ".devcontainer/createImage/ubuntu_full/Dockerfile"
docker run -it -d --name ubuntu_full_container localhost:5000/manupadilla/ubuntu_full # crea un container a partir de la imagen
docker container start -i ubuntu_full_container

docker build --pull --rm --progress=plain -f ".devcontainer/createImage/ubuntu_full_with_f8/Dockerfile" -t localhost:5000/manupadilla/ubuntu_full_with_f8:2  ".devcontainer/createImage/ubuntu_full_with_f8/Dockerfile"
docker run -it -d --name ubuntu_full_with_f8_container localhost:5000/manupadilla/ubuntu_full_with_f8:1 # crea un container a partir de la imagen
docker container start -i ubuntu_full_with_f8_container

docker build --pull --rm --progress=plain -f ".devcontainer/createImage/ubuntu_full_with_v110/Dockerfile" -t localhost:5000/manupadilla/ubuntu_full_with_v110:3  ".devcontainer/createImage/ubuntu_full_with_v110/Dockerfile"
docker run -it -d --name ubuntu_full_with_v110_container localhost:5000/manupadilla/ubuntu_full_with_v110 # crea un container a partir de la imagen
docker container start -i ubuntu_full_with_v110_container



docker build --pull --rm --progress=plain -f ".devcontainer/createImage/ubuntu_full_with_v120/Dockerfile" -t localhost:5000/manupadilla/ubuntu_full_with_v120:2  ".devcontainer/createImage/ubuntu_full_with_v120/Dockerfile"
docker run -it -d --name ubuntu_full_with_v120_container localhost:5000/manupadilla/ubuntu_full_with_v120 # crea un container a partir de la imagen
docker container start -i ubuntu_full_with_v120_container


docker build --pull --rm --progress=plain -f ".devcontainer/createImage/ubuntu_full_with_f8_v110_v120/Dockerfile" -t localhost:5000/manupadilla/ubuntu_full_with_f8_v110_v120:2  ".devcontainer/createImage/ubuntu_full_with_f8_v110_v120/Dockerfile"
docker run -it -d --name ubuntu_full_with_f8_v110_container localhost:5000/manupadilla/ubuntu_full_with_f8_v110 # crea un container a partir de la imagen
docker container start -i ubuntu_full_with_f8_v110_container


docker build --pull --rm --progress=plain -f ".devcontainer/createImage/ubuntu_full_with_f8_v110_v120/Dockerfile" -t localhost:5000/manupadilla/ubuntu_full_with_f8_v110_v120:4  ".devcontainer/createImage/ubuntu_full_with_f8_v110_v120/Dockerfile"
docker run -it -d --name ubuntu_full_with_f8_v110_container localhost:5000/manupadilla/ubuntu_full_with_f8_v110 # crea un container a partir de la imagen
docker container start -i ubuntu_full_with_f8_v110_container

docker build --pull --rm --progress=plain -f ".devcontainer/createImage/ubuntu_full_with_f8_v110_v120/Dockerfile" -t localhost:5000/manupadilla/ubuntu_full_with_f8_v110_v120:8  ".devcontainer/createImage/ubuntu_full_with_f8_v110_v120/Dockerfile"
docker run -it -d --name ubuntu_full_with_f8_v110_container localhost:5000/manupadilla/ubuntu_full_with_f8_v110 # crea un container a partir de la imagen
docker container start -i ubuntu_full_with_f8_v110_container

docker build --progress=plain  --pull --rm  -f ".devcontainer/createImage/ubuntu_full_with_f8_v110_v120_new/Dockerfile" \
    -t manupadilla/ubuntu_full_with_f8_v110_v120_new:1.24  ".devcontainer/createImage/ubuntu_full_with_f8_v110_v120_new/Dockerfile"
docker run -it -d --name ubuntu_full_with_f8_v110_v120_new_container24 manupadilla/ubuntu_full_with_f8_v110_v120_new:1.24 # crea un container a partir de la imagen
docker container start -i ubuntu_full_with_f8_v110_v120_new_container24

docker build --target=system_deps_nix_with_plutus_apps_f8 --progress=plain  --pull --rm  \
       -t manupadilla/ubuntu_full_with_f8FULL_v110_v120:1.0  ".devcontainer/createImage/ubuntu_full_with_f8_v110_v120/Dockerfile"


#OPTIMA FORMA DE LLAMAR AL BUILD

docker build --progress=plain --target=system_deps_nix_with_plutus_apps_f8 --pull --rm  \
    -t manupadilla/ubuntu_full_with_f8builded_v110_v120:1.1  ".devcontainer/ubuntu_full_with_f8_v110_v120"

docker build --progress=plain --target=system_deps_nix_with_plutus_apps_v110 --pull --rm  \
    -t manupadilla/ubuntu_full_with_f8_v110builded_v120:1.1  ".devcontainer/ubuntu_full_with_f8_v110_v120"

docker build --progress=plain --target=system_deps_nix_with_plutus_apps_v120 --pull --rm  \
    -t manupadilla/ubuntu_full_with_f8_v110_v120builded:1.1  ".devcontainer/ubuntu_full_with_f8_v110_v120"

sudo docker build --progress=plain --target=system_deps_nix_with_plutus_apps_f8 --pull --rm \
     -t manupadilla/ubuntu_full_with_f8builded_v110_v120:1.0a  ".devcontainer/ubuntu_full_with_f8_v110_v120"

sudo docker build --progress=plain --pull --rm \
     -t manupadilla/ubuntu_full_with_f8_v110_v120:1.27 ".devcontainer/ubuntu_full_with_f8_v110_v120"

sudo docker build  --pull --rm  -t manupadilla/ubuntu_full_with_f8_v110_v120:1.27 ".devcontainer/ubuntu_full_with_f8_v110_v120" 

docker run -it -d --name temp_1 manupadilla/ubuntu_full_with_f8_v110_v120:1.27 # crea un container a partir de la imagen
docker container start -i temp_1




9273b6fbe7acbc40d46b9e7882d7da13c94639628092b8f26a1cea9059d82d2d

docker container start -i qqqq

# --progress=plain

#####

docker build --pull --rm  -f ".devcontainer/createImage/ubuntu_and_nix/Dockerfile" -t localhost:5000/manupadilla/ubuntu_and_nix ".devcontainer/createImage/ubuntu_and_nix/Dockerfile"
docker run -it -d --name ubuntu_and_nix_container localhost:5000/manupadilla/ubuntu_and_nix # crea un container a partir de la imagen
docker container start -i ubuntu_and_nix_container 


docker image inspect localhost:5000/manupadilla/ubuntu_and_nix
docker history  localhost:5000/manupadilla/ubuntu_and_nix

wget https://github.com/wagoodman/dive/releases/download/v0.9.2/dive_0.9.2_linux_amd64.deb
sudo apt install ./dive_0.9.2_linux_amd64.deb

dive localhost:5000/manupadilla/ubuntu_and_nix

dive  docker.io/inputoutput/plutus-starter-devcontainer:v1.0.0
####


docker build --pull --rm  -f ".devcontainer/createImage/ubuntu_and_nix/Dockerfile" -t localhost:5000/manupadilla/ubuntu_nix_and_plutus ".devcontainer/createImage/ubuntu_and_nix/Dockerfile"
docker run -it -d --name ubuntu_and_nix_container localhost:5000/manupadilla/ubuntu_and_nix # crea un container a partir de la imagen
docker container start -i ubuntu_and_nix_container 



