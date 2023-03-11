const { EmbedBuilder } = require('discord.js')

const loadingEmbed = new EmbedBuilder()
	.setColor(0xfeafea)
	.setDescription("Fetching the database, please wait...")

// not an admin slash command embed
const embedNotAnAdmin = new EmbedBuilder()
	.setTitle(`[Error 16401] Missing Permissions ❌`)
	.setColor(0xfeafea)
	.setDescription(`You are not an Administrator or you do not have enough permissions.`)

// Embed for adding channel
function newRoleAdded(channel) {
	return new EmbedBuilder()
		.setColor(0xfeafea)
		.setDescription(`The selected channel <#${channel}> has been added sucessfully. ✅`)
}


// Embed for removing channel
function newRoleRemoved(channel) {
	return new EmbedBuilder()
		.setColor(0xfeafea)
		.setDescription(`The selected channel <#${channel}> has been removed sucessfully. ✅`)
}


// Embed for DMs
const sentDM = new EmbedBuilder()
	.setColor(0xfeafea)
	.setDescription("Sent you a private message, please check your DMs! ✅\nDeleting this interaction in 5 seconds.")

// <------- Help slash command embeds -------> //
	function helpEmbed(clientUsername) {
		return new EmbedBuilder()
		.setColor(0xfeafea)
		.setTitle(`${clientUsername}'s help page`)
		.setDescription(`${clientUsername} is a bot designed to efficiently identify and flag suspected raiders and malicious accounts to maintain the integrity and security of your communities.\n\u200B\nSome definitions to help you understand the terms in this help page.\n__Prefix__: The symbol before the command name. (i.e: \`!\`help), with ! being the prefix.\n__Arguments__: The information passed from you, to the bot. \n(i.e !add \`481973337288081429\`), with the user ID being the argument passed.\n__Database__: The database which contains all the information about users & their servers.`)
		.addFields(
			{ name: '1 - Setting up the bot:', value: `**/selectrole** — Select the role you want the bot to give to found members, preferably this role should colored & higher in the role hierachy, than the default member role; to make it easier to categorize found members.\nThe bot's role *needs* to be higher than the role it's trying to give.\n\n**/selectchannel** — Select the channel(s) you want the bot to log members to, make sure that the bot can view the channel to be able to send messages to it.\n\u200B\n*(You can skip the two previous steps if you don't want the bot to assign roles to newly found members or send alerts whenever someone froms the database joins the server.)*\n\n**/prefix [prefix]** — Gets or sets the prefix for the server, **__the default prefix is__** \`-\`.\n\n**/autoupdate** — Turn on/off automatic updates to the database whenever a member gets banned.`, inline: true},

			{ name: `2 - Slash Commands:`, value: `**/check [user]** — Checks if the selected member is in the database, works **ONLY** with members who are already in the server.\n\n**/checkall ids[true, false]** (Optional) — By default, sends you a list of usernames & IDs of members in this server who were found in the database. If ids is set to true, it will instead send a list of IDs only that were found.\n\n**/add [user] [type] [reason]** — Add members to the database, there are only 2 types. Ban and Note: Note means that you'd like to add this ID to the database with a note/reason, Ban means that this member was banned from the server.\nUsage example: \`-add 481973337288081429 ban racism & harassment.\`\n*(Note and Ban are **not** case-sensitive)*\n\n**/prefix [prefix]** — Changes the prefix for the server, the prefix length cannot be more than 2 characters.\n\n**/serverinfo** — Displays all the server information associated with the bot, like the selected channels, role and prefix.\n\n**/help** — You're now here.`},

			{ name: `3- Prefix Commands:`, value: `**[prefix]check [id(s)]** — You can use this command to check if any ID(s) are in the database. If you want to check multiple ids at once, you need to separate them by a comma.\nUsage example: \`[prefix]check 481973337288081429, 260065993328189491\`\nIf you pass **join** as the last argument, the bot will add another variable that informs you whether the found member(s) are in the server or not.\nUsage example: \`[prefix]check 481973337288081429, 260065993328189491, join\`\n\n**[prefix]serverinfo** — Displays all the server information associated with the bot, like the selected channels, role and prefix.\n\n**[prefix]prefix [prefix here]** — Changes the prefix for the server, the prefix length cannot be more than 2 characters.\n\n**[prefix]autoupdate** — Turn on/off automatic updates to the database whenever a member gets banned.`}
		)
	}

