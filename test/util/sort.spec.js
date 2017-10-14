'use strict';

const expect = require('chai').expect;
const nock = require('nock');
const exec = require('./util/exec');

describe('sort', () => {
    afterEach(() => nock.cleanAll());
    // Quality │ Popularity │ Maintenance │ Score

    it('should sort results by score', () => {
        nock('https://api.npms.io')
            .get('/search')
            .query({ q: 'gulp', from: '0', size: '10' })
            .reply(200, JSON.stringify(require('./fixtures/search/gulp.json')));

        return exec(['search', 'gulp', '--sort', 'score']).then((output) => {
            console.log(`output: ${JSON.stringify(output)}`);
            expect(output.stdout).to.contain('│ gulp •');
            expect(nock.isDone()).to.equal(true);
        });
    });

    it('should print a message using default `table` output if there are no results', () => {
        nock('https://api.npms.io')
            .get('/search')
            .query({ q: 'hownpm', from: '0', size: '10' })
            .reply(200, JSON.stringify(require('./fixtures/search/hownpm.json')));

        return exec(['search', 'hownpm', '--no-color']).then((output) => {
            expect(output.stdout).to.contain('┌──');
            expect(output.stdout).to.contain('│ Package');
            expect(output.stdout).to.contain('│ hownpm •');
            expect(nock.isDone()).to.equal(true);
        });
    });
});
