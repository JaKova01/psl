const Discord = require('discord.js');
const bot = new Discord.Client({intents:[Discord.Intents.FLAGS.GUILDS,Discord.Intents.FLAGS.GUILD_MESSAGES,Discord.Intents.FLAGS.GUILD_VOICE_STATES,Discord.Intents.FLAGS.GUILD_PRESENCES,Discord.Intents.FLAGS.GUILD_MEMBERS], "partials":["MESSAGE","CHANNEL"]});
const token = "OTUwNzcxNzgxNTIwNzQ0NDk4.YidxOQ.9I9NpDvegmiE0zyDFKXZ7U6R6iQ"
const fs = require("fs");
const coinfile = require("./coins.json");
const serverstats = require("./servers.json");
const tickets = require("./tickets.json")

bot.on("ready", () =>{
    console.log("ACHTUNG!!! Bot ist gestartet!");

 //Status ändern
 // .name will be evaled aka it can be defined in a .json file too and the "variables" will be automatically replaced, but it must be like that: " `TEXT... ${client.ws.ping} ...` "
const St_set = {
    delay: 15000,
    statuses: [
      { type: "PLAYING", name: "`%help | By CDN_Coding`" },
      { type: "PLAYING", name: "`PSL eSports`" },
      { type: "WATCHING", name: "`Bot Version 1.0`" },
    ],
    counter: 0,
  }      
  // Loop through the statuses
  setInterval(() => { 
    //get the status from the current index 
    const status = St_set.statuses[St_set.counter];
    //Set the status
    bot.user.setActivity({name: `${eval(status.name)}`, type: `${status.type}`}); 
    //raise the counter but if it's to big then reset it
    St_set.counter = St_set.counter < St_set.statuses.length-1 ? St_set.counter + 1 : 0;
  }, St_set.delay)
})

//ALLE Commands

