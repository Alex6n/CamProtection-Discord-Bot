const fs = require('fs');
const { writeFile } = require('fs').promises; // Promisify writeFile function

const { Octokit } = require("@octokit/rest"); // Responsible for writing to GitHub's API
const auth = require(`../secrets.json`).githubAuth;
const octokit = new Octokit({
  auth: auth,
});

// fetch & handle db usage
async function getDatabase() {
  const fetch = await import('node-fetch');
  if(fs.existsSync('./files/listOfMembers.json')) {
    const rawListData = fs.readFileSync('./files/listOfMembers.json');
    const cachedDatabase = JSON.parse(rawListData);
    return cachedDatabase;
  } else {
    const response = await fetch.default('https://raw.githubusercontent.com/healthybanana3361/cfbotlist/main/listOfMembers.json');
    const database = await response.json();
    await writeFile('./files/listOfMembers.json', JSON.stringify(database));
    return database;
  }
} 

// update database
async function updateDatabase() {
  const fetch = await import('node-fetch');
  try {
    const response = await fetch.default('https://raw.githubusercontent.com/healthybanana3361/cfbotlist/main/listOfMembers.json');
    const database = await response.json();
    await writeFile('./files/listOfMembers.json', JSON.stringify(database));
    console.log(`Database has been updated.`);
  } catch (error) {
    console.error(error);
  }
}

// standard format
function formatTimestamp(timestamp) {
  const now = new Date().getTime();
  const timeDiff = now - timestamp;

  const yearInMs = 31536000000;
  const monthInMs = 2628000000;
  const dayInMs = 86400000;
  const hourInMs = 3600000;

  let result = '';

  const years = Math.floor(timeDiff / yearInMs);
  if (years > 0) {
    result += `${years} years`;
  }

  const remainder = timeDiff % yearInMs;
  const months = Math.floor(remainder / monthInMs);
  if (months > 0) {
    result += `${years > 0 ? ', ' : ''}${months} months`;
  }

  const days = Math.floor((remainder % monthInMs) / dayInMs);
  if (days > 0) {
    result += `${years > 0 || months > 0 ? ', ' : ''}${days} days`;
  }

  const hours = Math.floor((remainder % dayInMs) / hourInMs);
  if (hours > 0) {
    result += `${years > 0 || months > 0 || days > 0 ? ', ' : ''}${hours} hours`;
  }

  return result === '' ? 'Just now' : result + ' ago';
}

// Returns data in async functions
function returnResult(toReturn) {
  return toReturn;
}

// convert to UTC (y/m/d/d/h/s format)
function UTCFormat(inputTime) {
  const joinedDate = new Date(parseInt(inputTime));
  const localOffset = joinedDate.getTimezoneOffset() / 60; // in hours
  const cairoOffset = -2; // Cairo time zone is UTC+2
  const adjustedDate = new Date(joinedDate.getTime() + (cairoOffset - localOffset) * 60 * 60 * 1000);

  const year = adjustedDate.getFullYear();
  const month = (adjustedDate.getMonth() + 1).toString().padStart(2, '0');
  const day = adjustedDate.getDate().toString().padStart(2, '0');
  let hours = adjustedDate.getHours();
  const minutes = adjustedDate.getMinutes().toString().padStart(2, '0');
  const seconds = adjustedDate.getSeconds().toString().padStart(2, '0');

  let period = 'AM';
  if (hours >= 12) {
    period = 'PM';
    hours = hours % 12;
  }
  if (hours === 0) {
    hours = 12;
  }
  hours = hours.toString().padStart(2, '0');

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds} ${period}`;
}

function UTCFormatISO(inputTime) {
  const joinedDate = new Date(inputTime);
  const localOffset = joinedDate.getTimezoneOffset() / 60; // in hours
  const cairoOffset = -2; // Cairo time zone is UTC+2
  const adjustedDate = new Date(joinedDate.getTime() + (cairoOffset - localOffset) * 60 * 60 * 1000);

  const year = adjustedDate.getFullYear();
  const month = (adjustedDate.getMonth() + 1).toString().padStart(2, '0');
  const day = adjustedDate.getDate().toString().padStart(2, '0');
  let hours = adjustedDate.getHours();
  const minutes = adjustedDate.getMinutes().toString().padStart(2, '0');
  const seconds = adjustedDate.getSeconds().toString().padStart(2, '0');

  let period = 'AM';
  if (hours >= 12) {
    period = 'PM';
    hours = hours % 12;
  }
  if (hours === 0) {
    hours = 12;
  }
  hours = hours.toString().padStart(2, '0');

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds} ${period}`;
}

