/**
 * Created by vbudhram on 8/13/14.
 */
(function () {
    'use strict';

    var q = require('q');
    var cheerio = require('cheerio');
    var request = require('request');

    var espnUtils = require('./espnUtils');

    function yahooHeadlines() {
        var newsUrl = 'http://football.fantasysports.yahoo.com/';
        var getNewsQ = q.defer();

        console.log('Getting headlines at url : ' + newsUrl);

        var cheerio = require('cheerio');

        var newsOptions = {
            url: newsUrl,
            method: 'GET',
            followAllRedirects: true
        };
        request(newsOptions, function (err, res, body) {
            if (err) {
                getNewsQ.reject(err);
            } else {
                var $ = cheerio.load(body);

                var newsArticles = [];

                var links = $('h4 > a');
                for (var i = 0; i < links.length; i++) {
                    var link = links[i];
                    // Check to see if this is a news article
                    if (link.attribs.href && link.attribs.href.indexOf('//sports.yahoo.com/news/') > -1) {
                        newsArticles.push({
                            title: link.children[0].data,
                            url: link.attribs.href,
                            date: new Date(),
                            source: 'Yahoo Football'
                        });
                    }
                }

                getNewsQ.resolve(newsArticles);
            }
        });

        return getNewsQ.promise;
    }

    function rotoworldHeadlines() {
        var newsUrl = 'http://www.rotoworld.com/features/nfl';
        var getNewsQ = q.defer();

        console.log('Getting headlines at url : ' + newsUrl);

        var cheerio = require('cheerio');

        var newsOptions = {
            url: newsUrl,
            method: 'GET',
            followAllRedirects: true
        };
        request(newsOptions, function (err, res, body) {
            if (err) {
                getNewsQ.reject(err);
            } else {
                var $ = cheerio.load(body);

                var newsArticles = [];

                var links = $('h1 > a');
                for (var i = 0; i < links.length; i++) {
                    var link = links[i];
                    // Check to see if this is a news article
                    if (link.attribs.href && link.attribs.href.indexOf('/articles/nfl/') > -1) {
                        newsArticles.push({
                            title: link.children[0].data + link.children[1].children[0].data,
                            url: 'http://www.rotoworld.com' + link.attribs.href,
                            date: new Date(),
                            source: 'Rotoworld Football'
                        });
                    }
                }
                getNewsQ.resolve(newsArticles);
            }
        });

        return getNewsQ.promise;
    }

    function currentHeadLines(){
        var defer = q.defer();

        q.allSettled([rotoworldHeadlines(), yahooHeadlines(), espnUtils.getHeadlines()]).done(function (results) {
            var news = [];
            results.forEach(function (result) {
                if (result.state === 'fulfilled') {
                    news = news.concat(result.value);
                } else {
                    console.log(result.reason.message);
                }
            });
            defer.resolve(news);
        });

        return defer.promise;
    }

    module.exports = {
        currentHeadlines: currentHeadLines
    };
}());