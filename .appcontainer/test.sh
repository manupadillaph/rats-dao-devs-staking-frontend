
docker run -d -it --name rats-conteiner -p 3000:3000 -p 3080:3080  manupadilla/rats-staking-git:ea27ca419ee82341b0549b5c6590ad2d665198d3 bash ./start-server.sh
 --env-file .env.local.copy 