// Calculate the account age of a member in non-standard time format
function calculateAge(inputTime) {
  let accountCreationDate = new Date(inputTime);
  let currentDate = new Date();
  let years = currentDate.getFullYear() - accountCreationDate.getFullYear();
  let months = currentDate.getMonth() - accountCreationDate.getMonth();
  let days = currentDate.getDate() - accountCreationDate.getDate();
  if (days < 0) {
    days += new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    months--;
  }
  if (months < 0) {
    months += 12;
    years--;
  }
  let ageString = '';
  if (years > 0) {
    ageString += `${years} year${years > 1 ? 's' : ''}`;
  }
  if (months > 0) {
    if (ageString.length > 0) {
      ageString += ', ';
    }
    ageString += `${months} month${months > 1 ? 's' : ''}`;
  }
  if (days > 0) {
    if (ageString.length > 0) {
      ageString += ', ';
    }
    ageString += `${days} day${days > 1 ? 's' : ''}`;
  }
  ageString += ' ago';
  return ageString;
}

// Check slash command
// Compare time to variable
function compareTimestamp(timestamp) {
  const now = new Date().getTime();
  const timeDiff = now - new Date(timestamp).getTime();
  const dayInMs = 86400000;
  const weekInMs = dayInMs * 7;
  const monthInMs = dayInMs * 30;
  const twoMonth = dayInMs * 60;

  if (timeDiff < dayInMs) {
    return 1;
  } else if (timeDiff < weekInMs) {
    return 2;
  } else if (timeDiff < monthInMs) {
    return 3;
  } else if (timeDiff < twoMonth) {
    return 4;
  } else {
    return 5;
  }
}

// Calculate risk
function getRiskPercentage(riskText, riskValue) {
  if (riskValue === 0) {
    riskText = '⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛';
  } else if (riskValue > 0 && riskValue <= 10) {
    riskText = '🟪' + '⬛'.repeat(9);
  } else if (riskValue > 10 && riskValue <= 20) {
    riskText = '🟪'.repeat(2) + '⬛'.repeat(8);
  } else if (riskValue > 20 && riskValue <= 30) {
    riskText = '🟪'.repeat(3) + '⬛'.repeat(7);
  } else if (riskValue > 30 && riskValue <= 40) {
    riskText = '🟪'.repeat(4) + '⬛'.repeat(6);
  } else if (riskValue > 40 && riskValue <= 50) {
    riskText = '🟪'.repeat(5) + '⬛'.repeat(5);
  } else if (riskValue > 50 && riskValue <= 60) {
    riskText = '🟪'.repeat(6) + '⬛'.repeat(4);
  } else if (riskValue > 60 && riskValue <= 70) {
    riskText = '🟪'.repeat(7) + '⬛'.repeat(3);
  } else if (riskValue > 70 && riskValue <= 85) {
    riskText = '🟪'.repeat(8) + '⬛'.repeat(2);
  } else if (riskValue > 80 && riskValue <= 90) {
    riskText = '🟪'.repeat(9) + '⬛'.repeat(1);
  } else if (riskValue > 90 && riskValue <= 100) {
    riskText = '🟪'.repeat(10);
  } else {
    riskText = '';
  }
  return riskText;
}

// Check how many servers they're in [1: different format, toCheck.server]
function checkServerCount(toCheck, riskValue) {
  if(toCheck.server) {
    if(toCheck.server.length === 1) {
      riskValue += 5;
    } else if(toCheck.server.length > 1 && toCheck.server.length < 4) { // 2-3
      riskValue += 10;
    } else if(toCheck.server.length >= 4 && toCheck.server.length < 6) { // 4-5
      riskValue += 20;
    } else if(toCheck.server.length >= 6 && toCheck.server.length < 8) { // 6-7
      riskValue += 30;
    } else if(toCheck.server.length > 9) {
      riskValue += 35;
    }
  }
  return riskValue;
}

// Check if they've been banned before or not
function checkBanReason(toCheck, riskValue) {
  if(toCheck.banReason.length > 0) {
    riskValue += 30;
  }
  return riskValue;
}

// Check how many servers they're in [2: different format, toCheck.length]
function checkServerCountSingular(toCheck, riskValue) {
  if(toCheck.length === 1) {
    riskValue += 15;
  } else if(toCheck.length > 1 && toCheck.length < 4) {
    riskValue += 20;
  } else if(toCheck.length > 3) {
    riskValue += 35;
  }
  return riskValue;
}

