const Utilz = require("../classes/utilz.js");
const { MessageEmbed } = require("discord.js");

const cmdList = {
    "!help [parancs neve]" : "Megadja az adott parancs használati módját.\n\n**pl. `!help órák`**",
    "!órarend" : "Megadja a napi órarendet.\n\n**pl. `!órarend`**",
    "!névsor" : "Kiírja a névsort.\n\n**pl. `!névsor`**",
    "!következő [diák neve]" : "Megadja, hogy mi lesz az adott diák következő órája.\n\n**pl. `!következő Ábel`**",
    "!órák [diák neve]" : "Listázza az összes órát amire az adott diák jár.\n\n**pl. `!órák Ábel`**",
    "!tanulók [óra neve]" : "Listázza az összes diákot, aki részt vesz az adott órán.\n\n**pl. `!tanulók fizika`**",
    "!csengetés [be/ki]" : "Be, illetve kikapcsolja a csengetést az adott csatornán. (csak **adminok** használhatják)\n\n**pl. `!csengetés be`**"
};

function cmdHelp(client, timetable, students) {
    client.on("message", (msg) => {
        if (msg.author.bot) return;
        const regex = /!help\s*!?(.*)/i;
        const match = msg.content.match(regex);
        if (!match) return

        if (!match[1]) {
            const reply = Object.keys(cmdList).reduce((a, b) => a + "\n"+ b);
            const embed = new MessageEmbed()
                .setColor(0x00bb00)
                .setTitle("**Help:**")
                .setDescription(`\`\`\`\n${reply}\`\`\``);
            msg.channel.send(embed);
            console.log(`${msg.member.user.username}#${msg.member.user.discriminator} queried the general help sheet`);
        } else {
            const cmdName = Utilz.removeAccents(match[1].toLowerCase());
            const cmds = Object.keys(cmdList).map(x => {
                const m = x.match(/!([a-záéíóöőúüű]+)\s*.*/i);
                let dict = {};
                dict[Utilz.removeAccents(m[1])] = m[0];
                return dict;
            });
            
            for (var cmd of cmds) {
                if (cmd[cmdName] !== undefined) {
                    const cmdDesc = cmdList[cmd[cmdName]];
                    const embed = new MessageEmbed()
                        .setColor(0x00bb00)
                        .setTitle(`\`${cmd[cmdName]}\``)
                        .setDescription(cmdDesc);
                    msg.channel.send(embed);
                    console.log(`${msg.member.user.username}#${msg.member.user.discriminator} queried the help sheet for '${cmdName}'`);
                    return;
                }
            }
            const embed = new MessageEmbed()
                .setColor(0xbb0000)
                .setDescription(`Nincs \`${cmdName}\` nevű parancs.`);
            msg.channel.send(embed);
            console.log(`${msg.member.user.username}#${msg.member.user.discriminator} tried to query the help sheet for '${cmdName}', but this command doesn't exist`);
        }
    });
}

module.exports = cmdHelp;