// <-------Selectrole slash command embeds-------> //

	function returnRole(role) {
		return new EmbedBuilder()
			.setColor(0xfeafea)
			.setDescription(`Selected role <@&${role}> has been added successfully. ✅`)
	}

	function removeRole(role) {
		return new EmbedBuilder()
			.setColor(0xfeafea)
			.setDescription(`Selected role <@&${role}> has been removed successfully. ✅`)
	}

	// Embed for adding role
	const embedRoleAdded = new EmbedBuilder()
		.setColor(0xfeafea)
		.setDescription(`The selected role has been added sucessfully. ✅`)

	// Embed for removing role
	const embedRoleRemoved = new EmbedBuilder()
		.setColor(0xfeafea)
		.setDescription(`The selected role has been removed sucessfully. ✅`)
	// Embed for exceeding role limit

	// Embed max role limit
	function maxRoleLimit(roleID) {
		return new EmbedBuilder()
		.setColor(0xfeafea)
		.setTitle(`Error: Exceeded Role Limit ❌`)
		.addFields(
		{ name: 'Your server\'s current selected role:', value: `<@&${roleID}> — ${roleID}`, inline: true},
		)

	}

// <------- Check slash command embeds ------> //
	function userUndetected(nameFound, creationDate, funcCreationDate, joinedDate, id, accountAvatar) {
	  return new EmbedBuilder()
	    .setColor(0xfeafea)
		.setAuthor({ name: `${nameFound} wasn't found! ❌`, iconURL: `${accountAvatar}`})
		.addFields(
		{ name: `Creation Date: `, value: `${creationDate}\n(${funcCreationDate})`, inline: true},
		{ name: "\u200B", value: "\u200B", inline: true},
		{ name: `Join Date: `, value: `${joinedDate}`, inline: true},
		)
		.setFooter({ text: `ID: ${id}`});
	}

	function userDetectedServer(nameFound, creationDate, funcCreationDate, joinedDate, serversFoundIn, riskText, riskValue, id, accountAvatar) {
		return new EmbedBuilder()
		.setColor(0xfeafea)
		.setAuthor({ name: `${nameFound} was found! ✅`, iconURL: `${accountAvatar}`})
		.addFields(
			{ name: `Creation Date: `, value: `${creationDate}\n(${funcCreationDate})`, inline: true},
			{ name: '\u200B', value: '\u200B', inline: true },
			{ name: `Join Date: `, value: `${joinedDate}`, inline: true},
			{ name: `In servers:`, value: `${serversFoundIn}`},
			{ name: `Risk:`, value: `${riskText} (${riskValue}%)`}
			)
		.setFooter({ text: `ID: ${id}`});
	}

	function userDetectedBan(nameFound, creationDate, funcCreationDate, joinedDate, banReason, riskText, riskValue, id, accountAvatar) {
		return new EmbedBuilder()
		.setColor(0xfeafea)
		.setAuthor({ name: `${nameFound} was found! ✅`, iconURL: `${accountAvatar}`})
		.addFields(
		{ name: `Creation Date: `, value: `${creationDate}\n(${funcCreationDate})`, inline: true},
		{ name: '\u200B', value: '\u200B', inline: true },
		{ name: `Join Date: `, value: `${joinedDate}`, inline: true},
		{ name: `Notes:`, value: `${banReason}`},
		{ name: `Risk:`, value: `${riskText} (${riskValue}%)`}
		)
		.setFooter({ text: `User ID: ${id}`});
	}

	function userDetected(nameFound, creationDate, funcCreationDate, joinedDate, riskText, riskValue, id, accountAvatar) {
		return new EmbedBuilder()
		.setColor(0xfeafea)
		.setAuthor({ name: `${nameFound} was found! ✅`, iconURL: `${accountAvatar}`})
		.addFields(
		{ name: `Creation Date: `, value: `${creationDate}\n(${funcCreationDate})`, inline: true},
		{ name: '\u200B', value: '\u200B', inline: true },
		{ name: `Join Date: `, value: `${joinedDate}`, inline: true},
		{ name: `Risk:`, value: `${riskText} (${riskValue}%)`}
		)
		.setFooter({ text: `ID: ${id}`});
	}			

	function userDetectedAll(nameFound, creationDate, funcCreationDate, joinedDate, servers, ban, riskText, riskValue, id, accountAvatar) {
		return new EmbedBuilder()
		.setColor(0xfeafea)
		.setAuthor({ name: `${nameFound} was found! ✅`, iconURL: `${accountAvatar}`})
		.addFields(
		{ name: `Creation Date: `, value: `${creationDate}\n(${funcCreationDate})`, inline: true},
		{ name: '\u200B', value: '\u200B', inline: true },
		{ name: `Join Date: `, value: `${joinedDate}`, inline: true},
		{ name: `In servers:`, value: `${servers}`},
		{ name: `Notes:`, value: `${ban}`},
		{ name: `Risk:`, value: `${riskText} (${riskValue}%)`}
		)
		.setFooter({ text: `ID: ${id}`});	
	}

	function checkError() {
		return new EmbedBuilder()
		.setColor(0xfeafea)
		.setTitle(`[Error 16402]`)
		.setDescription(`Please report error this when it happens, thank you!`)
	}