// Check if default avatar
function checkDefaultAvatar(defaultPicture, displayPicture, riskValue) {
  if(defaultPicture === displayPicture) {
      riskValue += 5;
    }
  return riskValue;
}

// compare account age to input
function compareAccountAge(comparisonInput, riskValue) {
  if(comparisonInput === 1) {
    riskValue += 25;
  } else if (comparisonInput === 2) {
    riskValue += 20;
  } else if (comparisonInput === 3) {
    riskValue += 15;
  } else if(comparisonInput === 4) {
    riskValue += 5;
  }
  return riskValue;
}

// Handle server joins
function handleServerJoin(serverJoined, serverData, member, client, embedToSend) {
  if (!serverData[serverJoined]) return console.log(`${serverJoined} does not have a DB section.`);

  if (serverData[serverJoined].hasOwnProperty("roles") && Object.keys(serverData[serverJoined].roles).length > 0) {
    let roleToRetrieve = Object.values(serverData[serverJoined].roles);
    let roleToAssign = roleToRetrieve.shift();
    const guildJoined = client.guilds.cache.get(member.guild.id);
    const role = guildJoined.roles.cache.find((r) => r.id === roleToAssign);
    if (role.editable === true) {
      member.roles.add(roleToAssign);
    } else {
      const unavailRole = serverData[serverJoined].roles;
      let roleName;
      let roleID;
      for (let key in unavailRole) {
        roleName = key;
        roleID = unavailRole[key];
        break;
      }
      console.log(`Role: ${roleName}/${roleID} is not editable in ${guildJoined}.`);
    }
  }

  if (serverData[serverJoined].hasOwnProperty("channels") && Object.keys(serverData[serverJoined].channels).length > 0) {
    handleEmbedSend(serverData[serverJoined].channels, client, embedToSend);
  } else {
    console.log(`${serverJoined} does not have a channel set.`);
  }
}

// Handle where to send embeds
function handleEmbedSend(channels, client, embed) {
  for (const channelId in channels) {
    let ids = channels[channelId];
    let channel = client.channels.cache.get(ids);
    if(channel !== undefined) {
      let avail = channel.viewable;
      if (avail === false) {
        console.log(`#${channel.name} in ${channel.guild.name} is unavailable to be accessed by the bot.`);
      } else if (avail === true) {
        channel.send({ embeds: [embed] });
      } else {
        console.log(`[Error 16005]\n"memberAdd" Event Handler: condition --> true`);
      }
    } else {
      console.log(`[Error 16006]\n"memberAdd" Event Handler: condition --> true, channel is not available or may have been deleted.`);
    } 
  } 
}

async function updateListOfMembers(newEntries) {
  listOfMembers.push(newEntries);
  fs.writeFileSync('listOfMembers.json', JSON.stringify(listOfMembers));
  const fileContents = fs.readFileSync('listOfMembers.json', 'base64');
  try {
    const response = await octokit.repos.getContent({
      owner: "healthybanana3361",
      repo: "cfbotlist",
      path: "listOfMembers.json"
    });
    const sha = response.data.sha;
    await octokit.repos.createOrUpdateFileContents({
      owner: "healthybanana3361",
      repo: "cfbotlist",
      path: "listOfMembers.json",
      message: "Add new members to the database",
      content: fileContents,
      sha: sha,
    });
  } catch (error) {
    console.error(error);
  }
}

// adds Members to db
function addMember(id, banReason = '', listOfMembersFilePath) {
  let newMember;
  if (banReason === false) {
    newMember = { id: id };
  } else {
    newMember = { id: id, banReason: banReason };
  }

  let listOfMembers = JSON.parse(fs.readFileSync(listOfMembersFilePath, 'utf8'));
  listOfMembers.push(newMember);

  fs.writeFile(listOfMembersFilePath, JSON.stringify(listOfMembers, null, 2), (err) => {
    if (err) throw err;
    console.log('Member added successfully');
  });
  delete require.cache[require.resolve(listOfMembersFilePath)];
}

module.exports = { updateListOfMembers, getDatabase, updateDatabase, addMember, UTCFormatISO, calculateAge, getRiskPercentage, compareTimestamp, UTCFormat, formatTimestamp, checkServerCount, checkBanReason, checkServerCountSingular, checkDefaultAvatar, compareAccountAge, handleServerJoin, handleEmbedSend, returnResult };