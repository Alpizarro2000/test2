// Server.js
const cors = require('cors');

var express = require('express');
var app = express();
app.use(cors());
app.use(express.json());

var sql = require("mssql");

// config for your database
var config = {
    user: 'RedStoners',
    password: 'beheadEntitlement47!',
    server: '185.157.245.175', 
    port: 1433,
    database: 'RedStonersDB',
    trustServerCertificate: true
};

app.get('/api/scenes', function (req, res) {
   
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        var statement = "exec uspReturnAllSceneInfo";
        console.log(statement);
        request.query(statement, function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            res.send(recordset.recordset);
            
        });
    });
    
});

app.get('/api/scenes/:scene_id/:scene_date', function (req, res) {
    const sceneId = req.params.scene_id;
    const sceneDate = req.params.scene_date;

    // Check if sceneId is null or undefined
    if (!sceneId) {
        return res.status(400).send('Scene ID is required');
    }

    // connect to your database
    sql.connect(config, function (err) {
        if (err) {
            console.log(err);
            return res.status(500).send('Internal Server Error');
        }

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        var statement = "exec uspReturnSceneContents " + sceneId + ", '" + sceneDate + "'";
        console.log(statement);
        
        request.query(statement, function (err, recordset) {
            if (err) {
                console.log(err);
                return res.status(500).send('Error executing database query');
            }

            // Check if recordset is undefined or null
            if (!recordset) {
                return res.status(404).send('Scene not found');
            }

            // send records as a response
            res.send(recordset.recordset);
        });
    });
});



app.get('/api/dates/:scene_id', function (req, res) {
   
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        var statement = "exec uspReturnAllVersionDates " + req.params.scene_id;
        console.log(statement);
        request.query(statement, function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            res.send(recordset.recordset);
            
        });
    });
    
});

app.get('/api/files', function (req, res) {
   
    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        var statement = "exec uspReturnAllAvailableModels";
        console.log(statement);
        request.query(statement, function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            res.send(recordset.recordset);
            
        });
    });
    
});

app.post('/api/UploadExistingModelChanges', function (req, res) {
    // Extract parameters from request body
    const { model_instance_id, file_modified_url, date_and_time, position, scale, rotation } = req.body;
    // Connect to the database
    sql.connect(config, function (err) {
        if (err) {
            console.log(err);
            return res.status(500).send('Internal Server Error');
        }

        // Execute the stored procedure
        const statement = `
            EXEC uspInsertOrUpdateContentChanges 
            @p_model_instance_id=${model_instance_id}, 
            @p_file_modified_url='${file_modified_url}', 
            @p_date_and_time='${date_and_time}', 
            @p_position='${position}', 
            @p_scale='${scale}', 
            @p_rotation='${rotation}'
        `;
        console.log(statement);

        // Execute the stored procedure
        new sql.Request().query(statement, function (err) {
            if (err) {
                console.log(err);
                return res.status(500).send('Error executing database query');
            }

            // Return success response
            res.send('Content changes inserted or updated successfully');
        });
    });
});



app.post('/api/UploadNewModelChanges', function (req, res) {
    // Extract parameters from request body
    const { scene_id, file_modified_url, date_and_time, position, scale, rotation } = req.body;

    // Connect to the database
    sql.connect(config, function (err, pool) {
        if (err) {
            console.log(err);
            return res.status(500).send('Internal Server Error');
        }

        // Create SQL query string with parameter values
        const statement = `
            EXEC uspInsertNewModelInstanceAndChange 
            @p_scene_id = ${scene_id}, 
            @p_file_modified_url = '${file_modified_url}', 
            @p_date_and_time = '${date_and_time}', 
            @p_position = '${position}', 
            @p_scale = '${scale}', 
            @p_rotation = '${rotation}'
        `;
        console.log(statement);

        // Execute the query
        pool.request().query(statement, function (err, recordset) {
            if (err) {
                console.log(err);
                return res.status(500).send('Error executing database query');
            }

            // Return success response
            res.send(recordset.recordset);
        });
    });
});


app.post('/api/CreateScene/:scene_name', function (req, res) {
    // Extract the scene name from the URL parameters
    const scene_name = req.params.scene_name;

    // Connect to the database
    sql.connect(config, function (err) {
        if (err) {
            console.log(err);
            return res.status(500).send('Internal Server Error');
        }

        // Create Request object
        const request = new sql.Request();

        // Set input parameter for the stored procedure
        request.input('scene_name', sql.NVarChar(255), scene_name);

        // Execute the stored procedure
        request.execute('uspCreateScene', function (err, recordsets) {
            if (err) {
                console.log(err);
                return res.status(500).send('Error executing database query');
            }

            res.send(recordsets.recordset);
        });
    });
});


app.listen(2023, () => console.log("Listening on port "));
