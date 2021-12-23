import { Client, Guild, Intents, Interaction, Message } from 'discord.js';
import DiscordService from '../Services/DiscordService';

export default class Discord {

    public static client: Client;

    public static eventReadyCallback: Function;
    public static eventGuildCreate: Function;
    public static eventGuildDelete: Function;
    public static eventMessageCallback: Function;
    public static eventInteractionCommandCallback: Function;
    public static eventInteractionButtonCallback: Function;

    public static SetEventReadyCallback(callback: Function) {
        this.eventReadyCallback = callback;
    }

    public static SetEventGuildCreateCallback(callback: Function) {
        this.eventGuildCreate = callback;
    }

    public static SetEventGuildDeleteCallback(callback: Function) {
        this.eventGuildDelete = callback;
    }

    public static SetEventMessageCallback(callback: Function) {
        this.eventMessageCallback = callback;
    }

    public static SetEventInteractionCommandCallback(callback: Function) {
        this.eventInteractionCommandCallback = callback;
    }

    public static SetEventInteractionButtonCallback(callback: Function) {
        this.eventInteractionButtonCallback = callback;
    }

    public static Init() {
        this.client = new Client({
            partials: ['MESSAGE', 'CHANNEL'],
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.DIRECT_MESSAGES,
            ]
        });

        DiscordService.SetClient(this.client);

        this.client.on('ready', async () => { await Discord.EventReady(); });
        this.client.on('guildCreate', (guild) => { Discord.EventGuildCreate(guild); });
        this.client.on('guildDelete', (guild) => { Discord.EventGuildDelete(guild); });
        this.client.on('messageCreate', (message) => { Discord.EventMessage(message); });
        this.client.on('interactionCreate', (interaction) => { Discord.EventInteractionCreate(interaction); });
        this.client.login(process.env.TOKEN);
    }

    public static GetClient() {
        return this.client;
    }

    private static EventReady () {
        this.eventReadyCallback();
    }

    private static EventGuildCreate(guild: Guild) {
        if (this.eventGuildCreate == null) {
            return;
        }

        this.eventGuildCreate(guild);
    }

    private static EventGuildDelete(guild: Guild) {
        if (this.eventGuildDelete == null) {
            return;
        }

        this.eventGuildDelete(guild);
    }

    private static EventMessage (message: Message) {
        if (message.author.bot) {
            return;
        }

        this.eventMessageCallback(message);
    }

    private static EventInteractionCreate(interaction: Interaction) {
        if (interaction.isCommand()) {
            if (this.eventInteractionCommandCallback == null) {
                return;
            }

            this.eventInteractionCommandCallback(interaction);
        } else if (interaction.isButton()) {
            if (this.eventInteractionButtonCallback == null) {
                return;
            }
            this.eventInteractionButtonCallback(interaction);
        }
    }
}
