require('dotenv').config();

const fs = require('fs');
const csv = require('csvtojson');
const { Parser } = require('json2csv');
const { Client, IntentsBitField, EmbedBuilder, TextChannel} = require('discord.js');

const client =  new Client(
    {
        intents: [
            IntentsBitField.Flags.Guilds, 
            IntentsBitField.Flags.GuildMembers,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.MessageContent,
        ],
    }
);

let currentDateData = null; // return the date specified, in this instance, today
let currentWeekData = null; // return the week specified by the date

const rollCallData = (async () => {
    try {
        // Tracking if the date is today, then proceed;
        // 0. get Today data then compare it with the data in rollcallcsv --> Done
        // 1. Adding 1 year worth of data into the csv --> Done
        // 2. Only fetch the week that has today's date
        // 3. .. proceed?
        
        // fetch the whole week which has the day of today
        let data = await csv().fromFile("rollcall.csv");

        let currentDate = new Date();
        let dateFormat = currentDate.getDate() + "/" + (currentDate.getMonth() + 1);
        
        let currentDateIndex = null; // return the index of today's date

        // find today's date
        data.find((value, index) => 
        (value.Date === 
            dateFormat
            // "13/2"
            ) ? 
        (currentDateData = value, currentDateIndex = index, true) : false);

        // find week's data base on today's data
        let subtractObj = {'Mon' : 0, 'Tue' : 1, 'Wed' : 2, 'Thu' : 3, 'Fri' : 4 , 'Sat': 5, 'Sun': 6}
        
        currentWeekData = [];
        let iterationStart = currentDateIndex - subtractObj[currentDateData.DoW]
        for (let i=iterationStart;i<iterationStart+7;i++) {
            currentWeekData.push(data[i]);
        }

        return [currentDateData, currentWeekData, data, currentDateIndex];
    } catch {
        console.log ("error while getting datas from file");
    }
   
})()

const historyRC = (async () => {
    try {
        let data = await csv().fromFile("historyRC.csv");
        return data;
    } catch {
        console.log("error while getting data from history file");
    }
})()

// kept this for testing purposes
client.once('ready', async () => {
    console.log("bot is ready");
    const guildId = process.env.GUILD_ID; // Replace with your guild ID
    const channelId = process.env.TESTCHANNEL_ID; // Replace with your channel ID
    
    const today = new Date();
    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000); // Calculate two days before today
  
    const guild = await client.guilds.fetch(guildId);
    const channel = guild.channels.cache.get(channelId);
    if (channel.type == 0) {
      const messages = await channel.messages.fetch({ limit: 100 }); // Fetch recent messages (max limit: 100)
  
      messages.forEach((message) => {
        // console.log(message.content)
        if (message.createdAt >= twoDaysAgo && message.createdAt <= today 
            && !message.author.bot && message.content.startsWith("/")) {
          console.log(`${message.author.username}: ${message.content}`);
          if (message.content.includes('/dd')) {
            const timestamp = message.createdAt.toLocaleString();
            console.log(timestamp);
          }
        }
      });
    }
  });

client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    if (!(message.channelId == 1124756100454035476)) return;
    if (message.content.includes("¯\_(ツ)_/¯")) {
        message.reply ("¯\_(ツ)_/¯");
    }
    if (message.content.includes(" gà")) {
        message.reply("🐔🐔🐔")
    }
})

