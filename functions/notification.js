const cron = require('node-cron');
const { getCollection } = require('../functions/database');
const Anilist = require('anilist-node');
const anilist = new Anilist();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages] });

const BOT_TOKEN = process.env.DISCORD_TOKEN;

async function fetchLatestEpisodes() {
    const collection = await getCollection();
    const subscriptions = await collection.find({}).toArray();

    for (const subscription of subscriptions) {
        const anime = await anilist.media.anime(subscription.animeId);
        if (!anime) continue;

        const latestEpisode = anime.nextAiringEpisode;
        if (latestEpisode) {
            const lastNotifiedEpisode = subscription.lastNotifiedEpisode || 0;
            if (latestEpisode.episode > lastNotifiedEpisode) {
                for (const userId of subscription.subscribers) {
                    try {
                        const user = await client.users.fetch(userId);
                        if (user) {
                            const embed = new EmbedBuilder()
                                .setColor(0x0099FF)
                                .setTitle(anime.title.english || anime.title.romaji || anime.title.native) 
                                .setDescription(`New episode released: Episode ${latestEpisode.episode}`)
                                .setURL(anime.siteUrl)
                                .setFooter({ text: `Next episode airs on ${new Date(latestEpisode.airingAt * 1000).toLocaleDateString()}` });

                            await user.send({ embeds: [embed] });
                        }
                    } catch (error) {
                        console.error(`Failed to send notification to user ${userId}:`, error);
                    }
                }

                await collection.updateOne(
                    { animeId: subscription.animeId },
                    { $set: { lastNotifiedEpisode: latestEpisode.episode } }
                );
            }
        }
    }
}

cron.schedule('0 * * * *', fetchLatestEpisodes);

client.login(BOT_TOKEN);
