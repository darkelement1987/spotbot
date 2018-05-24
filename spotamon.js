var mysql = require('mysql');
const Discord = require('discord.js');
const client = new Discord.Client();

// START CONFIG

const prefix = "";
const logchannel = ""; // <-- Channel id where the 'logged in'-msg will show
const bottoken = "";

var pool = mysql.createPool({
    connectionLimit: 10,
    host: "",
    user: "",
    password: "",
    database: ""
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
    var dexid
    dexid = args[0];

    if (message.author.bot) return;
    if (message.content.indexOf(prefix) !== 0) return;

    if (command === 'pokedex') {

        if (typeof dexid != 'undefined' && dexid) {
            if (!isNumber(dexid)) {
                message.channel.send(`Wrong Pokedex format`);
                return;
            }
            pool.getConnection(function(err, connection) {
                pool.query("SELECT monster FROM pokedex WHERE id = " + dexid, function(error, result, rows, fields, data) {
                    if (result.length >= 1) {
                        console.log(datetime + `Pokemon ${dexid} (` + result[0].monster + `) requested by ` + message.author.username);
                        message.channel.send(`Pokemon ${dexid} is: ` + (result[0].monster));
                    } else if (rows.length !== 0) {
                        console.log(datetime + `Pokemon ${dexid} requested by ` + message.author.username);
                        message.channel.send(`Pokemon id '` + dexid + `' does not exist`);
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
        message.channel.send(`hi ` + message.author.toString() + `\n\n**Current commands:**\n`+ prefix + `pokedex <id>\n`
		+ prefix + `demo\n` + prefix + `spots\n` + prefix + `lastmon\n` + prefix + `gym <id>\n` + prefix + `gyms`);
    } else
		
    if (command === 'time') {
        message.channel.send(`Time is: `+ (datetime));
    } else
		
	
    if (command === 'demo') {
        message.channel.send(`hi ` + message.author.toString() + `\n\nDemo map is available @ https://www.spotamon.com/demo/`);
    } else

    if (command === 'spots') {
        pool.getConnection(function(err, connection) {
            pool.query("SELECT COUNT(*) FROM spots;", function(error, result, fields) {
                if (result[0]['COUNT(*)'] >= 1) {
                    console.log(datetime + `Number of spots requested requested by ` + message.author.username);
                    message.channel.send(result[0]['COUNT(*)'] + ` Pokemon were spotted in the last 15 minutes`);
                    connection.release();
                } else {
                    console.log(datetime + `Number of spots requested requested by ` + message.author.username + ` but non were available`);
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
        pool.getConnection(function(err, connection) {
            pool.query("SELECT pokedex.monster, spots.spotid, spots.date,spots.fulladdress FROM pokedex,spots WHERE pokedex.id = spots.pokemon ORDER BY spots.spotid DESC LIMIT 3", function(error, result, rows, fields) {
                if (result.length >= 3) {
                    console.log(datetime + `Last 3 spots requested by ` + message.author.username);
                    message.channel.send(`**Last 3 spots:  **`)
                    message.channel.send(`Last spotted:  ` + result[0].monster + ` at ` + result[0].fulladdress)
                    message.channel.send(`Last spotted:  ` + result[1].monster + ` at ` + result[1].fulladdress)
                    message.channel.send(`Last spotted:  ` + result[2].monster + ` at ` + result[2].fulladdress)
                    connection.release();
                } else {
                    console.log(datetime + `Last 3 spots requested by ` + message.author.username + ` but non were available`);
                    message.channel.send(`There should be a minimum of 3 spots in the db to perform this command`);
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
            pool.query("SELECT COUNT(*) FROM gyms;", function(error, result, fields) {
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

        if (typeof dexid != 'undefined' && dexid) {
            if (!isNumber(dexid)) {
                message.channel.send(`Wrong GYM-ID format`);
                return;
            }
            pool.getConnection(function(err, connection) {
                pool.query("SELECT gname, gid FROM gyms WHERE gid = " + dexid, function(error, result, rows, fields, data) {
                    if (result.length >= 1) {
                        console.log(datetime + `Gym ${dexid} (` + result[0].gname + `) requested by ` + message.author.username);
                        message.channel.send(`Gym ${dexid} is: ` + (result[0].gname));
                    } else if (rows.length !== 0) {
                        console.log(datetime + `Pokemon ${dexid} requested by ` + message.author.username);
                        message.channel.send(`Gym id '` + dexid + `' does not exist`);
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


    };

});
