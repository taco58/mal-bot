const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const paginations = require('../functions/paginations');
const QuickChart = require('quickchart-js');

async function createChart(data) {
    const chart = new QuickChart();
    chart.setConfig({
        type: 'horizontalBar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Ratings',
                data: data.values,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    color: '#fff',
                    formatter: (value) => {
                        return value + '%';
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#fff' },
                },
                x: {
                    ticks: { color: '#fff' },
                }
            }
        },
        plugins: {
            backgroundColor: 'rgba(66,69,73)',
        }
    });

    const chartUrl = await chart.getUrl();
    return chartUrl;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Get a random anime')
        .addSubcommand(subcommand =>
            subcommand
                .setName('anime')
                .setDescription('Get a random anime'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('manga')
                .setDescription('Get a random manga')),


    async execute(interaction) {
        await interaction.deferReply();
        try {
            if (interaction.options.getSubcommand() === 'anime') {
                const descriptionResponse = await axios.get(`https://api.jikan.moe/v4/random/anime`);
                const anime = descriptionResponse.data.data;

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

                const charactersResponse = await axios.get(`https://api.jikan.moe/v4/anime/${anime.mal_id}/characters`);

                const embedCharacters = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`Characters in ${anime.title}`)
                    .setURL(anime.url)
                    .setFooter({ text: 'Data provided by Jikan API', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/MyAnimeList_Logo.png' });

                if (charactersResponse.data.data.length > 0) {
                    charactersResponse.data.data.slice(0, 10).forEach(character => {
                        embedCharacters.addFields({
                            name: character.character.name,
                            value: `Role: ${character.role}\n[Image](${character.character.images.jpg.image_url})`,
                            inline: true
                        });
                    });
                } else {
                    embedCharacters.setDescription('No characters found for this anime.');
                }

                const statsResponse = await axios.get(`https://api.jikan.moe/v4/anime/${anime.mal_id}/statistics`);
                const scores = statsResponse.data.data.scores;

                const labels = scores.map(score => score.score);
                const values = scores.map(score => score.percentage);

                const chartUrl = await createChart({ labels, values });

                const embedStats = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`Score Distribution for ${anime.title}`)
                    .addFields(
                        { name: 'Watching', value: statsResponse.data.data.watching.toString() || 'N/A', inline: true },
                        { name: 'Completed', value: statsResponse.data.data.completed.toString() || 'N/A', inline: true },
                        { name: 'On-Hold', value: statsResponse.data.data.on_hold.toString() || 'N/A', inline: true },
                        { name: 'Dropped', value: statsResponse.data.data.dropped.toString() || 'N/A', inline: true },
                        { name: 'Plan to Watch', value: statsResponse.data.data.plan_to_watch.toString() || 'N/A', inline: true }
                    )
                    .setURL(anime.url)
                    .setImage(chartUrl)
                    .setFooter({ text: 'Data provided by Jikan API', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/MyAnimeList_Logo.png' });

                const embeds = [embedDescription, embedCharacters, embedStats];
                await paginations(interaction, embeds);
            } else if (interaction.options.getSubcommand() === 'manga') {
                const descriptionResponse = await axios.get(`https://api.jikan.moe/v4/random/manga`);
                const manga = descriptionResponse.data.data;

                const embedDescription = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(manga.title)
                    .setURL(manga.url)
                    .setDescription(manga.synopsis || 'No description available.')
                    .setThumbnail(manga.images.jpg.image_url)
                    .addFields(
                        { name: 'Score', value: manga.score ? manga.score.toString() : 'N/A', inline: true },
                        { name: 'Chapters', value: manga.chapters ? manga.chapters.toString() : 'N/A', inline: true },
                        { name: 'Status',  value: manga.status ? manga.status.toString() : 'N/A', inline: true }
                    )
                    .setFooter({ text: 'Data provided by Jikan API', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/MyAnimeList_Logo.png' });

                const charactersResponse = await axios.get(`https://api.jikan.moe/v4/manga/${manga.mal_id}/characters`);

                const embedCharacters = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`Characters in ${manga.title}`)
                    .setURL(manga.url)
                    .setFooter({ text: 'Data provided by Jikan API', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/MyAnimeList_Logo.png' });

                if (charactersResponse.data.data.length > 0) {
                    charactersResponse.data.data.slice(0, 10).forEach(character => {
                        embedCharacters.addFields({
                            name: character.character.name,
                            value: `Role: ${character.role}\n[Image](${character.character.images.jpg.image_url})`,
                            inline: true
                        });
                    });
                } else {
                    embedCharacters.setDescription('No characters found for this manga.');
                }

                const statsResponse = await axios.get(`https://api.jikan.moe/v4/manga/${manga.mal_id}/statistics`);
                const scores = statsResponse.data.data.scores;

                const labels = scores.map(score => score.score);
                const values = scores.map(score => score.percentage);

                const chartUrl = await createChart({ labels, values });

                const embedStats = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(`Score Distribution for ${manga.title}`)
                    .addFields(
                        { name: 'Completed', value: statsResponse.data.data.completed ? statsResponse.data.data.completed.toString() : 'N/A', inline: true },
                        { name: 'On-Hold', value: statsResponse.data.data.on_hold ? statsResponse.data.data.on_hold.toString() : 'N/A', inline: true },
                        { name: 'Dropped', value: statsResponse.data.data.dropped ? statsResponse.data.data.dropped.toString() : 'N/A', inline: true },
                    )
                    .setURL(manga.url)
                    .setImage(chartUrl)
                    .setFooter({ text: 'Data provided by Jikan API', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/MyAnimeList_Logo.png' });

                const embeds = [embedDescription, embedCharacters, embedStats];
                await paginations(interaction, embeds);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            await interaction.editReply('An error occurred while fetching data.');
        }
    }
};
