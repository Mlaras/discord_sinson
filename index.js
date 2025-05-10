import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import dotenv from 'dotenv';
import { fileURLToPath, pathToFileURL } from 'url';

dotenv.config(); // For loading environment variables

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.commands = new Collection();

// Correctly resolve __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));
const foldersPath = join(__dirname, 'commands');
const commandFolders = readdirSync(foldersPath);

(async () => {
    for (const folder of commandFolders) {
        const commandsPath = join(foldersPath, folder);
        const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        console.log(`Loading commands from ${commandsPath}...`);
        if (commandFiles.length === 0) {
            console.log(`[WARNING] No command files found in ${commandsPath}.`);
        }

        for (const file of commandFiles) {
            const filePath = join(commandsPath, file);
            const fileUrl = pathToFileURL(filePath).href; // Convert to file:// URL
            try {
                const command = await import(fileUrl);
                // Check if the command has the required properties
                if ('data' in command.default && 'execute' in command.default) {
                    client.commands.set(command.default.data.name, command.default);
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            } catch (err) {
                console.error(`Error loading command at ${filePath}:`, err);
            }
        }
    }
})();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    if (message.content === '!ping') {
        message.channel.send('Pong!');
    }
});

// Handle slash commands
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

client.login(process.env.DISCORD_TOKEN);