// <------- Checkall slash command embeds ------> //

	// Nothing found
	const nothingFound = new EmbedBuilder()
	  .setColor(0xfeafea)
	  .setTitle(`No match! ❌`)
	  .setDescription(`No members were found.`)

	// 1 found
	function oneMemberFound(foundNames, guildSize, data) {
		return new EmbedBuilder()
		.setColor(0xfeafea)
		.setTitle(`${foundNames.length}/${guildSize} member was found! ✅`)
		.addFields(
			{ name: `Found User:`, value: `${data}`, inline: true},
		)
	}

	function multipleMembersFound(foundNames, guildSize) {
		return new EmbedBuilder()
		.setColor(0xfeafea)
		.setTitle(`${foundNames.length}/${guildSize} members were found! ✅`)
		.setDescription(`The following users were found in the database.`)
	}

	function dataEmbed(data) {
		return new EmbedBuilder()
		.setColor(0xfeafea)
		.setDescription(`${data}`)
	}

	function checkallError() {
		return new EmbedBuilder()
		.setColor(0xfeafea)
		.setTitle(`[Error 16403]`)
		.setDescription(`Please report this when it happens, thank you!`)
	}

// <------- Prefix slash command embeds ------> //
	function prefixTooLong(prefix) {
		return new EmbedBuilder()
		.setColor(0xfeafea)
		.setTitle(`Character Limit ❌`)
		.setDescription(`The selected prefix \`${prefix}\` is too long, prefixes cannot be more than 2 characters.`)
	}

	function prefixAdded(prefix) {
		return new EmbedBuilder()
		.setColor(0xfeafea)
		.setDescription(`The selected prefix \`${prefix}\` has been saved sucessfully.  ✅`)
	}

	function prefixRemoved(prefix) {
		return new EmbedBuilder()
		.setColor(0xfeafea)
		.setDescription(`The server's selected prefix (\`${prefix}\`) has been removed, defaulting to \`-\`.  ✅`)
	}

// <------- Add slash command embeds ------> //
	const response = new EmbedBuilder()
	.setColor(0xfeafea)
	.setTitle("Fetching database...")
	.setDescription("Please wait, this interaction can take up to a minute.")

	const addingBots = new EmbedBuilder()
	.setColor(0xfeafea)
	.setTitle("Bot selected 🤖")
	.setDescription("The user you selected is a bot account, and will **not** be added to the database.")

	function alreadyInDatabase(user) {
		return new EmbedBuilder()
		.setColor(0xfeafea)
		.setDescription(`The selected user <@${user}> already exists in the database.`)
	}

	function addingToDatabase(user, responsibleStaff) {
		return new EmbedBuilder()
		.setColor(0xfeafea)
		.setDescription(`The selected user <@${user}> has been added successfully to the database. ✅`)
		.setFooter({ text: `Responsible Staff: ${responsibleStaff}` })
	}

