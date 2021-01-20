// azure-cognitiveservices-speech.js

const sdk = require('microsoft-cognitiveservices-speech-sdk');
const { Buffer } = require('buffer');
const { PassThrough } = require('stream');
const fs = require('fs');

/**
 * Node.js server code to convert text to speech
 * @returns stream
 * @param {*} key your resource key
 * @param {*} region your resource region
 * @param {*} text text to convert to audio/speech
 * @param {*} filename optional - best for long text - temp file for converted speech/audio, for examples see test file
 */
const textToSpeech = async (key, region, text, filename=null)=> {
    
    // convert callback function to promise
    return new Promise((resolve, reject) => {
        
        if(!key || !region ||!text) throw Error("Required function parameters are not allowed to be empty")
        
        const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
        speechConfig.speechSynthesisOutputFormat = 5; // mp3
        
        let audioConfig = null;
        
        if (filename) {
            audioConfig = sdk.AudioConfig.fromAudioFileOutput(filename);
        }
        
        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

        synthesizer.speakTextAsync(
            text,
            result => {
                
                const { audioData } = result;

                if (filename) {
                    
                    // return stream from file
                    const audioFile = fs.createReadStream(filename);
                    synthesizer.close();
                    resolve(audioFile);
                    
                } else {
                    
                    // return stream from memory
                    const bufferStream = new PassThrough();
                    bufferStream.end(Buffer.from(audioData));
                    synthesizer.close();
                    resolve(bufferStream);
                }
            },
            error => {
                synthesizer.close();
                reject(error);
            }); 
    });
};

module.exports = {
    textToSpeech
};