const fetch = require('node-fetch');
const { openseaAssetUrl } = require('../config.json');

const Discord = require('discord.js');


module.exports = {
	name: "mint",
	execute(message) {

        let url = `${openseaEventsUrl}?collection_slug=${process.env.OPEN_SEA_COLLECTION_NAME}&event_type=transfer&only_opensea=false&offset=${offset}&limit=50`;

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
                throw new Error(`Couldn't retrieve metadata ${res.statusText}`);
            }
            if (res.status != 200)
            {
                throw new Error(`Couldn't retrieve metadata ${res.statusText}`);
            }
            return res.json();
            })
            .then((metadata) => {
                metadata.asset_events.forEach(function(event) {
                    if (event.asset) {
                    const embedMsg = new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(event.asset.name)
                        .setURL(event.asset.permalink)
                        .setDescription(`was transferred`)
                        .setThumbnail(event.asset.image_url)
                        .addField("To", `[${event.to_account.user?.username || event.to_account.address.slice(0,8)}](https://etherscan.io/address/${event.to_account.address})`, true);
        
                    message.channel.send(embedMsg);
                    };
                });
            });
    },
};