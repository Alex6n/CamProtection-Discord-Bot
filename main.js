require('dotenv/config');
const { Client } = require("discord.js");
const client = new Client({ intents: 32767 });
const camProtection = require("./functions/cam_protection");

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
  
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
  
    if (interaction.commandName === 'ping') {
      await interaction.reply('Pong!');
    }
});
  
camProtection(client);

client.login(process.env.TOKEN);