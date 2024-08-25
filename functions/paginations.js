const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = async (interaction, pages, time = 600000) => { 
    try {
        if (!interaction || !pages || pages.length === 0) {
            throw new Error('Invalid arguments');
        }

        // await interaction.deferReply();

        if (pages.length === 1) {
            return await interaction.editReply({ embeds: pages, components: [], fetchReply: true });
        }

        var index = 0;

        const first = new ButtonBuilder()
            .setCustomId("first")
            .setEmoji("⏪")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);

        const back = new ButtonBuilder()
            .setCustomId("back")
            .setEmoji("⬅️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);

        const next = new ButtonBuilder()
            .setCustomId("next")
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(false);

        const last = new ButtonBuilder()
            .setCustomId("last")
            .setEmoji("⏩")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(false);

        const pageCount = new ButtonBuilder()
            .setCustomId("pageCount")
            .setLabel(`${index + 1}/${pages.length}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);

        const buttons = new ActionRowBuilder().addComponents([first, back, pageCount, next, last]);

        const msg = await interaction.editReply({ embeds: [pages[index]], components: [buttons], fetchReply: true });

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: time // Added time variable
        });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return await i.reply({ content: 'You cannot use this button', ephemeral: true });
            }
            await i.deferUpdate();

            if (i.customId === "first") {
                index = 0;
                pageCount.setLabel(`${index + 1}/${pages.length}`);
            }
            if (i.customId === "back" && index > 0) {
                index--;
                pageCount.setLabel(`${index + 1}/${pages.length}`);
            } else if (i.customId === "next" && index < pages.length - 1) {
                index++;
                pageCount.setLabel(`${index + 1}/${pages.length}`);
            } else if (i.customId === "last") {
                index = pages.length - 1;
                pageCount.setLabel(`${index + 1}/${pages.length}`);
            }

            first.setDisabled(index === 0);
            back.setDisabled(index === 0);
            next.setDisabled(index === pages.length - 1);
            last.setDisabled(index === pages.length - 1);

            await msg.edit({ embeds: [pages[index]], components: [buttons] }).catch(err => console.log(err));

            collector.resetTimer();
        });

        collector.on("end", async () => {
            first.setDisabled(true);
            back.setDisabled(true);
            next.setDisabled(true);
            last.setDisabled(true);

            await msg.edit({ embeds: [pages[index]], components: [buttons] }).catch(err => console.log(err));
        });

        return msg;
    } catch (err) {
        console.log(err);
    }
}
