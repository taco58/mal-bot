const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const paginations = require('../functions/paginations');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('season')
        .setDescription('Get the seasonal anime')
        .addSubcommand(subcommand =>
            subcommand
                .setName('current')
                .setDescription('Get the current airing anime'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('upcoming')
                .setDescription('Get the upcoming airing anime')),


    async execute(interaction) {
        await interaction.deferReply();
        try {
            if (interaction.options.getSubcommand() === 'current') {
                const descriptionResponse = await axios.get(`https://api.jikan.moe/v4/seasons/now`);
                const embeds = [];
                for (let i = 0; i < descriptionResponse.data.data.length; i++) {
                    const current = descriptionResponse.data.data[i];
                    const embedDescription = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(current.title)
                        .setURL(current.url)
                        .setDescription(current.synopsis || 'No description available.')
                        .setThumbnail(current.images.jpg.image_url)
                        .addFields(
                            { name: 'Score', value: current.score ? current.score.toString() : 'N/A', inline: true },
                            { name: 'Episodes', value: current.episodes ? current.episodes.toString() : 'N/A', inline: true }
                        )
                        .setFooter({ text: 'Data provided by Jikan API', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/MyAnimeList_Logo.png' });
                    embeds.push(embedDescription);
                }
                await paginations(interaction, embeds);


            } else if (interaction.options.getSubcommand() === 'upcoming') {
                const descriptionResponse = await axios.get(`https://api.jikan.moe/v4/seasons/upcoming`);
                const embeds = []
                for (let i = 0; i < descriptionResponse.data.data.length; i++) {
                    const upcoming = descriptionResponse.data.data[i];
                    const embedDescription = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(upcoming.title)
                        .setURL(upcoming.url)
                        .setDescription(upcoming.synopsis || 'No description available.')
                        .setThumbnail(upcoming.images.jpg.image_url)
                        .addFields(
                            { name: 'Score', value: upcoming.score ? upcoming.score.toString() : 'N/A', inline: true },
                            { name: 'Chapters', value: upcoming.chapters ? upcoming.chapters.toString() : 'N/A', inline: true },
                            { name: 'Status', value: upcoming.status ? upcoming.status.toString() : 'N/A', inline: true }
                        )
                        .setFooter({ text: 'Data provided by Jikan API', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/MyAnimeList_Logo.png' });
                    embeds.push(embedDescription);
                }
                await paginations(interaction, embeds);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            await interaction.editReply('An error occurred while fetching data.');
        }
    }
};
