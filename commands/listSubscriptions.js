const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getCollection } = require('../functions/database');
const paginations = require('../functions/paginations');

async function getSubscriptions(userId) {
    const collection = await getCollection();
    const subscriptions = await collection.find({ subscribers: userId }).toArray();
    return subscriptions.map(subscription => subscription.title);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('display')
        .setDescription('Display your subscriptions')
        .addSubcommand(subcommand =>
            subcommand
                .setName('subscriptions')
                .setDescription('Display your subscriptions')
        ),

    async execute(interaction) {
        await interaction.deferReply();
        try {
            if (interaction.options.getSubcommand() === 'subscriptions') {
                const subscriptions = await getSubscriptions(interaction.user.id);

                if (subscriptions.length === 0) {
                    await interaction.editReply('You are not subscribed to any animes.');
                    return;
                }

                const embeds = [];
                const pageSize = 10;

                for (let i = 0; i < subscriptions.length; i += pageSize) {
                    const currentPageSubscriptions = subscriptions.slice(i, i + pageSize);
                    const embedDescription = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle('Your Subscriptions')
                        .setDescription(currentPageSubscriptions.join('\n'))
                                            
                    embeds.push(embedDescription);
                }

                await paginations(interaction, embeds);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            await interaction.editReply('An error occurred while fetching data.');
        }
    },
};
