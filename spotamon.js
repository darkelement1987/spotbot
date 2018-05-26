var mysql = require('mysql');
const Discord = require('discord.js');
const client = new Discord.Client();
const currentdate = new Date();
const datetime = "[" + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds() + "] ";
const config = require("./config.json");

// START CONFIG

const website = config.website;
const prefix = config.prefix;
const logchannel = config.logchannel;
const bottoken = config.bottoken;

var pool = mysql.createPool({
    connectionLimit: 10,
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

// END OF CONFIG

function isNumber(n) {
    return !isNaN(parseFloat(n)) && !isNaN(n - 0)
}

client.login(bottoken);

pool.getConnection(function(err, connection) {
    // connected! (unless `err` is set)
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    var channel = client.channels.get(logchannel);
    channel.send(`Logged in as ` + [client.user.tag]);
});


client.on('message', message => {
    let user = message.author;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    var parameter
    parameter = args[0];

    if (message.author.bot) return;
    if (message.content.indexOf(prefix) !== 0) return;

    if (command === 'pokedex') {

        if (typeof parameter != 'undefined' && parameter) {
            if (!isNumber(parameter)) {
                message.channel.send(`Wrong Pokedex format`);
                return;
            }

            pool.getConnection(function(err, connection) {
                pool.query("SELECT monster FROM pokedex WHERE id = " + parameter, function(error, result, rows, fields, data) {
                    if (result.length >= 1) {
                        console.log(datetime + `Pokemon ${parameter} (` + result[0].monster + `) requested by ` + message.author.username);
                        message.channel.send(`Pokemon ${parameter} is: ` + (result[0].monster));
                    } else if (rows.length !== 0) {
                        console.log(datetime + `Pokemon ${parameter} requested by ` + message.author.username);
                        message.channel.send(`Pokemon id '` + parameter + `' does not exist`);
                    };
                    // Handle error after the release.


                    connection.release();
                    if (error) throw error;
                    // Don't use the connection here, it has been returned to the pool.
                });
            });


        } else {
            message.channel.send(`Please enter a Pokemon ID`)
        };


    } else

    if (command === 'commands') {

        message.channel.send(`hi ` + message.author.toString() + `\n\n**Current commands:**\n` + prefix + `pokedex <id>\n` +
            prefix + `demo\n` + prefix + `spots\n` + prefix + `lastmon\n` + prefix + `gym <id>\n` + prefix + `gyms\n` + prefix + `spotted`);
    } else

    if (command === 'spots') {

        pool.getConnection(function(err, connection) {
            pool.query("SELECT COUNT(*) FROM spots;", function(error, result, fields) {
                if (result[0]['COUNT(*)'] >= 1) {
                    console.log(datetime + `Number of spots requested requested by ` + message.author.username);
                    message.channel.send(result[0]['COUNT(*)'] + ` Pokemon were spotted in the last 15 minutes`);
                    connection.release();
                } else {
                    console.log(datetime + `Number of spots requested by ` + message.author.username + ` but non were available`);
                    message.channel.send(`No spots available`);
                    connection.release()
                };

                // Handle error after the release.
                if (error) throw error;

                // Don't use the connection here, it has been returned to the pool.
            });
        });
    } else

    if (command === 'lastmon') {

        if (typeof parameter != 'undefined' && parameter) {
            if (!isNumber(parameter)) {
                message.channel.send(`Wrong format`);
                return;
            }

            parameter = parameter.replace(/['"]+/g, '')

            if (parameter >= 16) {
                message.channel.send(`Maximum number is 15`);
                return;
            }

            pool.getConnection(function(err, connection) {
                pool.query("SELECT pokedex.monster, spots.spotid, spots.date,spots.fulladdress, spots.spotter, spots.latitude, spots.longitude FROM pokedex,spots WHERE pokedex.id = spots.pokemon ORDER BY spots.spotid DESC LIMIT " + parameter, function(error, result, rows, fields) {
                    if (result.length < parameter) {
                        message.channel.send(`There not ` + parameter + ` spots yet, try less`);

                    } else {
                        for (i = 0; i < result.length; i++) {
                            message.channel.send([i + 1] + `. ` + result[i].monster + ` at ` + result[i].fulladdress + ` ` + website + `/?loc=` + result[i].latitude + `,` + result[i].longitude + `&zoom=19`);
                        }
                        console.log(datetime + `Last ` + parameter + ` spots requested by ` + message.author.username);
                        connection.release();
                    };

                    // Handle error after the release.
                    if (error) throw error;

                    // Don't use the connection here, it has been returned to the pool.
                });
            });


        } else {
            message.channel.send(`Please enter a valid number`)
        };


    } else

    if (command === 'lastraid') {

        pool.getConnection(function(err, connection) {
            pool.query("SELECT monster, gname from spotraid, gyms, pokedex WHERE pokedex.id=spotraid.rboss AND gyms.actraid=1 ORDER BY date DESC LIMIT 1", function(error, result, rows, fields) {
                if (result.length >= 1) {
                    console.log(datetime + `Last raid requested by ` + message.author.username);
                    message.channel.send(`**Last raid:  **`)
                    message.channel.send(`1.  ` + result[0].monster + ` at ` + result[0].gname)
                    connection.release();
                } else {
                    console.log(datetime + `Last raid requested by ` + message.author.username + ` but non were available`);
                    message.channel.send(`No last raid available`);
                    connection.release()
                };

                // Handle error after the release.
                if (error) throw error;

                // Don't use the connection here, it has been returned to the pool.
            });
        });
    } else

    if (command === 'gyms') {

        pool.getConnection(function(err, connection) {
            pool.query("SELECT COUNT(*) FROM gyms", function(error, result, fields) {
                if (result.length >= 1) {
                    console.log(datetime + `Number of gyms requested by ` + message.author.username);
                    message.channel.send(result[0]['COUNT(*)'] + ` gyms in database`);
                    connection.release();
                } else {
                    message.channel.send(`No spots available`);
                    connection.release()
                };

                // Handle error after the release.
                if (error) throw error;

                // Don't use the connection here, it has been returned to the pool.
            });
        });
    } else

    if (command === 'gym') {

        if (typeof parameter != 'undefined' && parameter) {
            if (!isNumber(parameter)) {
                message.channel.send(`Wrong GYM-ID format`);
                return;
            }

            parameter = parameter.replace(/['"]+/g, '')

            pool.getConnection(function(err, connection) {
                pool.query("SELECT gname, gid FROM gyms WHERE gid = " + parameter, function(error, result, rows, fields, data) {
                    if (result.length >= 1) {
                        console.log(datetime + `Gym ${parameter} (` + result[0].gname + `) requested by ` + message.author.username);
                        message.channel.send(`Gym ${parameter} is: ` + (result[0].gname));
                    } else if (rows.length !== 0) {
                        console.log(datetime + `Gym ${parameter} requested by ` + message.author.username + `, but does not exist`);
                        message.channel.send(`Gym id '` + parameter + `' does not exist`);
                    };
                    // Handle error after the release.


                    connection.release();
                    if (error) throw error;
                    // Don't use the connection here, it has been returned to the pool.
                });
            });


        } else {
            message.channel.send(`Please enter a GYM id`)
        };


    } else

    if (command === 'spotted') {

        if (!parameter) {
            message.channel.send(`No name given`);
            return;
        }

        parameter = parameter.replace(/['"]+/g, '')

        pool.getConnection(function(err, connection) {
            pool.query("SELECT COUNT(pokedex.monster) FROM spots, pokedex WHERE monster = \"" + parameter + "\" and spots.pokemon = pokedex.id", function(error, result, fields) {
                if (result[0]['COUNT(pokedex.monster)'] >= 1) {
                    console.log(datetime + `Spot count requested for ` + parameter + ` by ` + message.author.username);
                    message.channel.send(`'` + parameter + `' was spotted ` + result[0]['COUNT(pokedex.monster)'] + `x in the last 15 minutes`);
                    connection.release();
                } else {
                    message.channel.send(`'` + parameter + `' was not seen`);
                    connection.release()
                };

                // Handle error after the release.
                if (error) throw error;

                // Don't use the connection here, it has been returned to the pool.
            });
        });
    } else

    if (command === 'searchgym') {
        if (!parameter) {
            message.channel.send(`No name given`);
            return;
        }

        parameter = parameter.replace(/['"]+/g, '')

        pool.getConnection(function(err, connection) {
            pool.query("SELECT gname, glatitude, glongitude from gyms where gyms.gname LIKE \"%" + parameter + "%\"", function(error, result, fields) {
                if (result.length > 0) {

                    console.log(datetime + `Gym search '` + parameter + `' by ` + message.author.username);
                    message.channel.send(`**Found: **`);
                    for (i = 0; i < result.length; i++) {
                        message.channel.send([i + 1] + `. ` + result[i].gname + ` ` + website + `/?loc=` + result[i].glatitude + `,` + result[i].glongitude + `&zoom=19`);
                    }
                    connection.release();

                } else {
                    message.channel.send(`No results found, be more specific`);
                    connection.release()
                };

                // Handle error after the release.
                if (error) throw error;

                // Don't use the connection here, it has been returned to the pool.
            });
        });
    };

});