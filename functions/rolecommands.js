module.exports = function camProtection(client) {

  const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require('discord.js');
  const prefix = ";";

  client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    if (message.content.indexOf(prefix) !== 0) return; // If the cmd doesn't start with the prefix
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return;


    const publicRole = "1006988312461967505";
    const publicChannel = "1023332490083041330";
    const selfRolesChannel = "1006988314231975984";
    const thumbnail = "https://images-ext-1.discordapp.net/external/U5pNSth_4INz7XZvnSBXG_ocCqC0b8TXBWggMkt27e0/%3Fwidth%3D256%26s%3D72e46a461e4f4d2154c78919c480b699f5db0b08/https/styles.redditmedia.com/t5_3ip0zv/styles/communityIcon_vpoeeufipn391.png";
    const redditUrl = "https://www.reddit.com/r/ExEgypt/";
    const aboutUsChannel = "1006988314231975978";
    const redditFeedChannel = "1023372285224165446";
    const memberRole = "1006988312461967507";
    const allyRole = "1006988312461967506";
    const lobbyChannel = "1006988314563334163";

    const embed = new EmbedBuilder()
        .setColor(0x8E0909)
        .setTitle("Welcome to ExEgypt!")
        .setURL(redditUrl)
        .setThumbnail(thumbnail)
        .setDescription(`Grab yourself some <#${selfRolesChannel}> and feel free to introduce yourself!\n\n**!اهلا بيك في سيرفر اكس-ايچبت**\n!ما تنساش تاخد رولات ليك وتعرفنا شوية عن نفسك
  من هنا 👈 <#${selfRolesChannel}>\n\n**Notable Channels**\n<#${aboutUsChannel}>\n<#${redditFeedChannel}>\n<#${lobbyChannel}>`)



    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();


    if(command === "pallow") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        (async () => {
          await message.delete();
          return;
        })();
      } else {

        
        (async () => {
          if(args.length === 0 || args.length > 1) {
            message.reply('no user or incorrect user');
            return;
          }

        let user = message.mentions.members.first();
        let userId = args[0];

        if(user === undefined) {
          user = userId;
          client.users.fetch(user)
          .then(user => {
            const guildMember = message.guild.members.cache.get(user.id);
            guildMember.roles.add(publicRole);
            client.channels.cache.get(publicChannel).send({
              content: `Welcome <@${user.id}>!`,
              embeds: [embed]
            });

          })
          .catch(error => {
            if (error.code === 10013) {
              message.reply('That is an incorrect ID. Please try again.');
            } else {
              console.error(error);
            }
          });
        } else {
          user.roles.add(publicRole)
          client.channels.cache.get(publicChannel).send({
              content: `Welcome <@${user.id}>!`,
              embeds: [embed]
          });
        }

        })();
      }
    }

    if(command === "allow") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        (async () => {
          await message.delete();
          return;
        })();
      } else {
        let user = message.mentions.members.first();
        let userId = args[0];
        let type = args[1]?.toLowerCase(); // Ally | Member

        if(type === undefined) {
          return;
        }

        if(args.length === 0 || args.length > 2) {
          return;
        }

        if(type !== "ally" && type !== "member") {
          return;
        }

        if(user === undefined) {
          user = userId;
          client.users.fetch(user)
          .then(user => {
            const guildMember = message.guild.members.cache.get(user.id);
            if(type === "ally") {
              guildMember.roles.add(allyRole);
            } else {
              guildMember.roles.add(memberRole);
            }
            client.channels.cache.get(lobbyChannel).send({
              content: `Welcome <@${user.id}>!`,
              embeds: [embed]
            });

          })
          .catch(error => {
            if (error.code === 10013) {
              message.reply('That is an incorrect ID. Please try again.');
            } else {
              console.error(error);
            }
          });
        } else {
          if(type === "ally") {
            user.roles.add(allyRole);
          } else {
            user.roles.add(memberRole);
          }
          client.channels.cache.get(lobbyChannel).send({
              content: `Welcome <@${user.id}>!`,
              embeds: [embed]
          });
        }
      }
    }

  });

};