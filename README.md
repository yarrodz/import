#### Configure connection string for mongodb and port inside .env file:

    PORT = 3000
    MONGO_URL = mongodb+srv://yaroslavrodz:rHj14oOORNKfH5NW@cluster0.khhiqlb.mongodb.net/?retryWrites=true&w=majority

#### Install packages:

```
npm i
```

#### Start server:

    npm run start

#### Database dump file

##### Download this file. Open pgAdmin. Create a new database, right-click on it, click on 'Restore' and select the downloaded file.

##### There is postman collection of requests that works with that database

    https://drive.google.com/drive/folders/1I3oaonF8rKZan107Zm-6WwWgKOJExkUG?usp=share_link

#### Postman collection links:

##### There are two links with working request collections for postgresql imports

##### Open Postman, click on Import, choose 'Link' and paste the link

    Postgresql for table provided:
    https://api.postman.com/collections/27480704-ca221d33-7aa8-4e30-800d-1b30330aa049?access_key=PMAT-01H2X2WQ3WFBZF9FRP3V1XTBMG

    Postgresql for customSelect provided:
    https://api.postman.com/collections/27480704-ed077ebc-5a92-4c92-9dcd-05126f2b140f?access_key=PMAT-01H2X30C1EGV7YSJ5B2ASVM6M7

####

#### There are 8 requests:
    There is currently no way to share a socket.io request in Postman, so it cannot be added to a Postman collection. I have tested it using a socket.io request in Postman.
    
    First, we need to connect to the socket.  
    http://localhost:3000/processes
    Next, we need to send a 'join' event including the unitId of the import that has executed or will be executed (646cd1accef0e54e78f8aec0).
    We will receive updated import process data when it changes.
    Screenshot of socket.io request (https://github.com/yarrodz/import/assets/135201284/c510743a-1259-4350-bee8-4ebbc8140270)

     
    connect
    http://localhost:3000/imports/connect
    accepts:
    {
        "unit": "646cd1accef0e54e78f8aec0", - id of unit, can be any mongodb objectid
        "source": "PostgreSQL", - source resource for import
        "database": {
            "config": { - configuration for database
                "host": "localhost",
                "port": "5432",
                "user": "postgres",
                "password": "1111",
                "database": "budget3"
            },
            "table": "operations" - name of table
        },
        "idColumn": "id" - id column name for table
    }
    returns: id of created import(data for import) and information about columns(name and type).

When we retrieve columns from the table, we can then set the fields for the import.

    Setting fields for import
    http://localhost:3000/imports/setFields
    accepts:
    {
        "id": "6489c1da04fb52eb7561b962", - id of import
        "fields": [ - fields for import
            {
                "feature": { - it used for setting id of feature for the record and parsing value for the record
                    "name": "name",
                    "type": "text",
                    "_id": "64835bd65cafe862fc0d323a"
                },
                "source": "name" - it is a column from where we receive value for record 
            },
            {
                "feature": {
                    "name": "date",
                    "type": "date",
                    "_id": "64835bd65cafe862fc0d323b"
                },
                "source": "created_at"
            }
        ]
    }
    returns: "Fields for import are set"

Once we've configured the fields for importing, we can start the import.

    start
    http://localhost:3000/imports/start
    accepts:
    {
        "id": "648361be35867ac7d6141bec", - id of import
    }
    returns: "Import complete or paused by user"

It generates an import process that stores information about the execution of the import process which can be observed in the 'importprocesses' table or socket.io request. During import, the properties 'processedDatasetsCount' and 'transferredDatasetsCount' increase their values. The import process has a status that can be 'Pending', 'Paused', 'Complete' or 'Failed'. The result of the import process is transferred datasets and records which can be viewed in the tables. In case any error occurs during import, there are limited attempts(5) that will retry to reload the import every period of time(5 seconds). Once all attempts have been exhausted, the process status will be set to "Failed", and an error message will be set.

    pause
    http://localhost:3000/imports/pause
    accepts:
    {
        "processId": "648361be35867ac7d6141bec", -- id of process
    }
    returns "Import paused by user"

We can pause an import. The status of the import process will change to "Paused", and import execution will stop.

    reload
    http://localhost:3000/imports/reload
    accepts:
    {
        "processId": "648361be35867ac7d6141bec", -- id of process
    }
    returns: "Import complete or paused by user"

We can reload that import. We have to pass the id of the paused process. The process status will be changed to 'Pending' and import will be reloaded from the point it paused.

    retry
    http://localhost:3000/imports/retry
    accepts:
    {
        "processId": "648361be35867ac7d6141bec", -- id of process
    }
    returns: "Import complete or paused by user"

We can create a situation where the password or table name in the database configuration is invalid by editing the import statement for the table. Then import process will be failed.

Then we can modify them to their correct values and send a retry request. This will reset the attempts and error message, and start the import from the point it failed.

    imports
    http://localhost:3000/imports/646cd1accef0e54e78f8aec0
    accepts:
    param /:unitId
    returns: "List of imports by unitId"

.

    processes
    http://localhost:3000/imports/processes/646cd1accef0e54e78f8aec0
    accepts:
    param /:unitId
    returns: "List of import processes by unitId"

###

