const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const paginations = require('../functions/paginations');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('Get the top 10 rated anime/manga')
        .addSubcommand(subcommand =>
            subcommand
                .setName('anime')
                .setDescription('Get the top 10 rated anime'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('manga')
                .setDescription('Get the top 10 rated manga'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('airing')
                .setDescription('Get the top 10 airing anime')),


    async execute(interaction) {
        await interaction.deferReply();
        try {
            if (interaction.options.getSubcommand() === 'anime') {
                const descriptionResponse = await axios.get(`https://api.jikan.moe/v4/top/anime`);
                const embeds = [];
                for (let i = 0; i < 10; i++) {
                    const anime = descriptionResponse.data.data[i];
                    const embedDescription = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(anime.title)
                        .setURL(anime.url)
                        .setDescription(anime.synopsis || 'No description available.')
                        .setThumbnail(anime.images.jpg.image_url)
                        .addFields(
                            { name: 'Score', value: anime.score ? anime.score.toString() : 'N/A', inline: true },
                            { name: 'Episodes', value: anime.episodes ? anime.episodes.toString() : 'N/A', inline: true }
                        )
                        .setFooter({ text: 'Data provided by Jikan API', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/MyAnimeList_Logo.png' });
                    embeds.push(embedDescription);
                }
                await paginations(interaction, embeds);


            } else if (interaction.options.getSubcommand() === 'manga') {
                const descriptionResponse = await axios.get(`https://api.jikan.moe/v4/top/manga`);
                const embeds = []
                for (let i = 0; i < 10; i++) {
                    const manga = descriptionResponse.data.data[i];
                    const embedDescription = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(manga.title)
                        .setURL(manga.url)
                        .setDescription(manga.synopsis || 'No description available.')
                        .setThumbnail(manga.images.jpg.image_url)
                        .addFields(
                            { name: 'Score', value: manga.score ? manga.score.toString() : 'N/A', inline: true },
                            { name: 'Chapters', value: manga.chapters ? manga.chapters.toString() : 'N/A', inline: true },
                            { name: 'Status', value: manga.status ? manga.status.toString() : 'N/A', inline: true }
                        )
                        .setFooter({ text: 'Data provided by Jikan API', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/MyAnimeList_Logo.png' });
                    embeds.push(embedDescription);
                }
                await paginations(interaction, embeds);
            } else if (interaction.options.getSubcommand() === 'airing') {
                const descriptionResponse = await axios.get(`https://api.jikan.moe/v4/top/anime`, {params: {filter: 'airing'}});
                const embeds = [];
                for (let i = 0; i < 10; i++) {
                    const anime = descriptionResponse.data.data[i];
                    const embedDescription = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(anime.title)
                        .setURL(anime.url)
                        .setDescription(anime.synopsis || 'No description available.')
                        .setThumbnail(anime.images.jpg.image_url)
                        .addFields(
                            { name: 'Score', value: anime.score ? anime.score.toString() : 'N/A', inline: true },
                            { name: 'Episodes', value: anime.episodes ? anime.episodes.toString() : 'N/A', inline: true }
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