bot.on("messageCreate", async message => {
//Prefix
if(!serverstats[message.guild.id]){
    serverstats[message.guild.id] = {
        prefix:"%",
        welcomechannel:"nochannel",
        leavechannel:"nochannel"
        
    }
}

fs.writeFile("./servers.json",JSON.stringify(serverstats),function(err){
    if(err) console.log(err);
})

let prefix = serverstats[message.guild.id].prefix;

if(message.content === "prefix"){
    message.channel.send({content:"Die Prefix ist **"+serverstats[message.guild.id].prefix+"**"});
}

if(message.content.startsWith(prefix+"setprefix")){
    let newprefix = message.content.split(" ").slice(1).join("");

    

    serverstats[message.guild.id].prefix = newprefix;

    message.channel.send({content:"Die neue Prefix ist **"+newprefix+"**."});

    fs.writeFile("./servers.json",JSON.stringify(serverstats),function(err){
        if(err) console.log(err);
    })
}
//Help Command

    if (message.content === prefix+"help") {
        let embed = new Discord.MessageEmbed()
            .setTitle("**Help Command:**")
            .addField("**Moderation:**", `**${prefix}clear** <zahl> löscht Nachrichten.`, true)
            .addField("**User:**", `**${prefix}Userinfo** zeigt Userinfo an!\n**${prefix}Ping** zeigt deinen Ping an!`, true)
            .addField("**Casino:**", `**${prefix}coins** zeigt deinen Kontstand an!\n**${prefix}flip** <geld> kopf/zahl dreht eine münze!`, true)
            .addField("**Setups:**", `**${prefix}setup-ticket**\n**${prefix}setup-welcome**\n**${prefix}setup-leave**`, true)
            .setColor("RANDOM")
            .setFooter({ text: ":D" })
            .setThumbnail("https://cdn.discordapp.com/attachments/952324809721778256/954076739888353351/static_1.png")

        message.channel.send({ embeds: [embed] });
    }

    //Ping Command
    if (message.content === prefix+"ping") {
        message.channel.send({ content: "Pong! :ping_pong: Dauerte " + bot.ws.ping + "ms" });
    }
    //Bouttons
    if(message.content == "%button"){
        let row = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
            .setCustomId("greenButton")
            .setStyle("SUCCESS")
            .setLabel("GRÜN"),

            new Discord.MessageButton()
            .setCustomId("redButton")
            .setStyle("DANGER")
            .setLabel("ROT")
        )

        message.channel.send({content:"hallo", components:[row]}).then(msg=>{
            let collector = msg.channel.createMessageComponentCollector({filter:button=>button.user.id == message.author.id && button.message.id == msg.id,time:60000});

            collector.on("collect", async button=>{
                if(button.customId == "greenButton"){
                    button.reply({content:"GRÜN"})
                }else{
                    button.reply({content:"ROT"})
                }
            })
        })
    }
    
 //Clear Command
    if(message.content.startsWith(prefix+"clear")){
        let messages = message.content.split(" ").slice(1).join("");
    
        if(isNaN(messages)) return message.reply({content:"Du hast keine Zahl angegeben, sonder Buchstaben."}).then(msg=>msg.delete({timeout:"50000"}));
        
        message.channel.bulkDelete(messages);
    
        message.channel.send({content:"Habe " + messages + " Nachrichten gelöscht."}).then(msg=>msg.delete({timeout:"50000"}));
    }

 //Userinfo Command
    if(message.content.startsWith(prefix+"userinfo")){
        let user = message.mentions.users.first() || message.author

        let embed = new Discord.MessageEmbed()
        .setThumbnail(user.avatarURL())
        .setColor("RANDOM")
        .addField("Username:", user.username, true)
        .addField("Discriminator:", `${user.discriminator}`, true)
        .addField("ID:", user.id.toString(), true)
        .addField("BOT:", user.bot.toString(), true)
        .addField("Created at:", `${user.createdAt}`, true)

        message.channel.send({embeds:[embed]});
    }
    //Casino
    if(!coinfile[message.author.id]){
        coinfile[message.author.id] = {
            coins: 500
        }
    }

    fs.writeFile("./coins.json", JSON.stringify(coinfile), err =>{
        if(err){
            console.log(err);
        }
    })

    //get coins
    if(message.content === prefix+"coins"){
        let embed = new Discord.MessageEmbed()
        .setTitle("Coins von " + message.author.username)
        .setDescription("Deine Coins: " + coinfile[message.author.id].coins)
        .setColor("YELLOW")

        message.channel.send({embeds:[embed]});
    }

    //flip game
    if(message.content.startsWith(prefix+"flip")){

        let bounty = message.content.split(" ").slice(1, 2).join("");

        let val = message.content.split(" ").slice(2, 3).join("");

        bounty = Number(bounty)

        if(isNaN(bounty)) return message.reply({content:"Du hast keine Zahl für Coins angegeben. Du hast **"+ bounty+"** angegeben."})

        if(!bounty) return message.reply({content:"Du hast keine Coins angegeben."});

        if(!val) return message.reply({content:"Du hast kein Kopf oder zahl angegeben."});

        if(coinfile[message.author.id].coins < bounty) return message.reply({content:"Du hast zu wenig Coins!"});

        coinfile[message.author.id].coins -= bounty;

        coinfile[message.author.id].coins = Number(coinfile[message.author.id].coins)

        let chance = Math.floor(Math.random() * 2);

        if(chance == 0){
            if(val.toLowerCase() == "kopf"){
                message.reply({content:"Und es ist... **Kopf**! Dein Einsatz verdoppelt sich."});

                bounty = bounty *2

                coinfile[message.author.id].coins += bounty;

                coinfile[message.author.id].coins = Number(coinfile[message.author.id].coins)

            }else{

                if(val.toLowerCase() == "zahl"){
                    message.reply({content:"Und es ist... **Kopf**! Du hast verloren."})
                }else{
                    coinfile[message.author.id].coins += bounty

                    coinfile[message.author.id].coins = Number(coinfile[message.author.id].coins)
                    message.reply({content:"Du hast **Kopf** oder **Zahl** falsch geschrieben oder an die falsche Stelle gesetzt."})
                }

            }
        }else{

            if(val.toLowerCase() == "zahl"){
                message.reply({content:"Und es ist... **Zahl**! Dein Einsatz verdoppelt sich."});

                bounty = bounty *2

                coinfile[message.author.id].coins += bounty;

                coinfile[message.author.id].coins = Number(coinfile[message.author.id].coins)

            }else{

                if(val.toLowerCase() == "kopf"){
                    message.reply({content:"Und es ist... **Zahl**! Du hast verloren."})
                }else{
                    coinfile[message.author.id].coins += bounty

                    coinfile[message.author.id].coins = Number(coinfile[message.author.id].coins)

                    message.reply({content:"Du hast **Kopf** oder **Zahl** falsch geschrieben oder an die falsche Stelle gesetzt."})
                }

            }

        }

        fs.writeFile("./coins.json", JSON.stringify(coinfile), err =>{
            if(err){
                console.log(err);
            }
        })

    }
    if(message.content.startsWith( `${prefix}setup-ticket`)){
        let channel = message.mentions.channels.first()
        let kate;
        let modrole = message.mentions.roles;

        message.guild.channels.cache.forEach(chn=>{
            if(chn.type == "GUILD_CATEGORY" && !kate && chn.name.toLowerCase() == "tickets"){
                kate = chn;
            }
        })

        if(!channel) return message.channel.send({content:"Du musst einen Kanal anegeben, wo die nachricht reingesendt werden soll."});

        if(!kate){
            await message.guild.channels.create("tickets", {
                type:"GUILD_CATEGORY",
                permissionOverwrites:[
                    {id:message.guild.id, deny:["VIEW_CHANNEL"]},
                    {id:bot.user.id,allow:["VIEW_CHANNEL"]}
                ]
            }).then(l=>kate=l);
        }

        if(!tickets[message.guild.id]){
            tickets[message.guild.id] = {
                id:0,
                access:[]
            }
        }

        let l = [{
            id:message.guild.id, 
            deny:["VIEW_CHANNEL"]
        },
        {
            id:bot.user.id,
            allow:["VIEW_CHANNEL"]
        
        }]

        modrole.forEach(role=>{
            l.push({id:role.id, allow:["VIEW_CHANNEL"]})
        })

        tickets[message.guild.id].id = kate.id

        tickets[message.guild.id].access = l

        fs.writeFileSync("./tickets.json", JSON.stringify(tickets));

        let button = new Discord.MessageButton()
        .setLabel("Erstelle ein Ticket")
        .setCustomId("create_ticket_button")
        .setStyle("SECONDARY")
        .setEmoji("📩")

        let row = new Discord.MessageActionRow()
        .addComponents(button);

        let embed = new Discord.MessageEmbed()
        .setTitle("Tickets")
        .setDescription("Drücke auf 'Ticket erstellen' um ein Ticket zu erstellen.")
        .setColor("BLUE")
        .setTimestamp()

        channel.send({embeds:[embed], components:[row]});

    }
        //Welcome
        if(message.content.startsWith(prefix+"setup-welcome")){
            if(!serverstats[message.guild.id].welcomechannel){
                serverstats[message.guild.id].welcomechannel = "nochannel"
            }
    
            let newchannel = message.mentions.channels.first();
    
            if(!newchannel) return message.reply({content:"Du hast keinen Kanal angegeben!"}).then(msg=>msg.delete({timeout:"50000"}));
        
            serverstats[message.guild.id].welcomechannel = newchannel.name;
    
            message.channel.send({content:"Der Welcome Channel ist nun "+newchannel.name})
    
            fs.writeFile("./servers.json", JSON.stringify(serverstats), function(err){
                if(err) console.log(err);
            })
        }
        //Leave Command
        if(message.content.startsWith(prefix+"setup-leave")){
            if(!serverstats[message.guild.id].leavechannel){
                serverstats[message.guild.id].leavechannel = "nochannel"
            }
    
            let newchannel = message.mentions.channels.first();
    
            if(!newchannel) return message.reply({content:"Du hast keinen Kanal angegeben!"}).then(msg=>msg.delete({timeout:"50000"}));
        
            serverstats[message.guild.id].leavechannel = newchannel.name;
    
            message.channel.send({content:"Der Leave Channel ist nun "+newchannel.name})
    
            fs.writeFile("./servers.json", JSON.stringify(serverstats), function(err){
                if(err) console.log(err);
            })
        }
})

