const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const QuickChart = require('quickchart-js');
const paginations = require('../functions/paginations');
const { plugins } = require('chart.js');
const { color } = require('chart.js/helpers');

async function createChart(data) {
    const chart = new QuickChart();
    chart.setConfig({
        type: 'horizontalBar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Ratings',
                color: '#fff',
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
        .setName('anime')
        .setDescription('Fetch anime information from MyAnimeList')
        .addSubcommand(subcommand =>
            subcommand
                .setName('title')
                .setDescription('Get information about an anime title')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('The title of the anime')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('recommendation')
                .setDescription('Get similar animes')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('The title of the anime')
                        .setRequired(true))),


    async execute(interaction) {
        await interaction.deferReply();

        try {
            if (interaction.options.getSubcommand() === 'title') {
                const query = interaction.options.getString('name');
                const descriptionResponse = await axios.get(`https://api.jikan.moe/v4/anime`, { params: { q: query } });

                if (descriptionResponse.data.data.length > 0) {
                    const anime = descriptionResponse.data.data[0];

                    const embedDescription = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(anime.title)
                        .setURL(anime.url)
                        .setDescription(anime.synopsis || 'No description available.')
                        .setThumbnail(anime.images.jpg.image_url)
                        .addFields(
                            { name: 'Score', value: anime.score.toString(), inline: true },
                            { name: 'Episodes', value: anime.episodes.toString(), inline: true }
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
                } else {
                    await interaction.editReply('No results found for your query.');
                }
            }
            else if (interaction.options.getSubcommand() === 'recommendation') {
                try {
                    const query = interaction.options.getString('name');
                    const searchResponse = await axios.get(`https://api.jikan.moe/v4/anime`, { params: { q: query } });
            
                    if (searchResponse.data.data.length > 0) {
                        const animeId = searchResponse.data.data[0].mal_id;
                        const recommendationResponse = await axios.get(`https://api.jikan.moe/v4/anime/${animeId}/recommendations`);
            
                        if (recommendationResponse.data.data.length > 0) {
                            const recommendations = recommendationResponse.data.data;
                            const embeds = [];
            
                            for (let i = 0; i < Math.min(recommendations.length, 10); i++) {
                                const recommendation = recommendations[i].entry;
                                const animeResponse = await axios.get(`https://api.jikan.moe/v4/anime/${recommendation.mal_id}`);
                                const anime = animeResponse.data.data;
            
                                const embed = new EmbedBuilder()
                                    .setColor(0x0099FF)
                                    .setTitle('Recommendation #' + (i + 1) + ' : ' + anime.title)
                                    .setURL(anime.url)
                                    .setDescription(anime.synopsis || 'No description available.')
                                    .setThumbnail(anime.images.jpg.image_url)
                                    .setFooter({ text: 'Data provided by Jikan API', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/MyAnimeList_Logo.png' });
            
                                embeds.push(embed);
                            }
            
                            await paginations(interaction, embeds);
                        } else {
                            await interaction.editReply('No recommendations found for your query.');
                        }
                    } else {
                        await interaction.editReply('No results found for your query.');
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                    await interaction.editReply('An error occurred while fetching recommendations.');
                }
            }
            
        } catch (error) {
            console.error('Error fetching data:', error);
            await interaction.editReply('An error occurred while fetching data.');
        }
    },
};