// <------- Update slash command embeds ------> //
	const notADev = new EmbedBuilder()
	.setColor(0xfeafea)
	.setDescription(`Developer only command.`)

	const databaseUpdated = new EmbedBuilder()
	.setColor(0xfeafea)
	.setDescription(`The database has been updated successfully. ✅`)

// <------- Check message command embeds ------> //

	const noArgsFound = new EmbedBuilder()
  	.setColor(0xfeafea)
  	.setTitle(`No IDs to check ❌`)
  	.setDescription(`Please provide IDs for the bot to check.`)

  function wrongIDs(incorrectArguments) {
  	return new EmbedBuilder()
  		.setColor(0xfeafea)
			.setTitle(`Invalid IDs ❌`)
			.setDescription(`The following IDs provided are incorrect.`)
			.addFields(
				{ name: 'IDs: ', value: incorrectArguments.join('\n'), inline: true},
			)
  }

  const noMatchFound = new EmbedBuilder()
  	.setColor(0xfeafea)
  	.setTitle(`No match found ❌`)
  	.setDescription(`The ID provided was not found in the database.`)

  const noMatchsFound = new EmbedBuilder()
  	.setColor(0xfeafea)
  	.setTitle(`No match found ❌`)
  	.setDescription(`The IDs provided were not found in the database.`)

  function singularIDEmbed(foundData) {
  	return new EmbedBuilder()
  	  .setColor(0xfeafea)
  		.setTitle(`Member was found!`)
  		.addFields(
				{ name: 'ID:', value: foundData, inline: true},
			)
  }


  function multiIDs(foundLength, argsLength, foundData) {
  	return new EmbedBuilder()
  		.setColor(0xfeafea)
		  .setTitle(`${foundLength.length}/${argsLength.length} members were found!`)
		  .setDescription("The following users were found in the database.")
		  .addFields(
		    { name: 'IDs ✅:', value: foundData, inline: true},
		  )
  }

  function alotFound(foundLength, argsLength) {
  	return new EmbedBuilder()
  		.setColor(0xfeafea)
  		.setTitle(`${foundLength.length}/${argsLength.length} members were found!`)
  		.setDescription("The following users were found in the database.")
  }

// <------- Add message command embeds ------> //
  const incorrectUsage = new EmbedBuilder()
  	.setColor(0xfeafea)
  	.setTitle(`Incorrect command usage:`)
  	.setDescription("[prefix]add [id] [type] [reason] — There are only two types, note and ban. Note means that you'd like to add this ID to the database with a note/reason, Ban means that this member was banned from the server.\nUsage example: `-add 481973337288081429 ban racism & harassment.`")

  function wrongID(incorrectArgument) {
  	return new EmbedBuilder()
  		.setColor(0xfeafea)
		.setTitle(`Invalid ID ❌`)
		.setDescription(`The following ID provided is incorrect.`)
		.addFields(
			{ name: 'IDs: ', value: incorrectArgument, inline: true},
		)
  }

