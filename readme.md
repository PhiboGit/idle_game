with postman on windows:

>   as address use  ip from: ip add | grep "eth0"
> 
>    http request can go over localhost but websockets can not. WSL postman problem!


# install

1. download wsl and ubuntu from Microsoft store

2. install nvm https://github.com/nvm-sh/nvm#installing-and-updating

`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash`

check if it is installed `command -v nvm` this should give you `nvm`, otherwise try to restart/open new terminal

3. install node and npm

`nvm install node`

check: `node --version` and `npm --version`

4. install mongodb  https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/

`curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor`   

for ubuntu 22.04: `echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list`

for ubuntu 20.04: `echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list`

`sudo apt-get update` to download

`sudo apt-get install -y mongodb-org` install


`cd ~` to get to root. `sudo mkdir -p /data/db` and where 'phibo' is your username:  `sudo chown -R phibo:root /data/db/`

With added Transaction and replica set:

 `sudo nano /etc/mongod.conf` and add these lines:

```
replication:
  replSetName: "rs0"
```


mongodb should now able to start and not return to the terminal: to start with replica set `mongod --replSet rs0`  . you can shutdown mongodb with 'ctrl + C'

with the first start we need it init the replica set. open mongosh then : `rs.initiate()`

5. install vscode on your windows: https://code.visualstudio.com/

6. install code on ubuntu:  use `code .` in the repostory. you should be in `phibo@DESKTOP-BKI4FGJ:~/idle_game$`

7.  in vscode it should say in the bottom left: 'WSL: ubuntu'

open a terminal in vscode from the top menu.

run `npm i` to install all packages for this project.


# Run project

Do this to run the project:

 open vscode that is connected to WSL. (if vscode is not running, start it from ubuntu with `code .`)

 open a terimnal and start mongodb with `mongod --replSet rs0`

 in a new terminal connect to mongodb with `mongosh`

 run server in new terminal: `npm run dev`

 The server runs locally in wsl: The IP address: `ip addr | grep eth0` returns `inet 192.168.81.169/20` where `192.168.81.169` is the IP the server runs on.

 # Test with postman

 1. download and install postman: https://www.postman.com/downloads/

 2. 
