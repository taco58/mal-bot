const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { getCollection } = require('../functions/database');
const Anilist = require('anilist-node');
const anilist = new Anilist();

async function unsubscribe(userId, animeId, title) {
    const collection = await getCollection();

    const existingSubscription = await collection.findOne({ animeId });

    if (existingSubscription) {
        if (existingSubscription.subscribers.includes(userId)) {
            await collection.updateOne(
                { animeId },
                { $pull: { subscribers: userId } }
            )
            return `You have been unsubscribed from ${title}.`;
        }
    } else {
        return 'You are not subscribed to this anime.';
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unsubscribe')
        .setDescription('Unsubscribe from an active anime')
        .addStringOption(option =>
            option
                .setName('title')
                .setDescription('Title of the anime')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();
        try {
            const title = interaction.options.getString('title');
            const response = await anilist.search('anime', title);
            const anime = await anilist.media.anime(response.media[0].id);
            if (!anime) {
              await interaction.editReply({ content: 'No anime found with that name.'});
              return;
            }
            const message = await unsubscribe(interaction.user.id, anime.idMal, anime.title);
            await interaction.editReply({ content: message });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'An error occurred while processing your request.'});
        }
    },
};
