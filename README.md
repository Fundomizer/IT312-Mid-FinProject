# Setting up MongoDB locally

Prerequisites

- Mongo DB server community edition
- Mongo DB command line tools: mongodump & mongorestore

Make sure to install Mongo DB server. Then install the command line tools.
Ensure that Mongo DB server services are running by going to `services` in your pc.

Get the latest copy of the MongoDB:

```
mongodump --uri="mongodb+srv://testuser:test321@cluster0.lbsrw5e.mongodb.net/" --out=./database
```

This will make a copy of `OrganizationManagementDatabase` inside `/database`

Then run the following:

```
mongorestore --drop --uri="mongodb://localhost:27017" database/
```

NOTE: `--drop` will delete all existing contents of `OrganizationManagementDatabase` before copying the the contents

## Connecting to MongoDB hosted in VM

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
