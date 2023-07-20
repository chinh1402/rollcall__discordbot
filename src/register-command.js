require('dotenv').config();
// command handler 

// server id and bot id needed

const { REST, Routes} = require('discord.js');

const commands = [
    {
        name: 'dd',
        description: 'proceed rollcalling',
    },
    {
        name:'key',
        description: 'this shows the definition for key',
    },
    {
        name:'wt',
        description: 'week table, as well as progress of the two person',
    },
    {
        name:'help',
        description: 'what u expect from typing help?',
    },
    {
        name:'stats',
        description: 'This shows rollcall stats for no reason',
    },
    {
        name:'sync',
        description:'This will syncing the datas when the bot is offline'
    },
    {
        name: 'r',
        description:'Show a random number from 1-100'
    },
]

const rest = new REST({version: '10'}).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("registering slash commands");

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID,process.env.GUILD_ID),
            {body : commands }
        )

        console.log("finish registering slash commands");
    } catch (error) {
        console.log(`There was an error: ${error}`);
    }
})()