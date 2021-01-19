const isTypedArray = require('is-typed-array');
const request = require('supertest');
const { create } = require('./server.js');
const { binaryParser, timeStamp } = require('./utils');
require('dotenv').config();

describe('API', () => {

    it('API supertest stream from file works', async (done) => {
        
        const key = process.env.SPEECH_RESOURCE_KEY;
        expect(key).not.toBe(null);
        
        const region = 'eastus';
        const phrase = 'a person walking on a platform';
        const file = `./temp/stream-from-file-${timeStamp()}.mp3`;

        const app = await create();
        
        return request(app)
            .get('/text-to-speech')
            .query({ key, region, phrase, file })
            .expect(200)
            .expect('Content-Type', 'audio/mpeg')
            .buffer()
            .parse(binaryParser)
            .then((res) => {

                // binary response data is in res.body as a buffer
                expect(isTypedArray(res.body)).toBe(true);
                done();
            }).catch(err => done(err));

    });

    it('API supertest stream w/o file works', async (done) => {

        const key = process.env.SPEECH_RESOURCE_KEY;
        expect(key).not.toBe(null);
        
        const region = 'eastus';
        const phrase = 'a person walking on a platform';
        const file = null;

        const app = await create();

        return request(app)
            .get('/text-to-speech')
            .query({ key, region, phrase, file })
            .expect(200)
            .expect('Content-Type', 'audio/mpeg')
            .buffer()
            .parse(binaryParser)
            .then((res) => {

                // binary response data is in res.body as a buffer
                expect(isTypedArray(res.body)).toBe(true);
                done();
            }).catch(err => done(err));

    });
});