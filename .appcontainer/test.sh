
docker run -d -it --name rats-conteiner -p 3000:3000 -p 3080:3080  --env-file .env.copy.local manupadilla/rats-staking-git:5fb97719e4799bd4e07c794472b706eff4e32d1e bash ./start-server.sh
