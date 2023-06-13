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

##### There are two links with working request collections for postgresql and api import

##### Open Postman, click on Import, choose 'Link' and paste the link

    Postgresql:
    https://api.postman.com/collections/14672581-7a1c6a69-f792-474c-8a71-e8a1869e2505?access_key=PMAT-01H2GMPPA7P8650BK3G1P17S76

    Api:
    https://api.postman.com/collections/14672581-11f4b0aa-aa80-4e68-a5a6-3344a0d573b4?access_key=PMAT-01H2GMNK88K19CY8DJB5TJWHBE

####

#### There are 5 requests:

    connect
    http://localhost:3000/imports/connect
    accepts:
    {
        "unit": "64835bd65cafe862fc0d323a", --we can pass any mongodb OjectId
        "source": "API", -- "API" or "PostgreSQL"
        "api": {  -- api config, postgresql config stored in the postgresql collection of requests
        "config": { -- that will be passed to axios function
            "method": "get",
            "url": "https://api.publicapis.org/entries"
        },
        "path": "data.entries" -- Response contains a lot of data. We need to specify the path to the data that will be imported.
        },
        "idColumn": "Link" -- id column for imported data
    }
    returns: id of created import(data for import) and information about columns(name and type).

We connect to the resource and receive information about the columns.

    Setting fields for import
    http://localhost:3000/imports/setFields
    accepts:
    {
        "id": "648361be35867ac7d6141bec", -- id of import
        "fields": [ -- fields that will be imported
            {
                "feature": {  -- feature for record
                    "name": "name",
                    "type": "text",
                    "id": "64835bd65cafe862fc0d323a"
                },
                "source": "Description" -- column from where will be imported value for record
            }
        ]
    }
    returns: "ok"

.

    start
    http://localhost:3000/imports/start
    accepts:
    {
        "id": "648361be35867ac7d6141bec", -- id of created import
    }
    returns: "ok"

It generates an import process that stores information about the execution of the import. We can observe the importing process within the 'importprocesses' table. We can see that the number of data in the 'datasets' table increases after we refresh it. At the end of the import, process status will be changed to 'Completed'.

    pause
    http://localhost:3000/imports/pause
    accepts:
    {
        "processId": "648361be35867ac7d6141bec", -- id of process
    }
    returns "ok"

When we started an import, we can observe the importing process within the 'importprocesses' table. During the import, the import process status equals to 'Pending'. After refreshing the table, we will notice an increase in the values of 'processedDatasetsCount' and 'transferrdDatasetsCount'. When we send a pause request, the import process will be stopped and the process status will be changed to 'Paused' and the numbers for 'processedDatasetsCount' and 'transferredDatasetsCount' will stop increasing too.

    reload
    http://localhost:3000/imports/reload
    accepts:
    {
        "processId": "648361be35867ac7d6141bec", -- id of process
    }
    returns: "ok"

We can reload that import. We have to pass the id of the paused process. The process status will be changed to 'Pending', and the 'processedDatasetsCount' and 'transferredDatasetsCount' properties values will start increasing too.

    retry
    http://localhost:3000/imports/retry
    accepts:
    {
        "processId": "648361be35867ac7d6141bec", -- id of process
    }
    returns: "ok"

When something goes wrong during import, there are limited attempts(5) that will retry to reload the import every period of time(5 seconds). When all attempts have been wasted, the process status is set to "Failed" and an error message is set too. Then if we want to retry this import we can send this request. Attempts will be reseted.

We can create a situation where the password in the database config is invalid or the api url is wrong by modifying them in the 'imports' table and than send start request. Import will be failed.

And than we can modify them back to their correct values and then send a retry request.

###

##### Be careful not to confuse the id of the import with the id of the process. There are currently no checks for this, so if you make a mistake, you have to restart the server.