// <------- Serverinfo message command embeds ------> //
  function serverInfoFound(serverName, channelId, roleId, serverPrefix, serverIcon, guildId, createdTime) {
  	return new EmbedBuilder()
  		.setColor(0xfeafea)
		.setTitle(`Info for **${serverName}**`)
		.setThumbnail(`${serverIcon}`)
		.addFields(
			{ name: 'Prefix: ', value: `\`${serverPrefix}\``, inline: true},
			{ name: 'Role:', value: `<@&${roleId}>`, inline: true},
			{ name: 'Channel(s)', value: `${channelId}`, inline: true},
			{ name: 'Automatic updates:', value: "Disabled"}

		)
		.setFooter({ text: `ID: ${guildId} — Created at: ${createdTime}` })
  }

  function infoFoundWUpdates(serverName, channelId, roleId, serverPrefix, serverIcon, guildId, createdTime) {
  	return new EmbedBuilder()
  		.setColor(0xfeafea)
		.setTitle(`Info for **${serverName}**`)
		.setThumbnail(`${serverIcon}`)
		.addFields(
			{ name: 'Prefix: ', value: `\`${serverPrefix}\``, inline: true},
			{ name: 'Role:', value: `<@&${roleId}>`, inline: true},
			{ name: 'Channel(s)', value: `${channelId}`, inline: true},
			{ name: 'Automatic updates:', value: "Enabled"}

		)
		.setFooter({ text: `ID: ${guildId} — Created at: ${createdTime}` })
  }

  function serverInfoFoundServers(serverName, channelId, roleId, serverPrefix, serverIcon, guildId, createdTime) {
  	return new EmbedBuilder()
  		.setColor(0xfeafea)
		.setTitle(`Info for **${serverName}**`)
		.setThumbnail(`${serverIcon}`)
		.addFields(
			{ name: 'Prefix: ', value: `\`${serverPrefix}\``, inline: true},
			{ name: 'Role:', value: `${roleId}`, inline: true},
			{ name: 'Channel(s)', value: `${channelId}`, inline: true},
			{ name: 'Automatic updates:', value: "Disabled"}

		)
		.setFooter({ text: `ID: ${guildId} — Created at: ${createdTime}` })
  }

  function serverWithUpdates(serverName, channelId, roleId, serverPrefix, serverIcon, guildId, createdTime) {
  	return new EmbedBuilder()
  		.setColor(0xfeafea)
		.setTitle(`Info for **${serverName}**`)
		.setThumbnail(`${serverIcon}`)
		.addFields(
			{ name: 'Prefix: ', value: `\`${serverPrefix}\``, inline: true},
			{ name: 'Role:', value: `${roleId}`, inline: true},
			{ name: 'Channel(s)', value: `${channelId}`, inline: true},
			{ name: 'Automatic updates:', value: "Enabled"}
		)
		.setFooter({ text: `ID: ${guildId} — Created at: ${createdTime}` })
  }

  function serverInfoFoundRole(serverName, channelId, roleId, serverPrefix, serverIcon, guildId, createdTime) {
  	return new EmbedBuilder()
  		.setColor(0xfeafea)
		.setTitle(`Info for **${serverName}**`)
		.setThumbnail(`${serverIcon}`)
		.addFields(
			{ name: 'Prefix: ', value: `\`${serverPrefix}\``, inline: true},
			{ name: 'Role:', value: `<@&${roleId}>`, inline: true},
			{ name: 'Channel(s)', value: `${channelId}`, inline: true},
			{ name: 'Automatic updates:', value: "Disabled"}

		)
		.setFooter({ text: `ID: ${guildId} — Created at: ${createdTime}` })
  }

  function roleWithUpdates(serverName, channelId, roleId, serverPrefix, serverIcon, guildId, createdTime) {
  	return new EmbedBuilder()
  		.setColor(0xfeafea)
		.setTitle(`Info for **${serverName}**`)
		.setThumbnail(`${serverIcon}`)
		.addFields(
			{ name: 'Prefix: ', value: `\`${serverPrefix}\``, inline: true},
			{ name: 'Role:', value: `<@&${roleId}>`, inline: true},
			{ name: 'Channel(s)', value: `${channelId}`, inline: true},
			{ name: 'Automatic updates:', value: "Enabled"}

		)
		.setFooter({ text: `ID: ${guildId} — Created at: ${createdTime}` })
  }

  function serverInfoNotFound(serverName, channelId, roleId, serverPrefix, serverIcon, guildId, createdTime) {
  	return new EmbedBuilder()
  		.setColor(0xfeafea)
		.setTitle(`Info for **${serverName}**`)
		.setThumbnail(`${serverIcon}`)
		.addFields(
			{ name: 'Prefix: ', value: `\`${serverPrefix}\``, inline: true},
			{ name: 'Role:', value: `${roleId}`, inline: true},
			{ name: 'Channel(s)', value: `${channelId}`, inline: true},
			{ name: 'Automatic updates:', value: "Disabled"}

		)
		.setFooter({ text: `ID: ${guildId} — Created at: ${createdTime}` })
  }

  function notFoundWithUpdates(serverName, channelId, roleId, serverPrefix, serverIcon, guildId, createdTime) {
  	return new EmbedBuilder()
  		.setColor(0xfeafea)
		.setTitle(`Info for **${serverName}**`)
		.setThumbnail(`${serverIcon}`)
		.addFields(
			{ name: 'Prefix: ', value: `\`${serverPrefix}\``, inline: true},
			{ name: 'Role:', value: `${roleId}`, inline: true},
			{ name: 'Channel(s)', value: `${channelId}`, inline: true},
			{ name: 'Automatic updates:', value: "Enabled"}

		)
		.setFooter({ text: `ID: ${guildId} — Created at: ${createdTime}` })
  }

