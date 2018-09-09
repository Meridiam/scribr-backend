var express = require('express');
var request = require('request');
var {Storage} = require('@google-cloud/storage');
var speech = require('@google-cloud/speech');
var multer = require('multer');
var fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');

var mongoose = require('mongoose');
var db_url = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
mongoose.connect(db_url);
//Load Models
var Visit = require('./models/visit.js');
var Patient = require('./models/patient.js');

var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();

var OpenPractice = require('./models/OpenPractice');

app.use(cors({credentials: true, origin: true}));

app.use(bodyParser.json());

var upload = multer({dest: './'});
var type = upload.single('audio');
var bucketName = 'scribr-215805.appspot.com';

app.post('/transcribe', type, function (req, res) {
    var storage = new Storage({
        keyFilename: __dirname + '/config/scribr-215805-da49aa87d062.json'
    });

    var scribeClient = new speech.SpeechClient({
        keyFilename: __dirname + '/config/Scribr-5d71f1093107.json'
    })

    ffmpeg(`./${req.file.filename}`)
    .output('output.raw')
    .audioChannels(1)
    .audioBitrate(48000)
    .format('s16le')
    .audioCodec('pcm_s16le')
    .on('end', () => {
        const gcsUri = `gs://${bucketName}/output.raw`;
        const encoding = 'LINEAR16';
        const sampleRateHertz = 48000;
        const languageCode = 'en-US';
    
        const config = {
            encoding: encoding,
            sampleRateHertz: sampleRateHertz,
            languageCode: languageCode,
        };
      
        const audio = {
            uri: gcsUri,
        };
      
        const request = {
            config: config,
            audio: audio,
        };
    
        console.log(req.file);
    
        //fs.writeFileSync('audio.opus', req.file);
    
        storage
            .bucket(bucketName)
            .upload(`./output.raw`, {resumable: false})
            .then(() => {
                console.log(`output.raw uploaded to ${bucketName}.`);
                fs.unlink(`./${req.file.filename}`, function(err) {
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
    
                fs.unlink(`./output.raw`, function(err) {
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
    
                scribeClient
                    .longRunningRecognize(request)
                    .then(data => {
                        const operation = data[0];
                        // Get a Promise representation of the final result of the job
                        return operation.promise();
                    })
                    .then(data => {
                        const response = data[0];
                        const transcription = response.results
                            .map(result => result.alternatives[0].transcript)
                            .join('\n');
                        console.log(`Transcription: ${transcription}`);
                        res.json({transcript: transcription});
                    })
                    .catch(err => {
                        console.error('ERROR:', err);
                        res.send({error: 'speech transcription error'});
                    });
            })
            .catch(err => {
                console.error('ERROR:', err);
                res.send({error: 'audio upload error'});
            });
    })
    .run();
});

var port = process.env.PORT || 3000; 
app.listen(port);
console.log("listening on " + port + "!");
