require('dotenv/config');
const { Client, ButtonBuilder, ButtonStyle, ActionRowBuilder  } = require("discord.js");
const client = new Client({ intents: 32767 });

// Dictionary to keep track of members who have agreed to open their camera in each public channel
const members_agreed = [];

// Dictionary to keep track of members who have opened their camera in each public channel
const camCooldown = new Map();

client.on('voiceStateUpdate', async (before, after) => {
  if (!after.channel || !after.channel.id) return;

  // Remove member from the list of those who have agreed to open their camera in this channel
  if (before.channel != after.channel)
    members_agreed.find(elem => elem.channel === after.channel.id)?.members.splice(members_agreed.find(elem => elem.channel === after.channel.id).members.indexOf(after.member.id), 1);

  // Only monitor members in public channels (not AFK or private channels)
  if (after.channel.id == after.guild.afkChannel.id || (after.channel.permissionOverwrites.cache.find(role => role.id == after.guild.roles.everyone.id).deny.has(1048576n))) return;

  // Check if the member has agreed to open their camera in this channel
  if (members_agreed.some(channel => channel.members.includes(after.member.id))) return;

  // Check if the member opened their camera
  if (after.selfVideo) {
    console.log(`${after.member.displayName} opened their camera in ${after.channel.name}`)

    // Move member to the AFK channel and then back to the channel (to disable the camera)
    await after.setChannel(after.guild.afkChannel)
    await after.setChannel(before.channel)

    // Check if the user has exceeded the camera cooldown
    if (camCooldown.has(after.member.id)) {
      const camCooldownExpiration = camCooldown.get(after.member.id) + 3000; // 3 seconds in milliseconds
      if (Date.now() < camCooldownExpiration) {
        after.channel.permissionOverwrites.edit(after.member, { 0x0000000000000200: false });
        return;
      }
    }
    
    // Set the camera cooldown for the user
    camCooldown.set(after.member.id, Date.now());
    
    // Clear the camera cooldown after 3 seconds
    setTimeout(() => {
      camCooldown.delete(after.member.id);
    }, 3000);
    
    // Send a warning message to the member
    let warning_message = ':warning: You have opened your **camera **in a **public channel**!\nPlease note that this channel is visible to all members of the server. \nDo you still want to proceed?'
    const button = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('cam_confirmation').setLabel('Yes, I still want to proceed').setStyle(ButtonStyle.Danger),);
    let dm_channel = await after.member.send({ content: warning_message, components: [button] }).catch(err => after.channel.send({ content: warning_message, components: [button] }))
    
    // Collect member's response
    const filter = i => i.customId === 'cam_confirmation' && i.user.id === after.member.id;
    let collector = dm_channel.channel.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async i => {
      await i.update({ content: 'Thank you for confirming. \nYou will be **able to open camera** in *this public session*.\nthis prefrence *will be dismissed* when you *leave the channel*', components: [] });
      members_agreed.find(elem => elem.channel === after.channel.id)
        ? members_agreed.find(elem => elem.channel === after.channel.id).members.push(after.member.id)
        : members_agreed.push({ channel: after.channel.id, members: [after.member.id] });
    });
    setTimeout(async () => { return dm_channel.delete(); }, 15000);

  }
});

client.on('channelUpdate', async (before, after) => {
  if (after.type != 2) return;

  // Check if the channel is now public
  if (before.permissionOverwrites.cache.find(role => role.id == after.guild.roles.everyone.id).deny.has(1048576n) && !after.permissionOverwrites.cache.find(role => role.id == after.guild.roles.everyone.id).deny.has(1048576n)) {
    console.log(`${after.name} is now public`)

    // Check if any members have their camera on
    after.members.forEach(async member => {

      // Check if the member has agreed to open their camera in this channel
      if (members_agreed.some(channel => channel.members.includes(member.id))) return;
      if (member.voice.selfVideo) {
        await member.voice.setChannel(after.guild.afkChannel)
        await member.voice.setChannel(after)
      }

    })
  }

});


client.login(process.env.TOKEN);