// <------- Prefix message command embeds ------> //
    const incorrectUsagePrefix = new EmbedBuilder()
  	.setColor(0xfeafea)
  	.setTitle(`Incorrect command usage ❌`)
  	.setDescription("`[prefix]prefix [prefixHere]` — The prefix length cannot be longer than 2 characters.")

// <------- Webhook automatic add ------> //
  function alreadyInDatabaseWebhook(user, reason, responsibleStaff, guild) {
		return new EmbedBuilder()
		.setColor(0xfeafea)
		.setDescription(`<@${user}> already exists in the database.\n**Given Reason:** Banned in ${guild} for ${reason} by ${responsibleStaff}.`)
		.setFooter({ text: `ID: ${user}` })
	}

	function addingToDatabaseWebhook(user, reason, responsibleStaff, guild) {
		return new EmbedBuilder()
		.setColor(0xfeafea)
		.setDescription(`<@${user}> has been added successfully to the database. ✅\n**Given Reason**: Banned in ${guild} for ${reason} by ${responsibleStaff}.`)
		.setFooter({ text: `ID: ${user}` })
	}

	function alreadyInDatabaseWebhookID(user, reason, responsibleStaff, guild) {
		return new EmbedBuilder()
		.setColor(0xfeafea)
		.setDescription(`<@${user}> already exists in the database.\n**Given Reason:** Banned in ${guild} for ${reason} by <@${responsibleStaff}>.`)
		.setFooter({ text: `ID: ${user}` })
	}

	function addingToDatabaseWebhookID(user, reason, responsibleStaff, guild) {
		return new EmbedBuilder()
		.setColor(0xfeafea)
		.setDescription(`<@${user}> has been added successfully to the database. ✅\n**Given Reason**: Banned in ${guild} for ${reason} by <@${responsibleStaff}>.`)
		.setFooter({ text: `ID: ${user}` })
	}

// <------- Update automatic ------> //
	const updateIncorrectUsage = new EmbedBuilder()
  	.setColor(0xfeafea)
  	.setTitle(`Incorrect command usage ❌`)
  	.setDescription("Example usage: `[prefix]autoupdate [true/false]`")

  const autoUpdateOn = new EmbedBuilder() 
		.setColor(0xfeafea)
		.setDescription(`Automatic updates have been turned \`on\`.\nThe bot will automatically add newly banned members to the database. ✅`)

	const autoUpdateOff = new EmbedBuilder() 
		.setColor(0xfeafea)
		.setDescription(`Automatic updates have been turned \`off\`.\nThe bot will **stop** adding newly banned members to the database. ✅`)
	

module.exports = { newRoleAdded, newRoleRemoved, removeRole, returnRole, infoFoundWUpdates, notFoundWithUpdates, roleWithUpdates, serverWithUpdates, autoUpdateOff, autoUpdateOn, updateIncorrectUsage, addingToDatabaseWebhookID, alreadyInDatabaseWebhookID, addingToDatabaseWebhook, alreadyInDatabaseWebhook, loadingEmbed, sentDM, incorrectUsagePrefix, serverInfoFoundRole, serverInfoFoundServers, serverInfoNotFound, serverInfoFound, wrongID, incorrectUsage, databaseUpdated, notADev, response, addingToDatabase, alreadyInDatabase, addingBots, prefixTooLong, prefixAdded, prefixRemoved, userUndetected, userDetectedServer, userDetectedBan, userDetected, userDetectedAll, embedNotAnAdmin, embedRoleAdded, embedRoleRemoved, maxRoleLimit, helpEmbed, nothingFound, oneMemberFound, multipleMembersFound, dataEmbed, checkallError, checkError, noArgsFound, wrongIDs, noMatchFound, noMatchsFound, singularIDEmbed, multiIDs, alotFound};