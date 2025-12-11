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

NOTE: `--drop` will delete all existing contents of `OrganizationManagementDatabase` before copying the the contents

Next of download the node packages, run the following:
```
npm install
```