client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand) return;
    if (!(interaction.channelId == 1124756100454035476 || interaction.channelId == 1124956025074745424)) return;
    
    if (interaction.commandName === 'key') {
        interaction.reply("key la chia khoa (said by some random furry)");
    }

    if (interaction.commandName === 'help') {
        const embed = new EmbedBuilder()
            .setColor("Random")
            .addFields(
                {name: "Các lệnh được dùng",
                value: "/dd: Điểm danh cho ngày hiện tại" + "\n"
                + "/wt: Xem bảng tuần" + "\n"
                + "/stats: Xem tổng điểm từ đầu đến giờ" + "\n"
                + "/help: Xem bảng này",
                inline:false
                }
            )
        interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === 'wt') {
            rollCallData.then((result) =>  {
                let [currentDate, data, rcdb] = result;

                // data is the week table data
                
                const daysOfWeek = data.map(item => item.DoW);
                const dates = data.map(item => item.Date);
                const sP1 = data.map(item => item.sP1);
                const sP2 = data.map(item => item.sP2);
                const sepvar = '\u2002';

                const rightyDoW = daysOfWeek.map(day => day.padEnd(6, sepvar));
                const rightyDates = dates.map(date => date.padEnd(6, sepvar));
                const rightysP1 = sP1.map(num => num.padEnd(6, sepvar));
                const rightysP2 = sP2.map(num => num.padEnd(6, sepvar));
                
                historyRC.then((output) => {
                    let historyFieldDatas = '';
                    for (let i=output.length-1; i>output.length-5 ; i--) {
                        if (i<0) break;
                        historyFieldDatas += (output.length - i) + "." + output[i].usrName + ": " 
                        +output[i].dateProceed+ " at " + output[i].timeProceed + "\n";
                    }

                    if (!historyFieldDatas) {
                        historyFieldDatas = "sorry, there's no data found";
                    }

                    let totalsP1 = rcdb.reduce((acc, curr) => {
                        let value = parseInt(curr.sP1);
                        return acc += value;
                    }, 0)
        
                    let totalsP2 = rcdb.reduce((acc, curr) => {
                        let value = parseInt(curr.sP2);
                        return acc += value;
                    }, 0)

                    const embed = new EmbedBuilder()
                    .setColor('Random')
                    .addFields(
                        // Date table
                        {name: '\u200B', value: '\u200B \n \n ching3057 \n phgbui', inline: true},
                        {name: '\u200B', 
                        value: rightyDoW[0] + "  " + rightyDoW[1] + "  " + rightyDoW[2] + "\n" 
                        + rightyDates[0] + " " + rightyDates[1] + " " +  rightyDates[2] + "\n" 
                        + rightysP1[0] + rightysP1[1] + rightysP1[2] + "\n" 
                        + rightysP2[0] + rightysP2[1] + rightysP2[2]  , inline: true},      
                        
                        {name: '\u200B', 
                        value: rightyDoW[3] + "  " + rightyDoW[4] + "  " + rightyDoW[5] + "  " + rightyDoW[6] +"\n" 
                        + rightyDates[3] + " " + rightyDates[4] + " " +  rightyDates[5] + " " +  rightyDates[6] + "\n" 
                        + rightysP1[3] + rightysP1[4] + rightysP1[5] + " " + rightysP1[6] + "\n" 
                        + rightysP2[3] + rightysP2[4] + rightysP2[5] + rightysP2[6]  , inline: true},  
                    )
                    .addFields(
                        {
                            name: "\u200B",
                            value: "\u200B",
                            inline:false
                        },
                        {name: "Total score: ", value:  ""
                        + "ching3057: " + totalsP1 + "\nphgbui: " + totalsP2, inline:false},
                        {
                            name: "\u200B",
                            value: "tiền fuoq nợ: " + (totalsP1 - totalsP2) + "k",
                            inline: false, 
                        }
                    )
                    
                    interaction.reply({ embeds: [embed] });
                })
                    
            })
        
    }

    if (interaction.commandName === 'r') {
        let message = (Math.floor(Math.random() * 100) + 1).toString();
        interaction.reply("Random number: " + message);
    }

    if (interaction.commandName === 'stats') {
        rollCallData.then((result) => {
            let [value1, value2, data, value3] = result;
            let totalsP1 = data.reduce((acc, curr) => {
                let value = parseInt(curr.sP1);
                return acc += value;
            }, 0)

            let totalsP2 = data.reduce((acc, curr) => {
                let value = parseInt(curr.sP2);
                return acc += value;
            }, 0)

            const embed = new EmbedBuilder()
            .setColor("Random")
            .addFields(
                {name: "Total score: ", value:  ""
                + "ching3057: " + totalsP1 + "\nphgbui: " + totalsP2, inline:false},

                {name: "\u200B", value: "These value were calculated on how"
                + "active each player are when rollcalling \n To check weekly table, do /wt", inline:false},

                {
                    name: "\u200B",
                    value: "tiền fuoq nợ: " + (totalsP1 - totalsP2) + "k",
                    inline: false, 
                }
            )

            interaction.reply({ embeds: [embed] });
        })
    }

    if (interaction.commandName === 'dd') {
        rollCallData.then((result) => {
            let [currentDateData, currentWeekData, data, currentDateIndex] = result;
            let username = interaction.user.username;
            let userID = interaction.user.id;

            if (userID == 457887714465939457){
                data[currentDateIndex].sP1 = "10";
                interaction.reply("proceed rollcalled for user: " + username + "; do /wt");
            } else if (userID == 1120710785434398790){
                data[currentDateIndex].sP2 = "10";
                interaction.reply("proceed rollcalled for user: " + username + "; do /wt");
            } else {
                interaction.reply("something went wrong, your id is: " + userID, " your username: " + username);
            }
            let newData = new Parser({fields: ["DoW","Date","sP1","sP2"]}).parse(data);
            fs.writeFileSync("rollcall.csv", newData);

            // save execute time data onto historyRC file
            const currentDate = new Date();

            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1; // January is month 0
            const currentDay = currentDate.getDate();

            const currentHour = currentDate.getHours();
            const currentMinute = currentDate.getMinutes();
            const currentSecond = currentDate.getSeconds();

            const dateProceed = currentDay + "/" + currentMonth + "/" + currentYear;
            const timeProceed = currentHour + ":" + currentMinute + ":" + currentSecond;
            
            historyRC.then((output) => {
                const parseTimeData = {usrName: username, dateProceed : dateProceed, timeProceed: timeProceed}
                output.push(parseTimeData);
                let historyData = new Parser({fields: ["usrName", "dateProceed","timeProceed"]}).parse(output);
                fs.writeFileSync("historyRC.csv", historyData);
            })
            
        })
    }

    if (interaction.commandName === 'sync') {

        // This command is ran on launch also

        // Check if the /dd 
        // of the specified person 
        // has ran the comment
        // in the specific bot channel
        // in that specific time
        // to assign in
        // that specific time
        // Check for today, yesterday and the other day

        // This cant work, since discord doesnt allow you to track for / in message, we're doomed :(
        interaction.reply("Syncing... failed, since the coder hasnt made this function yet");


    }
})

client.login(process.env.TOKEN)
