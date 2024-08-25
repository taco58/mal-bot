
const axios = require('axios');
const Anilist = require('anilist-node');
const anilist = new Anilist();


async function test() {
    try {
        const title = 'Oshi no Ko Season 2';
        const response = await anilist.search('anime', title);
        const anime = await anilist.media.anime(response.media[0].id);
        if (!anime) {
            console.log('No anime found with that name.');
            return;
        }
        if (anime.status === 'RELEASING') {
            const message = anime.airingSchedule;      
            console.log(message);
        }
        else {
            console.log('Anime must be airing or upcoming.');
        }
    } catch (error) {
        console.error(error);
        await interaction.editReply({ content: 'An error occurred while processing your request.' });
    }
}

test();