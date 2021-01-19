const isStream = require('is-stream');
const sut = require('./azure-cognitiveservices-speech');
require('dotenv').config();
const { timeStamp } = require('./utils');

describe('speech', () => {

    it('stream from file works', async () => {

        const key = process.env.SPEECH_RESOURCE_KEY;
        const region = 'eastus';
        const text = 'a person walking on a platform';
        const filename = `./temp/stream-from-file-${timeStamp()}.mp3`;

        const stream = await sut.textToSpeech(key, region, text, filename);
        expect(isStream(stream)).toBe(true);

    });
    it('stream w/o file works', async () => {

        const key = process.env.SPEECH_RESOURCE_KEY;
        const region = 'eastus';
        const text = 'a person walking on a platform';
        const filename = null;

        const stream = await sut.textToSpeech(key, region, text, filename);
        expect(isStream(stream)).toBe(true);

    });
});
