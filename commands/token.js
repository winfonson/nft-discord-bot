const fetch = require('node-fetch');
const { openseaAssetUrl } = require('../config.json');

const Discord = require('discord.js');

module.exports = {
	name: "zodiac",
	execute(message, args) {
    //return message.channel.send('fetching token');
    if (!args.length) {
      return message.channel.send(`You didn't provide a token id, ${message.author}!`);
    }

    if (isNaN(parseInt(args[0]))) {
      return message.channel.send(`Token id must be a number!`);
    }

    let url = `${openseaAssetUrl}/${process.env.CONTRACT_ADDRESS}/${args[0]}`;
    let settings = { 
      method: "GET",
      headers: {
        "X-API-KEY": process.env.OPEN_SEA_API_KEY
      }
    };
    
    fetch(url, settings)
        .then(res => {
          if (res.status == 404 || res.status == 400)
          {
            throw new Error("Token id doesn't exist.");
          }
          if (res.status != 200)
          {
            throw new Error(`Couldn't retrieve metadata ${res.statusText}`);
          }
          return res.json();
        })
        .then((metadata) => {
            const embedMsg = new Discord.MessageEmbed()
              .setColor('#0099ff')
              .setTitle(metadata.name)
              .setURL(metadata.permalink)
              .addField("Owner", metadata.owner.user?.username || metadata.owner.address.slice(0,8))
              .addField("CurrentPrice", `${Number(metadata.orders[0] == undefined? 0 : metadata.orders[0].current_price || 0)*1e-18}Ξ`)
              .setImage(metadata.image_url);

            metadata.traits.forEach(function(trait){
              embedMsg.addField(trait.trait_type, `${trait.value} (${Number(trait.trait_count/metadata.collection.stats.count).toLocaleString(undefined,{style: 'percent', minimumFractionDigits:2})})`, true)
              //embedMsg.addField(trait.trait_type, `${trait.value}`, true)
            });

            message.channel.send(embedMsg);
        })
        .catch(error => message.channel.send(error.message));
	},
};