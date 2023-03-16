require('dotenv/config');
const token = require('./secrets.json').token;
const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
]});


const camProtection = require("./functions/cam_protection");
const cfbot = require("./functions/cfbot.js");
const gate = require("./functions/rolecommands.js");

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
cfbot(client);
gate(client);


client.login(process.env.TOKEN);