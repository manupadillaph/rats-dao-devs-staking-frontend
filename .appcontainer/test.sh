
docker run -d -it --name rats-conteiner -p 3000:3000 -p 3080:3080  --env-file .env.local.copy manupadilla/rats-staking-git:7fbbf6c694accae271cf5c3c94703195fae7132b bash ./start-server.sh
