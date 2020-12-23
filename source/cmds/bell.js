const fs = require("fs");
const Time = require("../classes/time.js");
const Utilz = require("../classes/utilz.js");

let bell = {};
let checkInterval;

let checkBell = function(timetable){}; // C-style prototyping the function :P

function cmdBell(client, timetable) {
    loadPrefs();

    // Admin permission required
    cmdSetBellCh(client, timetable);
    // Admin permission required
    cmdRemoveBellCh(client);
    
    checkInterval = setInterval(checkBell, 900 * 60, client, timetable);
}

function cmdSetBellCh(client, timetable) {
    client.on("message", (msg) => {
        if (msg.author.bot) return;
        const cont = msg.content;
        if (
            cont.startsWith("!csengetés be") ||
            cont.startsWith("!csengetes be")
        ) {
            const guildId = msg.guild.id;
            const member = msg.guild.member(msg.author); // same as `msg.member`
            if (!member.hasPermission("ADMINISTRATOR")) {
                msg.channel.send("Nincs jogod ehhez. (Adminisztrátor rang szükséges)");
                console.log(`${msg.member.user.username}#${msg.member.user.discriminator} tried turning off the bell in ${msg.guild.name}, but they don't have administrator permission`);
                return
            }

            if (bell[guildId] === undefined) {
                bell[guildId] = {"readableName" : msg.guild.name};
            } else {
                clearInterval(bell[guildId]["interval"]);
            }
            bell[guildId]["readableName"] = msg.guild.name;
            bell[guildId]["channelID"] = msg.channel.id;
            msg.channel.send(`${msg.channel} kiválaszva, mint csengetési csatorna.`);
            // console.log(bell);
            console.log(`${msg.channel.name} was set as bell channel`);
            savePrefs();
        }
    });
}

function cmdRemoveBellCh(client) {
    client.on("message", (msg) => {
        if (msg.author.bot) return;
        const cont = msg.content;
        if (
            cont.startsWith("!csengetés ki") ||
            cont.startsWith("!csengetes ki")
        ) {
            const guildID = msg.guild.id;
            const member = msg.guild.member(msg.author); // same as `msg.member`
            if (!member.hasPermission("ADMINISTRATOR")) {
                msg.channel.send("Nincs jogod ehhez. (Adminisztrátor rang szükséges)");
                console.log(`${msg.member.user.username}#${msg.member.user.discriminator} tried turning off the bell in ${msg.guild.name}, but they don't have administrator permission`);
                return
            }

            if (bell[guildID] === undefined || bell[guildID]["channelID"] == undefined) {
                msg.channel.send("Nincs bekapcsolva csengetés.");
                return;
            }
            const channel = bell[guildID]["channelID"]
            bell[guildID]["channelID"] = undefined;
            msg.channel.send(`Csengetések leállítva a ${channel} csatornában.`);
            // console.log(bell);
            console.log(`${msg.channel.name} is bell channel no more`);
            savePrefs();
        }
    });
}

checkBell = (function() {
    let lastRingIn = 0;
    
    return function(client, timetable) {
        lastRingIn = Math.max(lastRingIn - 1, 0);
        if (lastRingIn > 0) return;
        
        const today = timetable[Utilz.getDayString()];
        const now = new Time(new Date().getHours(), new Date().getMinutes());
        let lessonsStart = [];
        for (var lesson of today) {
            if (lesson.data.start.compare(now.add(new Time(1))) == 0) {
                lessonsStart.push(lesson.subj);
            }
        }
        if (lessonsStart.length == 0) return;

        lastRingIn = 2;
        let reply = "@everyone, csöngő van."
                    + "\n**" +
                    lessonsStart.reduce((a, b) => a + ", " + b)
                    + `** ${lessonsStart.length > 1 ? "órák kezdődnek" : "óra kezdődik"}.`
        for (var guildId in bell) {
            const channelID = bell[guildId]["channelID"];
            client.channels.fetch(channelID)
                           .then(channel => {
                                channel.send(reply);
                                console.log(`rang the bell in ${bellCh.name} for classes ${lessonsStart}`);
                           })
                           .catch(err => console.log(err));
        }
    };
}());

function savePrefs() { // save
    console.log("saved prefs for './cmds/bell.js'");
    const saveData = bell;
    console.log(saveData);
    fs.writeFile("prefs/bell.json", JSON.stringify(saveData, undefined, 4), err => {if (err) console.log(err)});
}

function loadPrefs() { // load
    console.log("loaded prefs for './cmds/bell.js'");
    let loadDataRaw = fs.readFileSync("prefs/bell.json", err => {if (err) console.log(err)});
    if (!loadDataRaw) {
        let loadData = JSON.parse(loadDataRaw);
        bell = loadData || bell;
    }
}

module.exports = cmdBell;