//Ende des Messagecreate event
bot.on("interactionCreate", async interaction=>{
    if(interaction.customId == "create_ticket_button"){
        interaction.deferUpdate();
        if(tickets[interaction.guild.id]){
            if(!bot.channels.cache.get(tickets[interaction.guild.id].id)){
                await interaction.guild.channels.create("tickets", {
                    type:"GUILD_CATEGORY",
                    permissionOverwrites:[
                        {id:interaction.guild.id, deny:["VIEW_CHANNEL"]},
                        {id:bot.user.id,allow:["VIEW_CHANNEL"]}
                    ]
                }).then(l=>tickets[interaction.guild.id].id = l.id)
            }

            tickets[interaction.guild.id].access.push({id:interaction.user.id, allow:["VIEW_CHANNEL"]});

            interaction.guild.channels.create("ticket-"+Math.floor(Math.random() * 1000), {
                type:"GUILD_TEXT",
                parent:bot.channels.cache.get(tickets[interaction.guild.id].id),
                permissionOverwrites:tickets[interaction.guild.id].access
            }).then(chn=>{
                let embed = new Discord.MessageEmbed()
                .setTitle("Tickets")
                .setDescription("Press :x: to close the ticket.")
                .setColor("BLUE")
                .setTimestamp();

                let row = new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                    .setLabel("Close")
                    .setCustomId("close_ticket_button")
                    .setStyle("DANGER")
                    .setEmoji("❌")
                )

                chn.send({content:"@here", embeds:[embed], components:[row]})
            })
            tickets[interaction.guild.id].access.splice(tickets[interaction.guild.id].access.length - 1, 1);
        }
    }

    if(interaction.customId == "close_ticket_button"){
        interaction.channel.delete()
    }

})



