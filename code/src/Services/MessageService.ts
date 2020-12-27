import BotManager from '../Managers/BotManager';
import DiscordService from './DiscordService';
import { MessageEmbed, TextChannel } from 'discord.js';

export default class MessageService {

    public static async SendMessageToLiveBlogChannel(message:string, embed?:MessageEmbed) {
        return await this.SendMessage(BotManager.GetLiveBlogChannel(), message, embed);
    }

    public static async SendMessageToSportsChannel(message:string, embed?:MessageEmbed) {
        return await this.SendMessage(BotManager.GetSportsChannel(), message, embed);
    }

    public static async SendMessageToTop2KChannel(message:string, embed?:MessageEmbed) {
        return await this.SendMessage(BotManager.GetTop2KChannel(), message, embed);
    }

    private static async SendMessage(channel:TextChannel, message:string, embed?:MessageEmbed) {
        return await DiscordService.SendMessage(channel, message, embed)
    }
}
