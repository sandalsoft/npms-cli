'use strict';

function sortResults(results, sortProperty) {
    // ['score', 'name', 'quality', 'popularity', 'maintenance'],
    // sort the results and return sorted data
    // figure out what format that should be in.  JSON, array, etc?

    let sortedResults = [];

    switch (sortProperty) {
    case 'name':
        sortedResults = results.sort((a, b) => {
            return a.package.name > b.package.name ? 1 : b.package.name > a.package.name ? -1 : 0;
        });
        break;
    case 'quality':
        sortedResults = results.sort((a, b) => {
            return a.score.detail.quality < b.score.detail.quality ? 1 : b.score.detail.quality < a.score.detail.quality ? -1 : 0;
        });
        break;
    case 'popularity':
        sortedResults = results.sort((a, b) => {
            return a.score.detail.popularity < b.score.detail.popularity
                    ? 1
                    : b.score.detail.popularity < a.score.detail.popularity ? -1 : 0;
        });
        break;
    case 'maintenance':
        sortedResults = results.sort((a, b) => {
            return a.score.detail.maintenance < b.score.detail.maintenance
                    ? 1
                    : b.score.detail.maintenance < a.score.detail.maintenance ? -1 : 0;
        });
        break;
    default:
        sortedResults = results.sort((a, b) => {
            return a.score.final < b.score.final ? 1 : b.score.final < a.score.final ? -1 : 0;
        });
    }

    return sortedResults;
}

module.exports = sortResults;
