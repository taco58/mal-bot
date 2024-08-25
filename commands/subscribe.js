const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { getCollection } = require('../functions/database');
const Anilist = require('anilist-node');
const anilist = new Anilist();

async function subscribe(userId, animeId, title) {
  const collection = await getCollection();

  const existingSubscription = await collection.findOne({ animeId });

  if (existingSubscription) {
    if (existingSubscription.subscribers.includes(userId)) {
      return 'You are already subscribed to this anime.';
    }
  } else {
    await collection.insertOne({ animeId, title, subscribers: [userId], lastNotifiedEpisode: 0 });
  }
  return `Successfully subscribed to ${title}!`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('subscribe')
    .setDescription('Subscribe to get notifications for an active anime')
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
        await interaction.editReply({ content: 'No anime found with that name.' });
        return;
      }
      if (anime.status === 'RELEASING') {
        const message = await subscribe(interaction.user.id, anime.idMal, anime.title.english || anime.title.native || anime.title.romaji);
        await interaction.editReply({ content: message });
      }
      else {
        await interaction.editReply('The anime must be airing or upcoming.');
      }
    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: 'An error occurred while processing your request.' });
    }
  },
};
