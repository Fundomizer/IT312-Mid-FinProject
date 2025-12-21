# Setting up MongoDB locally

Prerequisites

- [Mongo DB server community edition](https://www.mongodb.com/try/download/community)
- [Mongo DB command line tools: mongodump & mongorestore](https://www.mongodb.com/try/download/terraform-provider)
- [Node.js](https://nodejs.org/en/download)

Make sure to install Mongo DB server. Then install the command line tools.
Ensure that Mongo DB server services are running by going to `services` in your pc and searching for mongo database

Import the copy of the Mongo database to the local mongo database

```
mongorestore --drop --uri="mongodb://localhost:27017" database/
```

NOTE: `--drop` will delete all existing contents of `OrganizationManagementDatabase` before copying the the contents.

If you need to get the latest version of the MongoDB use the following:
```
mongodump --uri="mongodb+srv://testuser:test321@cluster0.lbsrw5e.mongodb.net/" --out=./database
```

Next of download the node packages, run the following:
```
npm install
```

## Credentials for logging in

Admin
1. orgmanager@slu.edu.ph - admin
2. 225938@slu.edu.ph - jollibee
3. fisalia@slu.edu.ph - 123

OSA
1. wazuwski@gmail.com - mike
2. jax@slu.edu.ph - jax
3. osa@slu.edu.ph - jd123
4. vik@slu.edu.ph - victor

ORG
1. seauser@slu.edu.ph - sea
2. 229938@slu.edu.ph - bog123
3. scmuser@slu.edu.ph - scm123

## Connecting to MongoDB hosted in VM

Ensure that `mongod` is installed in the VM. Run it using `sudo systemctl start mongod`
If you want to connect to the MongoDB hosted in the VM using Mongo Compass you can do by doing the following:

1. Make sure that ssh is installed inside the VM
2. Go to new conenction -> ssh and configure:
    - SSH host: Ip address of the vm
    - SSH username: User used in the vm (alyria)
    - Password: password of the user (aly)
3. Make sure that the URL is `mongodb://localhost:27017/` because Compass will create an SSH tunnel that forwards your local connection into the VM, so MongoDB is still reached at 127.0.0.1 inside the VM.

## Virtual machine credentials
Users:

| Username  | Password  |
|---|---|
| alyria  | aly  |