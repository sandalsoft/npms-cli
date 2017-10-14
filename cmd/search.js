'use strict';

const got = require('got');
const Table = require('cli-table2');
const chalk = require('chalk');
const moment = require('moment');
const truncate = require('truncate');
const handleError = require('./util/handleError');
const sortResults = require('./util/sortResults');

exports.command = 'search <query...>';
exports.describe = 'Search npms.io for packages.';
exports.builder = (yargs) =>
    yargs
        .usage(
            'Usage: $0 search <query...> [options]\n\nSearch npms.io for packages.\nFor advances filters and modifiers visit https://api-docs.npms.io/#api-search-query.'
        )
        .example('$0 search cross spawn', 'Search for "cross spawn"')
        .example('$0 search cross spawn --output json', 'Search for "cross spawn" and print results as JSON')
        .example('$0 search pdf --sort quality', 'Search for "pdf" and sort by package quality')
        .example('$0 search sass keywords:gulpplugin', 'Search for "sass" packages that contain the "gulpplugin" keywords')
        .options({
            from: {
                alias: 'f',
                describe: 'The offset in which to start searching from',
                default: 0,
                type: 'number',
            },
            size: {
                alias: 's',
                describe: 'The total number of results to return',
                default: 10,
                type: 'number',
            },
            output: {
                alias: 'o',
                describe: 'Format the results in a table or as JSON',
                default: 'table',
                choices: ['table', 'json'],
            },
            api: {
                describe: 'The API url',
                default: 'https://api.npms.io/v2',
            },
            sort: {
                describe: 'Sort the results by Score, Name, Quality, Popularity or Mainetnance',
                default: 'score',
                choices: ['score', 'name', 'quality', 'popularity', 'maintenance'],
            },
        });

exports.handler = (argv) => {
    got(`${argv.api}/search`, {
        json: true,
        query: JSON.parse(
            JSON.stringify({
                q: argv.query.join(' '),
                from: argv.from,
                size: argv.size,
            })
        ),
    })
        .then((res) => {
            // ['score', 'name', 'quality', 'popularity', 'maintenance'],
            let sortedResults;

            switch (argv.sort) {
            case 'name':
                console.log('sorting by name');
                sortedResults = sortResults(res.body.results, 'name');
                break;
            case 'quality':
                console.log('sorting by quality');
                sortedResults = sortResults(res.body.results, 'quality');
                break;
            case 'popularity':
                console.log('sorting by popularity');
                sortedResults = sortResults(res.body.results, 'popularity');
                break;
            case 'maintenance':
                console.log('sorting by maintenance');
                sortedResults = sortResults(res.body.results, 'maintenance');
                break;
            default:
                console.log('sorting by score [default]');
                sortedResults = sortResults(res.body.results, 'score');
            }
            return sortedResults;
        })
        .then((sortedResults) => {
            if (argv.output === 'json') {
                console.log(JSON.stringify(sortedResults, null, 2));
                return;
            }

            if (!sortedResults.length) {
                console.log(chalk.red(`No matches found for: ${chalk.white.bold(argv.query.join(' '))}`));
                return;
            }

            const table = new Table({ head: ['Package', 'Quality', 'Popularity', 'Maintenance', 'Score'] });

            table.push.apply(
                table,
                sortedResults.map((item) => {
                    const pkg = item.package;

                    const packageColumn = [
                        `${chalk.bold(pkg.name)} • ${chalk.dim(pkg.links.repository || pkg.links.npm)}`,
                        chalk.gray(truncate(pkg.description, 80, { ellipsis: '...' })),
                        pkg.date && pkg.publisher ? chalk.dim(`updated ${moment(pkg.date).fromNow()} by ${pkg.publisher.username}`) : '',
                    ].join('\n');

                    const scoreColumns = ['quality', 'popularity', 'maintenance']
                        .map((score) => ({ hAlign: 'center', vAlign: 'center', content: Math.round(item.score.detail[score] * 100) }))
                        .concat([{ hAlign: 'center', vAlign: 'center', content: chalk.green(Math.round(item.score.final * 100)) }]);

                    return [packageColumn].concat(scoreColumns);
                })
            );

            console.log(table.toString());
        })
        .then(() => {
            process.exitCode = 0;
        })
        .catch((err) => handleError(err));
};
