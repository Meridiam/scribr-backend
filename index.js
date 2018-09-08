var express = require('express');
var request = require('request');
var {Storage} = require('@google-cloud/storage');
var {Speech} = require('@google-cloud/speech');
var multer = require('multer');
var fs = require('fs');

var mongoose = require('mongoose');
var db_url = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
mongoose.connect(db_url);

var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();

var OpenPractice = require('./models/OpenPractice');

app.use(cors({credentials: true, origin: true}));

app.use(bodyParser.json());

var upload = multer({dest: __dirname + '/'});
var type = upload.any();
var bucketName = 'scribr-215805.appspot.com';

app.post('/transcribe', function (req, res) {
    var storage = new Storage({
        keyFilename: __dirname + '/config/scribr-215805-da49aa87d062.json'
    });

    console.log(req.files);

    //fs.writeFileSync('audio.opus', req.file);

    storage
        .bucket(bucketName)
        .upload(__dirname + '/audio.opus')
        .then(() => {
            console.log(`audio.opus uploaded to ${bucketName}.`);
            fs.unlink(__dirname + '/audio.opus', function(err) {
                if(err && err.code == 'ENOENT') {
                    // file doens't exist
                    console.info("File doesn't exist, won't remove it.");
                } else if (err) {
                    // other errors, e.g. maybe we don't have enough permission
                    console.error("Error occurred while trying to remove file");
                } else {
                    console.info(`removed`);
                }
            });
            res.send('');
        })
        .catch(err => {
            console.error('ERROR:', err);
            res.send('');
        });
});

app.get('/updateroster', function (req, res) {
    var names = [];
    request(url, function(error, response, body) {
        if (error) {
            res.send(error);
        }
        if (!error && response.statusCode == 200) {
            const members = JSON.parse(body)["data"];
            for (var i = 0; i < members.length; i++) {
                var firstname = members[i]["firstName"].charAt(0).toUpperCase() + members[i]["firstName"].substring(1).toLowerCase();
                var lastname = members[i]["lastName"].charAt(0).toUpperCase() + members[i]["lastName"].substring(1).toLowerCase();
                if (members[i]["waiver"] != false) {names.push(firstname+" "+lastname);}
            }
            names[names.indexOf("Huayang Peng")] = "Jerry Peng";
            Roster.findOneAndUpdate({ "id": "permroster" },
            {$set: {'roster': names}},
            {upsert: true, new: true},
            function (err, roster) {
                if (err) {
                    console.log(err);
                }
                res.json(roster);
            });
        }
    });
});

app.post('/getdata', function (req, res) {
    var roster;
    var registered;
    var currDate = new Date();
    Roster.findOne({ 'id': "permroster" },
        function (err, roster) {
            if (err) {
                console.log(err);
            } else {
            Practice.findOne({'date': req.body.date},
                function (err, practice) {
                    if (practice == null) {
                        res.json({roster: roster["roster"], registered: ""});
                    } else {
                        res.json({roster: roster["roster"], registered: practice.registered})
                    }
                });
            }
        });
});

app.post('/signin', function (req, res) {
    Practice.findOne({'date': req.body.date},
        function (err, practice) {
            if (err) {
                console.log(err);
            }
                Practice.findOneAndUpdate({'date': req.body.date},
                    {$addToSet: {'registered': req.body.name}},
                    {upsert: true, new: true},
                    function (err, practice) {
                        if (err) {
                            console.log(err);
                        }
                        console.log(practice);
                        console.log(req.body.date);
                        console.log(req.body.name);
                        res.json({registered: practice["registered"]});
                    });
        });
})

app.post('/signout', function (req, res) {
    var reg = [];
    Practice.findOne({'date': req.body.date},
        function (err, practice) {
            if (err) {
                console.log(err);
            }
            if (practice["registered"].filter(e => e != req.body.name) != null) {
                reg = practice["registered"].filter(e => e != req.body.name);
            }
            Practice.findOneAndUpdate({'date': req.body.date},
                {$set: {'registered': reg}},
                {upsert: true, new: true},
                function (err, practice) {
                    if (err) {
                        console.log(err);
                    }
                    res.json({registered: practice["registered"]});
                });
        });
});

app.get('/getstats', function (req, res) {
    Practice.find({}, function (err, practiceArr) {
        res.json({practices: practiceArr.slice(-6)});
    });
});

app.get('/opensignin', function (req, res) {
    OpenPractice.findOneAndUpdate({'date': '4/24/2018'},
        {$inc: {'attendance': 1}},
        {upsert: true, new: true},
        function (err, practice) {
            if (err) {
                console.log(err);
            }
            res.json({attendance: practice["attendance"]});
        });
});

app.get('/opensignout', function (req, res) {
    OpenPractice.findOneAndUpdate({'date': '4/24/2018'},
        {$inc: {'attendance': -1}},
        {upsert: true, new: true},
        function (err, practice) {
            if (err) {
                console.log(err);
            }
            res.json({attendance: practice["attendance"]});
        });
});

var port = process.env.PORT || 3000; 
app.listen(port);
console.log("listening on " + port + "!");