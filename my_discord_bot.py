import discord
import asyncio


client = discord.Client()

# Replace this with the ID of your AFK channel
afk_channel_id = 1073547432278904886

# Dictionary to keep track of members who have agreed to open their camera in each public channel
members_agreed = {}


@client.event
async def on_voice_state_update(member, before, after):
    print(after.channel.overwrites_for(after.channel.guild.default_role))
    return
    # Only monitor members in public channels (not AFK or private channels)
    if not isinstance(member, discord.Member) or not isinstance(after.channel, discord.VoiceChannel) or after.channel.permissions_for(after.channel.guild.default_role).permissions.connect:
        return
    if after.channel.id == afk_channel_id:
        return
    # Check if the member opened their camera
    if after.self_video:
        print(f'{member.name} opened their camera in {after.channel.name}')

        # Move member to the AFK channel
        await member.move_to(client.get_channel(afk_channel_id))
        await member.move_to(before.channel)

        # Send a warning message to the member
        dm_channel = await member.create_dm()
        
        # Check if the channel ID is not None and the member has agreed to open their camera in this channel
        if after.channel.id and member.id in members_agreed.get(after.channel.id, []):
            await dm_channel.send(f'You have already agreed to open your camera in {after.channel.name}. If you do not want to be moved to the AFK channel again, please refrain from opening your camera in this channel again.')
        else:
            await dm_channel.send(f'WARNING: You have opened your camera in a public channel ({after.channel.name}). Please note that this channel is visible to all members of the server. Do you still want to proceed? (type \'yes\' to confirm)')

            # Wait for the member's response
            def check(message):
                return message.author == member and message.content.lower() == 'yes'

            try:
                response = await client.wait_for('message', timeout=10.0, check=check)
            except asyncio.TimeoutError:
                await dm_channel.send('You did not respond in time. Moving you to the AFK channel.')
            else:
                # Add member to the list of those who have agreed to open their camera in this channel
                members_agreed.setdefault(after.channel.id, set()).add(member.id)
                await dm_channel.send(f'Thank you for confirming. You will not be moved to the AFK channel again if you open your camera in {after.channel.name}.')

    # Check if the member closed their camera
    if before.self_video and not after.self_video:
        print(f'{member.name} closed their camera in {before.channel.name}')

        # Remove member from the list of those who have agreed to open their camera in this channel
        members_agreed.setdefault(before.channel.id, set()).discard(member.id)

        # Move member back to the original channel
        await member.move_to(before.channel)
        
client.run('ODA2ODE4OTgyMzM3NDQ1ODk5.GBS6wQ.mcnTW55-vucQ-Fpo2JCQ42XjYrxcKJP8qB6rVw')