bot.on("guildMemberAdd", function(member){
    let channel = member.guild.channels.cache.find(ch => ch.name === serverstats[member.guild.id].welcomechannel);
    if(!channel || channel.name === "nochannel") return;
    let embed = new Discord.MessageEmbed()
        .setTitle("**Welcome :heart:**")
        .setDescription( `Welcome,\n**${member.displayName}** auf dem Psl eSports Server.`)
        .setColor("DARK_BLUE")
        .setFooter({text:":D"})
        .setThumbnail("https://cdn.discordapp.com/attachments/952324809721778256/954076739888353351/static_1.png")

        channel.send({embeds:[embed]});


    let role = member.guild.roles.cache.find(rl=>rl.name === "Community  ");
    if(!role) return;
    member.roles.add(role);
})


bot.on("guildMemberRemove", function(member){
    let channel = member.guild.channels.cache.find(ch => ch.name === serverstats[member.guild.id].leavechannel);
    if(!channel || channel.name === "nochannel") return;
    let embed = new Discord.MessageEmbed()
        .setTitle("**Goodbye :broken_heart:**")
        .setDescription( `Goodbye,\n**${member.displayName}**`)
        .setColor("RED")
        .setFooter({text:":D"})
        .setThumbnail("https://cdn.discordapp.com/attachments/952324809721778256/954076739888353351/static_1.png")

        channel.send({embeds:[embed]});


    let role = member.guild.roles.cache.find(rl=>rl.name === "᚛Community");
    if(!role) return;
    member.roles.add(role);
})
//Welcome Role Setup
bot.login(token);