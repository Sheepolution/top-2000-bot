import DiscordService from '../Services/DiscordService';
import { Client } from 'discord.js';

export default class Discord {

    public static client:Client;

    public static eventReadyCallback:Function;

    public static SetEventReadyCallback(callback:Function) {
        this.eventReadyCallback = callback;
    }

    public static Init() {
        this.client = new Client();

        DiscordService.SetClient(this.client)

        this.client.on('ready', async () => { await Discord.EventReady() });
        this.client.login(process.env.TOKEN);
    }

    private static async EventReady () {
        this.eventReadyCallback();
    }
}
