import { SlashCommandBuilder } from 'discord.js';
import { scrapeImage } from '../../utils/scrapper.js';
export default {
	data: new SlashCommandBuilder()
		.setName('pls_frame')
		.setDescription('Returns a Random Frame!'),
	async execute(interaction) {
        const imageUrl = await scrapeImage();
        // If you want to use a static image instead, uncomment the line below
        // const imageUrl = 'https://frinkiac.com/img/S02E04/118162.jpg';
        await interaction.reply({
            embeds: [
                {
                    image: {
                        url: imageUrl,
                    },
                },
            ],
        });
	}
};