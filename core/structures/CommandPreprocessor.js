
const clc = require('cli-color')
const { readdirSync } = require("fs");
const ascii = require("ascii-table");
let table = new ascii("Commands");

table.setHeading("Command", "Status");

module.exports = (Client) => {
    readdirSync("./core/commands/").forEach(dir => {
        const commands = readdirSync(`./core/commands/${dir}/`).filter(file => file.endsWith(".js"));

        for (let file of commands) {
            let pull = require(`../../core/commands/${dir}/${file}`);
    file = file.replace(".js", "");

            if (pull.name) {
              pull.category = dir.toLowerCase();
                    Client.commands.set(pull.name, pull);
                table.addRow(file, '  ✅');
            } else {
                table.addRow(file, '  ❌');
                continue;
            }

            if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(alias => Client.aliases.set(alias, pull.name));
        }
    });
console.log(clc.magenta('[ Kanyon - Commands System ]'), clc.white(` ${Client.commands.size} Comandos carregados!`));
}