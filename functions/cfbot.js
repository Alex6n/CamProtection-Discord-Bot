module.exports = function cfbot(client) {
	const fs = require('fs');
	const { writeFile } = require('fs').promises; // Promisify writeFile function


	const { Octokit } = require("@octokit/rest"); // Responsible for writing to GitHub's API
	const auth = require(`../secrets.json`).githubAuth;
	const octokit = new Octokit({
	  auth: auth,
	});
 

	const serverData = require('../files/serversDB.json')
	const functions = require('../files/globalfunctions.js');
	const embeds = require('../files/embeds.js');

	let database;

	functions.updateDatabase();

	setInterval(functions.updateDatabase, 1 * 24 * 60 * 60 * 1000); // Update every day


	const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require('discord.js');


	client.on('interactionCreate', async interaction => {

		if (!interaction.isChatInputCommand()) return; 	// If the command isn't a slash command, return
		let avatarURL = client.user.displayAvatarURL(); // Client's avatar picture
		let clientUsername = client.user.username; // Client's username
		// If the member who sent the interaction isn't a moderator/admin, return
		if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return interaction.reply({ embeds: [embeds.embedNotAnAdmin], ephemeral: true});

		if(interaction.commandName === 'help') {
			(async () => {
					interaction.reply( {embeds: [embeds.sentDM] })
					client.users.fetch(interaction.member.user.id)
				    .then(user => user.send({embeds: [embeds.helpEmbed(clientUsername)]}).catch(console.error))
				    .catch(console.error);

					setTimeout(async () => {
						await interaction.deleteReply()
				    return;
					}, 5000);
			})();
		}

		if(interaction.commandName === 'prefix') {
			const serverName = interaction.member.guild.name;
			const responsePrefix = interaction.options.get('prefix').value;


			if(responsePrefix === ";") {
				interaction.reply("This prefix is currently not supported.");
				return;
			}

			if(responsePrefix.length > 2) {
				interaction.reply({embeds: [embeds.prefixTooLong(responsePrefix)]})
				return;
			}

			if(serverName in serverData) {
				if(serverData[serverName].prefix === undefined) {
					serverData[serverName].prefix = responsePrefix;

					fs.writeFile('./files/serversDB.json', JSON.stringify(serverData), 'utf8', (err) => { // Save all that to serversDB.json
						if (err) throw err;
					});

					interaction.reply({embeds: [embeds.prefixAdded(responsePrefix)]})
					return;
				}

				if(serverData[serverName].prefix) {
					if(responsePrefix === serverData[serverName].prefix) {
						interaction.reply({embeds: [embeds.prefixRemoved(responsePrefix)]});
						serverData[serverName].prefix = "-";

						fs.writeFile('./files/serversDB.json', JSON.stringify(serverData), 'utf8', (err) => { // Save all that to serversDB.json
							if (err) throw err;
						});

						return;
					} else if(responsePrefix !== serverData[serverName].prefix) {
						interaction.reply({embeds: [embeds.prefixAdded(responsePrefix)]});
						serverData[serverName].prefix = responsePrefix;

						fs.writeFile('./files/serversDB.json', JSON.stringify(serverData), 'utf8', (err) => { // Save all that to serversDB.json
							if (err) throw err;
						});

						return;
					} else {
						interaction.reply(`Error fetching prefix file.`);
						return;
					}
				}
			} else {
				serverData[serverName] = {
					prefix: responsePrefix
				} 

				fs.writeFile('./files/serversDB.json', JSON.stringify(serverData), 'utf8', (err) => { // Save all that to serversDB.json
					if (err) throw err;
				});

				interaction.reply({embeds: [embeds.prefixAdded(responsePrefix)]});
				return
			}
		}

		if(interaction.commandName === 'selectrole') {
			let serverName = interaction.member.guild.name; // Server name
			const responseRole = interaction.options.get('role'); // Selected role collection
			const responseRoleName = responseRole.role.name; // Selected role name
			const responseRoleID = responseRole.value; // Selected role ID

			if (serverName in serverData) { // If the server has a db section
				if (serverData[serverName].roles === undefined) { // If the server has a db, but no roles section, create one.
					serverData[serverName].roles = {
						[responseRoleName] : responseRoleID
					};
					interaction.reply({ embeds: [embeds.returnRole(responseRoleID)]});
					fs.writeFile('./files/serversDB.json', JSON.stringify(serverData), 'utf8', (err) => { // Save all that to serversDB.json
						if (err) throw err;
					});
					return;
				}
				if(responseRoleName in serverData[serverName].roles) { // If the role is in THAT server's db
					delete serverData[serverName].roles[responseRoleName]; // Removes it
					interaction.reply({ embeds: [embeds.removeRole(responseRoleID)]});

				} else if(!(responseRoleName in serverData[serverName].roles)) { // If the role isn't in THAT server's db
					if(Object.keys(serverData[serverName].roles).length > 0) { // Check if role is already chosen
						const serverSelectedRole = serverData[serverName].roles;
						for (let key in serverSelectedRole) {
							roleName = key;
							roleID = serverSelectedRole[key];
							break;
						}
						interaction.reply({ embeds: [embeds.maxRoleLimit(roleID)]})
					} else {
						serverData[serverName].roles[responseRoleName] = responseRoleID; // Assign the role in THAT server's db
						interaction.reply({ embeds: [embeds.returnRole(responseRoleID)]});
					}
				}
			} else if(!(serverName in serverData)) { // If the server doesn't have a db, create one.
				serverData[serverName] = {
						roles: {
						[responseRoleName] : responseRoleID
						}
					} 
					interaction.reply({ embeds: [embeds.returnRole(responseRoleID)]});
			} else {
				interaction.reply("Error `interactionCreate` event listener - selectrole error");
			}
			fs.writeFile('./files/serversDB.json', JSON.stringify(serverData), 'utf8', (err) => { // Save all that to serversDB.json
			if (err) throw err;
			});

		}

		if(interaction.commandName === 'selectchannel') {
			let serverName = interaction.member.guild.name; // Server name
			const responseChannel = interaction.options.get('channel'); // Selected channel collection
			const responseChannelName = responseChannel.channel.name; // Selected channel name
			const responseChannelID = responseChannel.value; // Selected channel ID
			if (serverName in serverData) { // If the server has a db section
				if (serverData[serverName].channels === undefined) { // If the server has a db, but no channel section, create one.
					serverData[serverName].channels = {
						[responseChannelName] : responseChannelID
					} 
					interaction.reply({ embeds: [embeds.newRoleAdded(responseChannelID)]});
					fs.writeFile('./files/serversDB.json', JSON.stringify(serverData), 'utf8', (err) => { // Save all that to serversDB.json
					if (err) throw err;
					});
					return;
				}
				if(responseChannelName in serverData[serverName].channels) { // If the channel is in THAT server's db
					delete serverData[serverName].channels[responseChannelName]; // Removes it
					interaction.reply({ embeds: [embeds.newRoleRemoved(responseChannelID)]});
				} else if(!(responseChannelName in serverData[serverName].channels)) { // If the channel isn't in THAT server's db
					serverData[serverName].channels[responseChannelName] = responseChannelID; // Assign the channel in THAT server's db
					interaction.reply({ embeds: [embeds.newRoleAdded(responseChannelID)]});
				}
			} else if(!(serverName in serverData)) { // If the server doesn't have a db, create one.
				serverData[serverName] = {
						channels: {
						[responseChannelName] : responseChannelID
						}
					} 
					interaction.reply({ embeds: [embeds.newRoleAdded(responseChannelID)]});
			} else {
				interaction.reply('Error, `interactionCreate` event listener, selectchannel error')
			}
			fs.writeFile('./files/serversDB.json', JSON.stringify(serverData), 'utf8', (err) => { // Save all that to serversDB.json
			if (err) throw err;
			});
		}

		if(interaction.commandName === 'update') {
			const fetch = await import('node-fetch');
			const userID = interaction.user.id;
			if(userID !== "481973337288081429") {
				interaction.reply({ embeds: [embeds.notADev], ephemeral: true });
			} else {
				(async () => {
					await interaction.deferReply()
					setTimeout(async () => {
						await functions.updateDatabase();
					  await interaction.editReply({ embeds: [embeds.databaseUpdated] })
					}, 350);
				})();
			}
		}

		if(interaction.commandName === 'add') {

			// manage request by request depending on name

			const bot = interaction.options.get('user').user.bot; // bot or user
			const userID = interaction.options.get('user').user.id // id
			const reason = interaction.options.get('reason').value;

			const type = interaction.options.get('type').value.toLowerCase();

			if(type !== "ban" && type !== "note") {
				return interaction.reply({embeds: [embeds.incorrectUsage]});
			}

			const serverAddedIn = interaction.guild.name;

			const responsibleUser = `${interaction.user.username}#${interaction.user.discriminator}`;
			const responsibleUserID = interaction.user.id;


			(async () => {
				if(bot === true) {
					interaction.reply({embeds: [embeds.addingBots]});
					return;
				} else {
	        listOfMembers = await functions.getDatabase();
					let found = false;
				  for (const members of listOfMembers) {
				    if (members.id === userID) {
				      found = true;
				      break;
				    } 
				    for (const key in members) {
							if (Array.isArray(members[key]) && members[key].includes(userID)) {
								found = true;
							}
						}
				  }



					if(found === true) { // user already exists in db
						interaction.reply({embeds: [embeds.alreadyInDatabase(userID)]});
					} else {
						interaction.reply({embeds: [embeds.addingToDatabase(userID, responsibleUser)]});
						let newEntries = {};
						if(type === "ban") {
							newEntries = {
						  "id" : userID,
						  "banReason" : `Banned in ${serverAddedIn} by ${responsibleUser} for ${reason}.` 
							};
						} else if (type === "note") {
							newEntries = {
						  "id" : userID,
						  "banReason" : `Note taken in ${serverAddedIn} by ${responsibleUser} for ${reason}.` 
							};
						}


						listOfMembers.push(newEntries);
						fs.writeFileSync('./files/listOfMembers.json', JSON.stringify(listOfMembers));
						const fileContents = fs.readFileSync('./files/listOfMembers.json', 'base64');
						octokit.repos.getContent({
							owner: "healthybanana3361",
							repo: "cfbotlist",
							path: "files/listOfMembers.json",
						}).then((response) => {
							const sha = response.data.sha;

							octokit.repos.createOrUpdateFileContents({
								owner: "healthybanana3361",
								repo: "cfbotlist",
								path: "files/listOfMembers.json",
								message: "Add new members to the database",
								content: fileContents,
								sha: sha,
							}).catch((error) => {
								console.error(error);
							});
						}).catch((error) => {
							console.error(error);
						});
					}
				}
			})();
		}

		if(interaction.commandName === 'check') {
			const response = interaction.options.get('user').value  // user collection
			const username = interaction.options.get('user').user.username; // username
			const userID = interaction.options.get('user').user.id // id
			const displayAvatar = interaction.options.get('user').user.displayAvatarURL();
			const discriminator = interaction.options.get('user').user.discriminator // discriminator
			const createdTimestamp = interaction.options.get('user').user.createdAt;
			const createdTimestampFunctioned = functions.calculateAge(createdTimestamp); // readable account age after function
			const createdTime = functions.UTCFormatISO(createdTimestamp);
			const joinedTimestamp = interaction.options.get('user').member.joinedTimestamp; 
			const secondsTimestamp = Math.floor(joinedTimestamp / 1000); 
			const joinedTimestampToSend = `<t:${secondsTimestamp}:R>`;
			const defaultAvatar = interaction.options.get('user').user.defaultAvatarURL;
			const completeName = `${username}#${discriminator}`;
			let serverString;
			let embedToSend = '';
			let riskPercentage;
			let risk = 0;
			let foundFirstLoop = false;
			let foundSecondLoop = false;

			risk = functions.checkDefaultAvatar(defaultAvatar, displayAvatar, risk); // Check if they have a default avatar (+5)
			const compareAccountAge = functions.compareTimestamp(createdTimestamp); // Check acc age & return [1 - 5] depending on acc age
			risk = functions.compareAccountAge(compareAccountAge, risk); // Check value of acc age, from the function and give risk accordingly
			listOfMembers = await functions.getDatabase();

			let memberObject = {
				id: "",
				banReason: "",
				server: []
			};



			for (const members of listOfMembers) {
				if (members.id === userID) {
					memberObject.id = userID;
					foundFirstLoop = true;
			    	if(!members.hasOwnProperty('server') && !members.hasOwnProperty('banReason') && members.hasOwnProperty('id')) { 
			    		memberObject = {
			    			id: userID,
			    			server: [],
			    			banReason: ""
			    		}
					}
					if(members.server) { 
						memberObject.server.push(...members.server);
					} 
					if(members.banReason) { 
			    		memberObject.banReason = members.banReason;
					} 
				}
				for (const key in members) {
					if (Array.isArray(members[key]) && members[key].includes(userID)) {
						foundSecondLoop = true;
						if(memberObject.server) {
							memberObject.server.push(key); 
						} else {
							memberObject.server = key;
						}
					}
				}
			}


			if(foundFirstLoop === true && foundSecondLoop === false) {
				risk += 5;
			}
			if(foundSecondLoop === true && foundFirstLoop === false) {
				risk += 5;
			}
			if(foundSecondLoop === true && foundFirstLoop === true) {
				risk += 5;
			}

			const serverArray = memberObject.server;
			const uniqueServers = [...new Set(serverArray)];
			memberObject.server = uniqueServers;
			risk = functions.checkServerCount(memberObject, risk); // Check how many servers they're in
		  risk = functions.checkBanReason(memberObject, risk); // Check if banned or not
		  if(memberObject.server) {
				serverString = memberObject.server.join(', ');
			}
			if (risk > 100) { // incase...
		    risk = 100;
		  }
		  riskPercentage = functions.getRiskPercentage(riskPercentage, risk); // Set the text

		  if (!memberObject.id) {
		  	delete memberObject.id;
		  }

		  if (!memberObject.banReason) {
		  	delete memberObject.banReason;
		  }

		  if(Array.isArray(memberObject.server) && memberObject.server.length === 0) {
		  	delete memberObject.server;
		  }


		  // Normal detection
		  if(!memberObject.hasOwnProperty('server') && !memberObject.hasOwnProperty('banReason') && memberObject.hasOwnProperty('id')) { 
		  	interaction.reply({embeds: [embeds.userDetected(completeName, createdTime, createdTimestampFunctioned, joinedTimestampToSend, riskPercentage, risk, userID, displayAvatar)]})
				return;
			}

			// Servers only v2 [server property only, unknown but found servers]
			if(!memberObject.hasOwnProperty('id') && !memberObject.hasOwnProperty('banReason') && memberObject.hasOwnProperty('server')) { 
				interaction.reply({embeds: [embeds.userDetectedServer(completeName, createdTime, createdTimestampFunctioned, joinedTimestampToSend,  serverString, riskPercentage, risk, userID, displayAvatar)]})
				return;
			}
			if(memberObject.server && memberObject.banReason) { // Full detection
				interaction.reply({embeds: [embeds.userDetectedAll(completeName, createdTime, createdTimestampFunctioned, joinedTimestampToSend,  serverString, memberObject.banReason, riskPercentage, risk, userID, displayAvatar)]})
		    return;
			} 

			if(memberObject.server) { // Servers only
				interaction.reply({embeds: [embeds.userDetectedServer(completeName, createdTime, createdTimestampFunctioned, joinedTimestampToSend,  serverString, riskPercentage, risk, userID, displayAvatar)]})
				return;
			} 

			if(memberObject.banReason) { // Bans only
				interaction.reply({embeds: [embeds.userDetectedBan(completeName, createdTime, createdTimestampFunctioned, joinedTimestampToSend, memberObject.banReason, riskPercentage, risk, userID, displayAvatar)]})
				return;
			} else {
				interaction.reply({embeds: [embeds.userUndetected(completeName, createdTime, createdTimestampFunctioned, joinedTimestampToSend, userID, displayAvatar)]});
			}	  
		} 

		if(interaction.commandName === 'checkall') {
			let response = interaction.options.get('id');
			if(response === undefined || response === null) {
				response = false;
			}

			const guildSize = interaction.guild.memberCount;
			interaction.guild.members.fetch() // fetch all the members of the server 
	    .then(members => {
	    	let foundNames = []; // to-be-determined names through condition
	    	let addedIds = new Set(); // duplicated ids
	    	const membersCollection = Array.from(members.values()); // Members Collection
	    	const memberIDs = membersCollection.map(members => members.user.id); // Members IDs
	    	const memberUsernames = membersCollection.map(members => `${members.user.username}#${members.user.discriminator}`) // Members Usernames
	    	const conjoined = memberIDs.map((x, i) => [x, memberUsernames[i]]); // Joining IDs and usernames

	    	(async () => {
	    		listOfMembers = await functions.getDatabase();
					for (let i = 0; i < listOfMembers.length; i++) {
						let member = listOfMembers[i]; // [Scans every property in DB]
						for (let j = 0; j < memberIDs.length; j++) {
							let ids = memberIDs[j]; // [Every ID in the array(J)]
							let collidedUsername = memberUsernames[j];
							if (member.id === ids && !addedIds.has(ids)) {
								foundNames.push(member);
								foundNames[foundNames.length - 1].username = collidedUsername; // Assign it a username
								addedIds.add(ids); // Add the ID to a set 
								break; // End
							} 
							for (let key in member) {
								if (Array.isArray(member[key])) {
									let index = member[key].indexOf(ids);
									if (index !== -1) {
										foundNames.push({ id: ids, server: key, username: collidedUsername }); // Create entry with IDs and usernames
										addedIds.add(ids);
										break;
									}
								}
							}
						}
					}

					const uniqueData = [];

					foundNames.forEach(item => {
						let existingItem = uniqueData.find(x => x.id === item.id);
						if (!existingItem) {
						  existingItem = { id: item.id, server: [], banReason: item.banReason || '', username: item.username };
						  uniqueData.push(existingItem);
						}

						if (Array.isArray(item.server)) {
						  item.server.forEach(server => {
						    existingItem.server.push(server);
						  });
						} else {
						  existingItem.server.push(item.server);
						}
					});

					uniqueData.forEach(item => {
						item.server = Array.from(new Set(item.server));
					});

					uniqueData.forEach(data => {
					  data.server = data.server.filter(value => value !== undefined);
					});


					for (let i = 0; i < uniqueData.length; i++) {
						let obj = uniqueData[i];
						for (let prop in obj) {
						  if (!obj[prop] || (Array.isArray(obj[prop]) && obj[prop].length === 0)) {
						    delete obj[prop];
						  }
						}
					}

					let formattedString = ""; // Full information
					for (const element of uniqueData) {
					  formattedString += `${element.username} — ${element.id}`;
					  if (Array.isArray(element.server) && element.server.length > 0 && element.server.some(value => value !== undefined)) {
					    formattedString += `\nServers:\n${element.server.join(', ')}`; 
					  }																																
					  if (element.banReason) {
					    formattedString += `\nNotes:\n${element.banReason}`;
					  }
					  formattedString += "\n\n";
					}

					let idsString = uniqueData.map(item => item.id); // IDs only
					const formattedIDsString = idsString.join(",\n")

					if (uniqueData.length <= 0) { // nothing found
					  (async () => {
					    await interaction.deferReply()
					    setTimeout(async () => {
					      await interaction.editReply({ embeds: [embeds.nothingFound] })
					    }, 550);
					  })();
					} else if(uniqueData.length == 1) { // 1 member found
						(async () => {
					    await interaction.deferReply()

					    setTimeout(async () => {
					      const result = await functions.returnResult(formattedString);
					      await interaction.editReply({embeds: [embeds.oneMemberFound(uniqueData, guildSize, formattedString)]})
					    }, 550);
					  })();

					} else if (uniqueData.length > 1 && uniqueData.length < 16) { // 2 - 14 members
						if(response === false || response.value === false) { // ID undefined/false
							fs.writeFile('./logs/list.txt', formattedString, (err) => { // Create the .txt file
							  if (err) throw err;
							});	
							(async () => {
					    await interaction.deferReply()

					    setTimeout(async () => {
					      const result = await functions.returnResult(formattedString);
					      await interaction.editReply({embeds: [embeds.multipleMembersFound(uniqueData, guildSize)]})
					      await interaction.channel.send({embeds: [embeds.dataEmbed(formattedString)]})
					    }, 550);
					 		})();
						} else if(response.value === true) { // ID true
							fs.writeFile('./logs/list.txt', formattedIDsString, (err) => { // Create the .txt file
							  if (err) throw err;
							});	
							(async () => {
					    await interaction.deferReply()

					    setTimeout(async () => {
					      const result = await functions.returnResult(formattedIDsString);
					      await interaction.editReply({embeds: [embeds.multipleMembersFound(uniqueData, guildSize)]})
					      await interaction.channel.send({embeds: [embeds.dataEmbed(formattedIDsString)]})
					    }, 550);
					 		})();
				    	}
					} else if(uniqueData.length > 15) { //more than 15
						if(response === false || response.value === false) { // ID undefined/false
							(async () => {
					    await interaction.deferReply()
					    fs.writeFile('./logs/list.txt', formattedString, (err) => { // Create the .txt file
							  if (err) throw err;
							});	
					    setTimeout(async () => {
					      const result = await functions.returnResult(formattedString);
					      await interaction.editReply({embeds: [embeds.multipleMembersFound(uniqueData, guildSize)]})
					      await interaction.channel.send({ files: [{attachment: './logs/list.txt', name: 'list.txt', description: 'The list of all the found members with their IDs'}] })
					    }, 550);
					 		})();
						} else if(response.value === true) { // ID true
							fs.writeFile('./logs/list.txt', formattedIDsString, (err) => { // Create the .txt file
							  if (err) throw err;
							});	
							(async () => {
					    await interaction.deferReply()

					    setTimeout(async () => {
					      const result = await functions.returnResult(formattedIDsString);
					      await interaction.editReply({embeds: [embeds.multipleMembersFound(uniqueData, guildSize)]})
					      await interaction.channel.send({ files: [{attachment: './logs/list.txt', name: 'list.txt', description: 'The list of all the found members with their IDs'}] })
					    }, 550);
					 		})();
				    }
					} else {
						(async () => {
					    await interaction.deferReply()
					    setTimeout(async () => {
					      await interaction.editReply({embeds: [embeds.checkallError()]})
					    }, 550);
					 		})();
					}
				})();
	    }).catch(console.error)
		}

		if(interaction.commandName === 'serverinfo') {
			let serverName = interaction.member.guild.name; // Server name
			let guildIcon = interaction.member.guild.iconURL();
		  if(guildIcon === null) {
		  	guildIcon = "https://cdn.discordapp.com/embed/avatars/0.png";
		  }
		  const guildId = interaction.guildId;
		  const creationDateInMs = interaction.guild.createdAt;
		  const creationDateInSeconds = Math.round(creationDateInMs / 1000);
		  const dateObj = new Date(creationDateInMs);
			const dateString = dateObj.toLocaleString("en-US", {
				month: "long",
				day: "numeric",
				year: "numeric",
				hour: "numeric",
				minute: "numeric",
				hour12: true
			});
		  	
		  let channelNames = [], channelIds = [], roleName, roleId, serverPrefix, autoupdate;

			if (serverData[serverName]) {
			  const { channels = {}, roles = {} } = serverData[serverName] ?? {};

			  if (Object.keys(channels).length > 0) {
				  const channelKeys = Object.keys(channels);
				  for (let i = 0; i < channelKeys.length; i++) {
		      	channelNames.push(channelKeys[i]);
		      	channelIds.push(channels[channelKeys[i]]);
		   		}
				}

				if (Object.keys(roles).length > 0) {
				  const roleKeys = Object.keys(roles);
				  roleName = roleKeys[0];
				  roleId = roles[roleName];
				}

				let formattedChannels = channelIds.map(channel => `<#${channel}>`).join(',\n');
				if(formattedChannels === undefined || formattedChannels === null || !(formattedChannels)) {
				  formattedChannels = "No channels selected.";
				}

				if(roleId === undefined || roleId === null || !(roleId)) {
				  roleId = "No role selected.";
				}

				serverPrefix = serverData[serverName]?.prefix ?? "-";
				autoupdate = serverData[serverName]?.autoupdate ?? "false";

				if(roleId === "No role selected." && formattedChannels !== "No channels selected." && autoupdate === "false") {
				 	interaction.reply({embeds: [embeds.serverInfoFoundServers(serverName, formattedChannels, roleId, serverPrefix, guildIcon, guildId, dateString)]})
				  return;
				} else if(roleId === "No role selected." && formattedChannels !== "No channels selected." && autoupdate === "true") {
					interaction.reply({embeds: [embeds.serverWithUpdates(serverName, formattedChannels, roleId, serverPrefix, guildIcon, guildId, dateString)]})
				  return;
				} else if(roleId !== "No role selected." && formattedChannels === "No channels selected." && autoupdate === "false") {
				  interaction.reply({embeds: [embeds.serverInfoFoundRole(serverName, formattedChannels, roleId, serverPrefix, guildIcon, guildId, dateString)]})
				  return;
				} else if(roleId !== "No role selected." && formattedChannels === "No channels selected." && autoupdate === "true") {
				  interaction.reply({embeds: [embeds.roleWithUpdates(serverName, formattedChannels, roleId, serverPrefix, guildIcon, guildId, dateString)]})
				  return;
				} else if(roleId === "No role selected." && formattedChannels === "No channels selected." && autoupdate === "false") {
				  interaction.reply({embeds: [embeds.serverInfoNotFound(serverName, formattedChannels, roleId, serverPrefix, guildIcon, guildId, dateString)]})
				  return;
				} else if(roleId === "No role selected." && formattedChannels === "No channels selected." && autoupdate === "true") {
				  interaction.reply({embeds: [embeds.notFoundWithUpdates(serverName, formattedChannels, roleId, serverPrefix, guildIcon, guildId, dateString)]})
				  return;
				} else if(roleId !== "No role selected." && formattedChannels !== "No channels selected." && autoupdate === "true") {
				  interaction.reply({embeds: [embeds.infoFoundWUpdates(serverName, formattedChannels, roleId, serverPrefix, guildIcon, guildId, dateString)]})
					return;
				} else {
				  interaction.reply({embeds: [embeds.serverInfoFound(serverName, formattedChannels, roleId, serverPrefix, guildIcon, guildId, dateString)]})
				  return;
				}
			} else {
				serverPrefix = "-";
				let formattedChannels = "No channels selected.";
				  
				if(roleId === undefined) {
				  roleId = "No role selected.";
				}

				interaction.reply({embeds: [embeds.serverInfoNotFound(serverName, formattedChannels, roleId, serverPrefix, guildIcon, guildId, dateString)]})
				return;
			}
		}

		if(interaction.commandName === 'autoupdate') {
			const guildSentIn = interaction.member.guild.name;

			if(guildSentIn in serverData) {
				if(serverData[guildSentIn].autoupdate === undefined) {
					serverData[guildSentIn].autoupdate = "true";

					fs.writeFile('./files/serversDB.json', JSON.stringify(serverData), 'utf8', (err) => { // Save all that to serversDB.json
						if (err) throw err;
					});

					interaction.reply({embeds: [embeds.autoUpdateOn]})
					return;
				}

				if(serverData[guildSentIn].autoupdate) {
					if(serverData[guildSentIn].autoupdate === "true") {
						interaction.reply( {embeds: [embeds.autoUpdateOff]} );
						serverData[guildSentIn].autoupdate = "false";

						fs.writeFile('./files/serversDB.json', JSON.stringify(serverData), 'utf8', (err) => { // Save all that to serversDB.json
							if (err) throw err;
						});
						return;

					} else if(serverData[guildSentIn].autoupdate === "false") {
						interaction.reply( {embeds: [embeds.autoUpdateOn]} );
						serverData[guildSentIn].autoupdate = "true";

						fs.writeFile('./files/serversDB.json', JSON.stringify(serverData), 'utf8', (err) => { // Save all that to serversDB.json
							if (err) throw err;
						});
						return;

					} else {
						interaction.reply(`Error fetching file.`);
						return;
					}
				}
			} else {
				serverData[guildSentIn] = {
					autoupdate: "true"
				} 

				fs.writeFile('./files/serversDB.json', JSON.stringify(serverData), 'utf8', (err) => { // Save all that to serversDB.json
					if (err) throw err;
				});

				interaction.reply( {embeds: [embeds.autoUpdateOn]} );
				return
			}
		}
	});

	client.on('guildMemberAdd', async member => {
		const joinedTimestamp = member.joinedTimestamp; // Members's join date
		const secondsTimestamp = Math.floor(joinedTimestamp / 1000); 
		const joinedTimestampToSend = `<t:${secondsTimestamp}:R>`;
		const joinedTime = functions.UTCFormat(joinedTimestamp);
		const serverJoined = member.guild.name; // The server which the user was detected in
	  	// Getting account creation date, account age
		const createdTimestamp = member.user.createdAt;
		const createdTimestampFunctioned = functions.calculateAge(createdTimestamp);
		const createdTime = functions.UTCFormatISO(createdTimestamp);
		const memberID = member.user.id; // Member ID
		const memberUsername = member.user.username; // Member username
		const displayAvatar = member.user.displayAvatarURL();
		const defaultAvatar = member.user.defaultAvatarURL;
		const discriminator = member.user.discriminator; 
		const nameToSend = `${memberUsername}#${discriminator}`;
		const logToSend = `${nameToSend}//${memberID} has joined ${serverJoined} at ${joinedTime}.`;
		let serverString;
		let embedToSend = '';
		let riskPercentage;
		let risk = 0;
		let foundFirstLoop = false;
		let foundSecondLoop = false;

		risk = functions.checkDefaultAvatar(defaultAvatar, displayAvatar, risk); // Check if they have a default avatar (+5)
		const compareAccountAge = functions.compareTimestamp(createdTimestamp); // Check acc age & return [1 - 5] depending on acc age
		risk = functions.compareAccountAge(compareAccountAge, risk); // Check value of acc age, from the function and give risk accordingly

		(async () => {
			const listOfMembers = await functions.getDatabase();
			let memberObject = {
				id: "",
				banReason: "",
				server: []
			};


			for (const members of listOfMembers) {
				if (members.id === memberID) {
					memberObject.id = memberID;
					foundFirstLoop = true;
			    if(!members.hasOwnProperty('server') && !members.hasOwnProperty('banReason') && members.hasOwnProperty('id')) { 
			    	memberObject = {
			    		id: memberID,
			    		server: [],
			    		banReason: ""
			    	}
					}
					if(members.server) { 
						memberObject.server.push(...members.server);
					} 
					if(members.banReason) { 
			    	memberObject.banReason = members.banReason;
					} 
				}
				for (const key in members) {
					if (Array.isArray(members[key]) && members[key].includes(memberID)) {
						foundSecondLoop = true;
						if(memberObject.server) {
							memberObject.server.push(key); 
						} else {
							memberObject.server = key;
						}
					}
				}
			}

			if(foundFirstLoop === true && foundSecondLoop === false) {
				risk += 10;
			}
			if(foundSecondLoop === true && foundFirstLoop === false) {
				risk += 10;
			}
			if(foundSecondLoop === true && foundFirstLoop === true) {
				risk += 10;
			}

			const serverArray = memberObject.server;
			const uniqueServers = [...new Set(serverArray)];
			memberObject.server = uniqueServers;
			risk = functions.checkServerCount(memberObject, risk); // Check how many servers they're in
		  	risk = functions.checkBanReason(memberObject, risk); // Check if banned or not
		  	if(memberObject.server) {
				serverString = memberObject.server.join(', ');
			}
			if (risk > 100) { // incase...
		    	risk = 100;
		 	}
		  	riskPercentage = functions.getRiskPercentage(riskPercentage, risk); // Set the text

		  	if (!memberObject.id) {
		  		delete memberObject.id;
		  	}

		  	if (!memberObject.banReason) {
		  		delete memberObject.banReason;
		  	}

		  	if(Array.isArray(memberObject.server) && memberObject.server.length === 0) {
		  		delete memberObject.server;
		  	}


		  	// Normal detection
		  	if(!memberObject.hasOwnProperty('server') && !memberObject.hasOwnProperty('banReason') && memberObject.hasOwnProperty('id')) { 
				embedToSend = embeds.userDetected(nameToSend, createdTime, createdTimestampFunctioned, joinedTimestampToSend, riskPercentage, risk, memberID, displayAvatar);
				functions.handleServerJoin(serverJoined, serverData, member, client, embedToSend);
				fs.writeFile('./logs/joins.txt', JSON.stringify(logToSend), 'utf8', (err) => { 
					if (err) throw err;
				});
				return;
			}

			// Servers only v2
			if(!memberObject.hasOwnProperty('id') && !memberObject.hasOwnProperty('banReason') && memberObject.hasOwnProperty('server')) { 
				embedToSend = embeds.userDetectedServer(nameToSend, createdTime, createdTimestampFunctioned, joinedTimestampToSend, serverString, riskPercentage, risk, memberID, displayAvatar);
				functions.handleServerJoin(serverJoined, serverData, member, client, embedToSend);
				fs.writeFile('./logs/joins.txt', JSON.stringify(logToSend), 'utf8', (err) => { 
					if (err) throw err;
				});
				return;
			}
			if(memberObject.server && memberObject.banReason) { // Full detection
		    embedToSend = embeds.userDetectedAll(nameToSend, createdTime, createdTimestampFunctioned, joinedTimestampToSend, serverString, memberObject.banReason, riskPercentage, risk, memberID, displayAvatar);
		    functions.handleServerJoin(serverJoined, serverData, member, client, embedToSend);
		    fs.writeFile('./logs/joins.txt', JSON.stringify(logToSend), 'utf8', (err) => { 
					if (err) throw err;
				});
		    return;
			} 

			if(memberObject.server) { // Servers only
				embedToSend = embeds.userDetectedServer(nameToSend, createdTime, createdTimestampFunctioned, joinedTimestampToSend, serverString, riskPercentage, risk, memberID, displayAvatar);
				functions.handleServerJoin(serverJoined, serverData, member, client, embedToSend);
				fs.writeFile('./logs/joins.txt', JSON.stringify(logToSend), 'utf8', (err) => { 
					if (err) throw err;
				});
				return;
			} 

			if(memberObject.banReason) { // Bans only
				embedToSend = embeds.userDetectedBan(nameToSend, createdTime, createdTimestampFunctioned, joinedTimestampToSend, memberObject.banReason, riskPercentage, risk, memberID, displayAvatar);
				functions.handleServerJoin(serverJoined, serverData, member, client, embedToSend);
				fs.writeFile('./logs/joins.txt', JSON.stringify(logToSend), 'utf8', (err) => { 
					if (err) throw err;
				});
				return;
			}
		})();
	});

	client.on('messageCreate', (message) => {


		const clientUsername = client.user.username; // Client's username
		const guildSentIn = message.guild.name; // Server which cmd was used in 
		const channelSentIn = message.channel.name // Channel ^^
		const prefix = serverData[guildSentIn]?.prefix || "-";
		const guildIdEmbed = message.guildId;
		const autoupdate = serverData[guildSentIn]?.autoupdate || "false";

	    // Checking ban embeds
		if(message.embeds.length > 0 && autoupdate === "true") {

		  	const embed = message.embeds;
		  	const embedTitle = embed[0].data?.title; // Carl-bot
			const embedFields = embed[0].data?.fields; // Dyno bot

			// Carl-bot
			if(embedTitle !== undefined && message.author.id === "235148962103951360" && embedFields === undefined) {
				const embedTitleLwrcase = embedTitle?.toLowerCase();
				if(embedTitleLwrcase === undefined) return;
				if(embedTitleLwrcase.includes("ban") && !(embedTitleLwrcase.includes("temp")) && !(embedTitleLwrcase.includes("unban"))) {
					const description = embed[0].data.description; // Description
					const user = description.split("<@")[1].split(">")[0]; // ID
					const moderator = description.split("**Responsible moderator:** ")[1].split("\n")[0]; // Moderator TAG

					let reason = description.split("**Reason:** ")[1].split("\n")[0]; // Reason
					reason = reason.replace(/\.*$/, "");

					(async () => {
						listOfMembers = await functions.getDatabase();
						let found = false;
						for (const members of listOfMembers) {
							if (members.id === user) {
								found = true;
								break;
							}
						}

						if (found === true) {
							client.channels.cache.get("1068336260785131652").send({embeds: [embeds.alreadyInDatabaseWebhook(user, reason, moderator, guildSentIn)]});
							return;
						} else {
							client.channels.cache.get("1068336260785131652").send({embeds: [embeds.addingToDatabaseWebhook(user, reason, moderator, guildSentIn)]});

							let newEntries = {
								"id": user,
								"banReason": `Banned in ${guildSentIn} by ${moderator} for ${reason}.`
							};
							functions.updateListOfMembers(newEntries);
							return;
						}
					})();
				} // Dyno bot
			} else if(embedFields !== undefined && message.author.id === "155149108183695360" && embedTitle === undefined) {
				const authorField = embed[0].data?.author;
				const authorName = authorField?.name;
				const authorNameLowercase = authorName?.toLowerCase();


				if(authorNameLowercase === undefined) return;

				if(authorNameLowercase.includes("ban") && !(authorNameLowercase.includes("temp")) && !(authorNameLowercase.includes("unban"))) {
					(async () => {
						listOfMembers = await functions.getDatabase();
						const user = embedFields[0]?.value.slice(2, -1);  
						const moderator = embedFields[1]?.value.slice(2, -1);  

						let reason = embedFields[2]?.value;
						reason = reason.replace(/\.*$/, "");

						let found = false;
						for (const members of listOfMembers) {
							if (members.id === user) {
							  found = true;
							  break;
							}
						}

						if (found === true) {
							client.channels.cache.get("1068336260785131652").send({embeds: [embeds.alreadyInDatabaseWebhookID(user, reason, moderator, guildSentIn)]});
							return;
						} else {
							client.channels.cache.get("1068336260785131652").send({embeds: [embeds.addingToDatabaseWebhookID(user, reason, moderator, guildSentIn)]});

		  				const guild = message.guild;
		  				const modId = guild.members.fetch(moderator).then(member => {
		  					const moderatorUsername = `${member.user.username}#${member.user.discriminator}`;
		  					let newEntries = {
								  "id": user,
								  "banReason": `Banned in ${guildSentIn} by ${moderatorUsername} for ${reason}.`
							  };
								functions.updateListOfMembers(newEntries);
		  					return;
		  				})
						}
					})();
				}
			}
		} 
	  
		if (message.author.bot) return;
		if (message.content.indexOf(prefix) !== 0) return;
		if (message.content.startsWith(`${prefix} `)) return;

		const args = message.content.slice(prefix.length).trim().split(/ +/g);
	  	const command = args.shift().toLowerCase();


	  	if(command === "check") {
	  		if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
	  			(async () => {
					await message.delete();
					setTimeout(async () => {
	  				return client.users.send(message.author.id, {embeds: [embeds.embedNotAnAdmin]});
					}, 500);
				})();
	  	} else {
		  	let checkArguments = args.join(' ').split(",").map(argumentProvided => argumentProvided.replace(/\s/g, '')); // Joins entire arg as a string, splits it by "," and trims all the spaces [ARRAY]
				let incorrectArguments = []; // The incorrect arguments passed
				let foundNames = [];
				let addedIds = new Set(); // duplicated ids

				let inServerVariable = false;
				const lastIndex = checkArguments.length - 1;
				if(checkArguments[lastIndex] === "join") {
					inServerVariable = true;
					checkArguments.splice(lastIndex, 1);
				}

				checkArguments = checkArguments.filter(element => { 
					if(!(element.length < 17 || /[a-zA-Z]/.test(element) == true || element.length > 19)) {
					  return true;
					}
					incorrectArguments.push(element);
				  return false;
				}); // Checks if the arguments are correct or not, if they are cool if not .push to the incorrectIDs array.

				incorrectArguments = incorrectArguments.filter(value => value.trim() !== ""); // Remove whitespaces

				(async () => {
					const listOfMembers = await functions.getDatabase();
					for (let i = 0; i < listOfMembers.length; i++) {
						let member = listOfMembers[i]; // [Scans every property in DB]
						for (let j = 0; j < checkArguments.length; j++) {
							let ids = checkArguments[j]; // [Every ID in the array(J)]
							if (member.id === ids && !addedIds.has(ids)) {
								foundNames.push(member);
								addedIds.add(ids); // Add the ID to a set 
								break; // End
							} 
							for (let key in member) {
								if (Array.isArray(member[key])) {
									let index = member[key].indexOf(ids);
									if (index !== -1) {
										foundNames.push({ id: ids, server: key }); // Create entry with IDs and usernames
										addedIds.add(ids);
										break;
									}
								}
							}
						}
					}

					const uniqueData = [];

					foundNames.forEach(item => {
						let existingItem = uniqueData.find(x => x.id === item.id);
						if (!existingItem) {
							existingItem = { id: item.id, server: [], banReason: item.banReason || ''};
							uniqueData.push(existingItem);
						}

						if (Array.isArray(item.server)) {
							item.server.forEach(server => {
							  existingItem.server.push(server);
							});
						} else {
							existingItem.server.push(item.server);
						}
					});

					uniqueData.forEach(item => {
						item.server = Array.from(new Set(item.server));
					});

					uniqueData.forEach(data => {
						data.server = data.server.filter(value => value !== undefined);
					});


					for (let i = 0; i < uniqueData.length; i++) {
						let obj = uniqueData[i];
						for (let prop in obj) {
							if (!obj[prop] || (Array.isArray(obj[prop]) && obj[prop].length === 0)) {
							  delete obj[prop];
							}
						}
					}

					let formattedString = ""; // Full information


					if (inServerVariable) {
						let serverJoinedName = guildSentIn;
						let guildSentInCache = client.guilds.cache.get(message.guildId);
					  const statusServerArray = [];
					  const promises = [];
					  for (const user of uniqueData) {
					    promises.push(guildSentInCache.members.fetch(user.id)
					      .then((member) => {
									const status = {
					        id: user.id,
					        server: user.server || [],
					        banReason: user.banReason || null,
					        inServer: true,
					      	};
			    			  statusServerArray.push(status);
					      })
					      .catch((error) => {
					        if (error.code === 10007) {
									  const status = {
										  id: user.id,
										  server: user.server || [],
										  banReason: user.banReason || null,
										  inServer: false,
										  };
										statusServerArray.push(status);
						      } 
					      })
					    );
					  }
					  (async () => {
						  await Promise.all(promises).then(() => {
					      let formattedStringServer = ""; // Full information
								for (const element of statusServerArray) {
									if(element.id) {
										formattedString += `${element.id}\n`; 
									}

								  if (Array.isArray(element.server) && element.server.length > 0 && element.server.some(value => value !== undefined)) {
								    formattedString += `**Servers:**\n${element.server.join(', ')}\n`;
								  }

								  if (element.banReason && element.banReason.length > 0) {
								    formattedString += `**Notes:**\n${element.banReason}\n`;
								  }


								  if (element.inServer === true) {
								    formattedString += `**In ${serverJoinedName}**: ✅\n`;
								  } else if (element.inServer === false) {
								    formattedString += `**In ${serverJoinedName}**: ❌\n`;
								  }

								  formattedString += "\n";
								}

								if(checkArguments.length == 0 && incorrectArguments == 0) { // No args provided
						  		message.reply({ embeds: [embeds.noArgsFound]}) 
						  		return;
						  	}

						  	if(incorrectArguments.length > 0) { // Wrong ID(s) provided
						  		message.reply({ embeds: [embeds.wrongIDs(incorrectArguments)]});
						  		return;
						  	} 

						  	if(uniqueData.length === 0 && checkArguments.length === 1) { // Nth found singular ID
				  				message.reply({ embeds: [embeds.noMatchFound] }) 
				  			} else if(uniqueData.length === 0 && checkArguments.length > 0) { // Nth found multiple IDs
				  				message.reply({ embeds: [embeds.noMatchsFound] })
				  			} else if(uniqueData.length === 1) { // 1 Member found
									message.reply({ embeds: [embeds.singularIDEmbed(formattedString)] }); 
				  			} else if(uniqueData.length > 1 && uniqueData.length < 10) { // 2 - 9 found IDs
				  				(async () => {
								    let messageToSend = await message.reply(`Bot is thinking...`);
								    messageToSend.delete()
								    message.reply({ embeds: [embeds.multiIDs(uniqueData, checkArguments, formattedString)] })
								  })();
				  			} else if(uniqueData.length >= 10) { // 20+ found IDs
						  		let data = formattedString + "\n-------------------";
									fs.writeFile('./logs/foundIDs.txt', data, (err) => {
									  if (err) throw err;
									});

									message.reply({ embeds: [embeds.alotFound(uniqueData, checkArguments)] });
									message.channel.send({files: [{attachment: './logs/foundIDs.txt', name: 'FoundIDs.txt', description: 'The list of all the found IDs'}]})
						  	}

					    })
					    .catch(console.error);
						})();
					
					} else {
						for (const element of uniqueData) {
							formattedString += `${element.id}`;
							if (Array.isArray(element.server) && element.server.length > 0 && element.server.some(value => value !== undefined)) {
								formattedString += `\n**Servers:**\n${element.server.join(', ')}`; 
							}																																
							if (element.banReason) {
								formattedString += `\n**Notes:**\n${element.banReason}`;
							}
							formattedString += "\n\n";
						}
				  	if(checkArguments.length == 0 && incorrectArguments == 0) { // No args provided
				  		message.reply({ embeds: [embeds.noArgsFound]}) 
				  		return;
				  	}
				  		
				  	if(incorrectArguments.length > 0) { // Wrong ID(s) provided
				  		message.reply({ embeds: [embeds.wrongIDs(incorrectArguments)]});
				  		return;
				  	} 

				  	if(uniqueData.length === 0 && checkArguments.length === 1) { // Nth found singular ID
				  		message.reply({ embeds: [embeds.noMatchFound] }) 

				  	} else if(uniqueData.length === 0 && checkArguments.length > 0) { // Nth found multiple IDs
				  		message.reply({ embeds: [embeds.noMatchsFound] })

				  	} else if(uniqueData.length === 1) { // 1 Member found
							message.reply({ embeds: [embeds.singularIDEmbed(formattedString)] }); 

				  	} else if(uniqueData.length > 1 && uniqueData.length < 20) { // 2 - 19 found IDs
							message.reply({ embeds: [embeds.multiIDs(uniqueData, checkArguments, formattedString)] });	
				  	} else if(uniqueData.length >= 20) { // 20+ found IDs
				  		let data = formattedString + "\n-------------------";
							fs.writeFile('./logs/foundIDs.txt', data, (err) => {
							  if (err) throw err;
							});
							message.reply({ embeds: [embeds.alotFound(uniqueData, checkArguments)] });
							message.channel.send({files: [{attachment: './logs/foundIDs.txt', name: 'FoundIDs.txt', description: 'The list of all the found IDs'}]})
				  	} else {
				  		message.reply(`[Error 16005]: messageCreate event handler.\nFound --> true\nCount --> undefined`) // err
				  	}
			  	}
		  	})();
		  }
	  }

	  	if(command === "log") {

		 	/*
			Sends me server config for easy debugging
		  	*/
		  	if (!(message.author.id === "481973337288081429")) {
	  			(async () => {
					await message.delete();
					setTimeout(async () => {
	  				return client.users.send(message.author.id, {embeds: [embeds.notADev]});
					}, 500);
				})();
	  		} else {

			  	const channel = client.channels.cache.get(message.channelId);
			  	let dataToSend = JSON.stringify(serverData, null, 2)
		  		client.users.send("481973337288081429", `\`\`\`${dataToSend}\`\`\``);
		  	}
	  	}

	  	if(command === "add") {
	  		if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
	  			(async () => {
					await message.delete();
					setTimeout(async () => {
	  				return client.users.send(message.author.id, {embeds: [embeds.embedNotAnAdmin]});
					}, 500);
				})();
			} else {
				if(args.length === 0) {
					return message.reply({embeds: [embeds.incorrectUsage]});
				}
				const id = args.shift();
		  		const type = args.shift().toLowerCase();
		  		const reason = args.join(" ");


				if(id.length < 17 || /[a-zA-Z]/.test(id) == true || id.length > 19) {
					message.reply({ embeds: [embeds.wrongID(id)]});
					return;
				}

		  	if(type !== "ban" && type !== "note") return message.reply({embeds: [embeds.incorrectUsage]});
		  	const user = client.users.fetch(id).then(userCollection => {

				if(!userCollection) return message.reply({ embeds: [embeds.wrongID(id)]});

				const userName = `${userCollection.username}#${userCollection.discriminator}`;
				const userId = userCollection.id;
				const bot = userCollection.bot;

				const responsibleUser = message.author.username+"#"+message.author.discriminator;

				(async () => {
					if(bot === true) {
						message.reply({embeds: [embeds.addingBots]});
						return;
					} else {
						listOfMembers = await functions.getDatabase();
						let found = false;
					 	for (const members of listOfMembers) {
					    	if (members.id === userId) {
					      	found = true;
					      	break;
					    	} 
					    	for (const key in members) {
								if (Array.isArray(members[key]) && members[key].includes(userId)) {
									found = true;
								}
							}
					  	}

					  	if(found === true) { 
								message.reply({embeds: [embeds.alreadyInDatabase(userId)]});
							} else {
								message.reply({embeds: [embeds.addingToDatabase(userId, responsibleUser)]});
								let newEntries = {};
								if(type === "ban") {
									newEntries = {
							  	"id" : userId,
							  	"banReason" : `Banned in ${guildSentIn} by ${responsibleUser} for ${reason}.` 
									};
								} else if (type === "note") {
									newEntries = {
							  	"id" : userId,
							  	"banReason" : `Note taken in ${guildSentIn} by ${responsibleUser} for ${reason}.` 
									};
								}

								listOfMembers.push(newEntries);
								fs.writeFileSync('./files/listOfMembers.json', JSON.stringify(listOfMembers));
								const fileContents = fs.readFileSync('./files/listOfMembers.json', 'base64');
								octokit.repos.getContent({
									owner: "healthybanana3361",
									repo: "cfbotlist",
									path: "files/listOfMembers.json",
								}).then((response) => {
									const sha = response.data.sha;
									octokit.repos.createOrUpdateFileContents({
										owner: "healthybanana3361",
										repo: "cfbotlist",
										path: "files/listOfMembers.json",
										message: "Add new members to the database",
										content: fileContents,
										sha: sha,
									}).catch((error) => {
										console.error(error);
									});
								}).catch((error) => {
									console.error(error);
								});
							}
						}
					})();
				})	
			}
	  }

	  	if(command === "serverinfo" || command === "sv?") {
	  	if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
	  		(async () => {
					await message.delete();
					setTimeout(async () => {
	  				return client.users.send(message.author.id, {embeds: [embeds.embedNotAnAdmin]});
					}, 500);
				})();
	  	} else {
	  		let guildIcon = message.guild.iconURL();
		  	if(guildIcon === null) {
		  		guildIcon = "https://cdn.discordapp.com/embed/avatars/0.png";
		  	}
		  	const guildId = message.guildId;
		  	const creationDateInMs = message.guild.createdTimestamp;
		  	const creationDateInSeconds = Math.round(creationDateInMs / 1000);
		  	const dateObj = new Date(creationDateInMs);
				const dateString = dateObj.toLocaleString("en-US", {
				  month: "long",
				  day: "numeric",
				  year: "numeric",
				  hour: "numeric",
				  minute: "numeric",
				  hour12: true
				});
		  	
		  	let channelNames = [], channelIds = [], roleName, roleId, serverPrefix, autoupdate;

				if (serverData[guildSentIn]) {
			  	const { channels = {}, roles = {} } = serverData[guildSentIn] ?? {};

			  	if (Object.keys(channels).length > 0) {
				    const channelKeys = Object.keys(channels);
				    for (let i = 0; i < channelKeys.length; i++) {
		      		channelNames.push(channelKeys[i]);
		      		channelIds.push(channels[channelKeys[i]]);
		   			 }
				  }

				  if (Object.keys(roles).length > 0) {
				    const roleKeys = Object.keys(roles);
				    roleName = roleKeys[0];
				    roleId = roles[roleName];
				  }
				  let formattedChannels = channelIds.map(channel => `<#${channel}>`).join(',\n');
				  if(formattedChannels === undefined || formattedChannels === null || !(formattedChannels)) {
				  	formattedChannels = "No channels selected.";
				  }

				  if(roleId === undefined || roleId === null || !(roleId)) {
				  	roleId = "No role selected.";
				  }
				  serverPrefix = serverData[guildSentIn]?.prefix ?? "-";
				  autoupdate = serverData[guildSentIn]?.autoupdate ?? "false";

				  if(roleId === "No role selected." && formattedChannels !== "No channels selected." && autoupdate === "false") {
				  	message.reply({embeds: [embeds.serverInfoFoundServers(guildSentIn, formattedChannels, roleId, serverPrefix, guildIcon, guildId, dateString)]})
				  	return;
				  } else if(roleId === "No role selected." && formattedChannels !== "No channels selected." && autoupdate === "true") {
						message.reply({embeds: [embeds.serverWithUpdates(guildSentIn, formattedChannels, roleId, serverPrefix, guildIcon, guildId, dateString)]})
				  	return;
				  } else if(roleId !== "No role selected." && formattedChannels === "No channels selected." && autoupdate === "false") {
				  	message.reply({embeds: [embeds.serverInfoFoundRole(guildSentIn, formattedChannels, roleId, serverPrefix, guildIcon, guildId, dateString)]})
				  	return;
				  } else if(roleId !== "No role selected." && formattedChannels === "No channels selected." && autoupdate === "true") {
				  	message.reply({embeds: [embeds.roleWithUpdates(guildSentIn, formattedChannels, roleId, serverPrefix, guildIcon, guildId, dateString)]})
				  	return;
				  } else if(roleId === "No role selected." && formattedChannels === "No channels selected." && autoupdate === "false") {
				  	message.reply({embeds: [embeds.serverInfoNotFound(guildSentIn, formattedChannels, roleId, serverPrefix, guildIcon, guildId, dateString)]})
				  	return;
				  } else if(roleId === "No role selected." && formattedChannels === "No channels selected." && autoupdate === "true") {
				  	message.reply({embeds: [embeds.notFoundWithUpdates(guildSentIn, formattedChannels, roleId, serverPrefix, guildIcon, guildId, dateString)]})
				  	return;
				  } else if(roleId !== "No role selected." && formattedChannels !== "No channels selected." && autoupdate === "true") {
				  	message.reply({embeds: [embeds.infoFoundWUpdates(guildSentIn, formattedChannels, roleId, serverPrefix, guildIcon, guildId, dateString)]})
						return;
				  } else {
				  	message.reply({embeds: [embeds.serverInfoFound(guildSentIn, formattedChannels, roleId, serverPrefix, guildIcon, guildId, dateString)]})
				  	return;
				  }
				} else {
				  serverPrefix = "-";

				  let formattedChannels = "No channels selected.";
				  
				  if(roleId === undefined) {
				  	roleId = "No role selected.";
				  }

				  message.reply({embeds: [embeds.serverInfoNotFound(guildSentIn, formattedChannels, roleId, serverPrefix, guildIcon, guildId, dateString)]})
				  return;
				}
	  	}
	  }

	  	if(command === "prefix") {
	  	if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
	  		(async () => {
					await message.delete();
					setTimeout(async () => {
					  return client.users.send(message.author.id, {embeds: [embeds.embedNotAnAdmin]});
					}, 500);
				})();
			} else {
				if(args.length === 0) {
					message.reply( {embeds: [embeds.incorrectUsagePrefix] })
					return;
				} else if (args.length > 1) {
					message.reply( {embeds: [embeds.incorrectUsagePrefix] })
					return;
				}

				const responsePrefix = args[0];

				if(responsePrefix === ";") {
					message.reply("This prefix is currently not supported.");
					return;
				}

				if(args[0].length > 2) {
					message.reply( {embeds: [embeds.prefixTooLong(responsePrefix)] })
					return;
				}

				if(guildSentIn in serverData) {
					if(serverData[guildSentIn].prefix === undefined) {
						serverData[guildSentIn].prefix = responsePrefix;

						fs.writeFile('./files/serversDB.json', JSON.stringify(serverData), 'utf8', (err) => { // Save all that to serversDB.json
							if (err) throw err;
						});

						message.reply({embeds: [embeds.prefixAdded(responsePrefix)]})
						return;
					}

					if(serverData[guildSentIn].prefix) {
						if(responsePrefix === serverData[guildSentIn].prefix) {
							message.reply({embeds: [embeds.prefixRemoved(responsePrefix)]});
							serverData[guildSentIn].prefix = "-";

							fs.writeFile('./files/serversDB.json', JSON.stringify(serverData), 'utf8', (err) => { // Save all that to serversDB.json
								if (err) throw err;
							});

							return;
						} else if(responsePrefix !== serverData[guildSentIn].prefix) {
							message.reply({embeds: [embeds.prefixAdded(responsePrefix)]});
							serverData[guildSentIn].prefix = responsePrefix;

							fs.writeFile('./files/serversDB.json', JSON.stringify(serverData), 'utf8', (err) => { // Save all that to serversDB.json
								if (err) throw err;
							});

							return;
						} else {
							message.reply(`Error fetching prefix file.`);
							return;
						}
					}
				} else {
					serverData[guildSentIn] = {
						prefix: responsePrefix
					} 

					fs.writeFile('./files/serversDB.json', JSON.stringify(serverData), 'utf8', (err) => { // Save all that to serversDB.json
						if (err) throw err;
					});

					message.reply({embeds: [embeds.prefixAdded(responsePrefix)]});
					return
				}
			}
		}

		if(command === "autoupdate" || command === "au") {
	  	if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
	  		(async () => {
					await message.delete();
					setTimeout(async () => {
					  return client.users.send(message.author.id, {embeds: [embeds.embedNotAnAdmin]});
					}, 500);
				})();
			} else {
				if(args.length > 0) {
					message.reply( {embeds: [embeds.updateIncorrectUsage] })
					return;
				} 

	  		const autoupdateValue = serverData[guildSentIn]?.autoupdate || "false";
				if(guildSentIn in serverData) {
					if(serverData[guildSentIn].autoupdate === undefined) {
						serverData[guildSentIn].autoupdate = "true";

						fs.writeFile('./files/serversDB.json', JSON.stringify(serverData), 'utf8', (err) => { // Save all that to serversDB.json
							if (err) throw err;
						});

						message.reply({embeds: [embeds.autoUpdateOn]})
						return;
					}
					if(serverData[guildSentIn].autoupdate) {
						if(serverData[guildSentIn].autoupdate === "true") {
							message.reply( {embeds: [embeds.autoUpdateOff]} );
							serverData[guildSentIn].autoupdate = "false";

							fs.writeFile('./files/serversDB.json', JSON.stringify(serverData), 'utf8', (err) => { // Save all that to serversDB.json
								if (err) throw err;
							});
							return;

						} else if(serverData[guildSentIn].autoupdate === "false") {
							message.reply( {embeds: [embeds.autoUpdateOn]} );
							serverData[guildSentIn].autoupdate = "true";

							fs.writeFile('./files/serversDB.json', JSON.stringify(serverData), 'utf8', (err) => { // Save all that to serversDB.json
								if (err) throw err;
							});
							return;

						} else {
							message.reply(`Error fetching file.`);
							return;
						}
					}
				} else {
					serverData[guildSentIn] = {
						autoupdate: "true"
					} 

					fs.writeFile('./files/serversDB.json', JSON.stringify(serverData), 'utf8', (err) => { // Save all that to serversDB.json
						if (err) throw err;
					});

					message.reply( {embeds: [embeds.autoUpdateOn]} );
					return
				}
			}
		}
	 
		if(command === "update") {
			const authorId = message.author.id;
			const channel = message.channelId;
			const messageId = message.id;
			if(authorId !== "481973337288081429") {
				(async () => {
					await message.delete();
					setTimeout(async () => {
					  return client.users.send(authorId, { embeds: [embeds.notADev]});
					}, 500);
				})();
			} else {
				(async () => {
					const fetch = await import('node-fetch');
					const msg = await message.channel.send({ embeds: [embeds.loadingEmbed] });
					setTimeout(async () => {
						await functions.updateDatabase();
						msg.delete();
					  await message.channel.send({ embeds: [embeds.databaseUpdated] })
					}, 1000);
				})();
			}
		}

		if(command === "help") {
			if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
				(async () => {
					await message.delete();
					setTimeout(async () => {
	  				return client.users.send(message.author.id, {embeds: [embeds.embedNotAnAdmin]});
					}, 500);
				})();
			} else {
				(async () => {
					await message.delete();
					setTimeout(async () => {
						return client.users.send(message.author.id, {embeds: [embeds.helpEmbed(clientUsername)]});
					}, 500);
				})();
			}
		}

		if(command === "embed") {
			const rulesEmbed = new EmbedBuilder()
			.setColor(0xfeafea)
			.setTitle("Welcome to LGBTQ+ Egypt")
			if(message.author.id !== "481973337288081429") return;
			client.channels.cache.get("1052910307061792811").send({embeds: [rulesEmbed]});
		}
	});
}
