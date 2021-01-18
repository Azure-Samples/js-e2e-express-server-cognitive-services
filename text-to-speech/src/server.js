const express = require('express');
const path = require('path');
const sdk = require('microsoft-cognitiveservices-speech-sdk');
const {Buffer} = require('buffer/');
const { PassThrough } = require('stream'); 
const fs = require('fs');

const timeStamp = () => {
    const date = new Date();
    return date.getTime();
};

const ignoreFavicon = (req, res, next) => {
    if (req.originalUrl.includes('favicon.ico')) {
        res.status(204).end();
    }
    next();
};

const create = async () => {

    const app = express();
    app.use(ignoreFavicon);
    

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/client.html'));
    });

    app.get('/client-only', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/client-only.html'));
    });

    app.get('/text-to-speech-file', (req, res) => {

        const filename = `./stream-from-file-${timeStamp()}.mp3`;

        const {key, region, phrase } = req.query;
        
        const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
        const audioConfig = sdk.AudioConfig.fromAudioFileOutput(filename);
        speechConfig.speechSynthesisOutputFormat = 5; // mp3
        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

        synthesizer.speakTextAsync(
            phrase,
            result => {
                const {audioData} = result;
                console.log(`Audio data byte size: ${audioData.byteLength}.`);
                const audioFile = fs.createReadStream(filename);
                res.set({
                    'Content-Type': 'audio/mpeg',
                    'Content-Length': audioData.byteLength
                });
                audioFile.pipe(res);
                synthesizer.close();
            },
            error => {
                console.log(error);
                synthesizer.close();
                res.send(error);
            });
    });

    app.get('/text-to-speech-stream', (req, res) => {
       
        const { key, region, phrase } = req.query;
        // const stream = sdk.PushAudioOutputStream.create(null);
        
        const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
        speechConfig.speechSynthesisOutputFormat = 5; // mp3
        // const audioConfig = sdk.AudioConfig.fromStreamOutput(stream);
        const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
        
        synthesizer.speakTextAsync(
            phrase,
            result => {
                // Interact with the audio ArrayBuffer data
                const {audioData } = result;
                console.log(`Audio data byte size: ${audioData.byteLength}.`);
                
                res.set({
                    'Content-Type': 'audio/mpeg',
                    'Content-Length': audioData.byteLength
                });
                const bufferStream = new PassThrough();
                bufferStream.end(Buffer.from(audioData));
                bufferStream.pipe(res);
                synthesizer.close();
            },
            error => {
                console.log(error);
                synthesizer.close();
            });
    });

    return app;
};

module.exports = {
    create
};
