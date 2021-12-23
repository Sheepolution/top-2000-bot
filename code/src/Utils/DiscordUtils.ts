import { Message, Channel, PermissionResolvable, User, Interaction, GuildMember } from 'discord.js';
import RegexConstants from '../Constants/RegexConstants';
import IMessageInfo from '../Interfaces/IMessageInfo';
import DiscordService from '../Services/DiscordService';

export default class DiscordUtils {

    public static IsId(id: string) {
        return id.match(RegexConstants.DISCORD_ID) != null;
    }

    public static GetMemberId(id: string) {
        if (this.IsId(id)) { return id; }

        const match = id.match(RegexConstants.MENTION);

        if (match) {
            return match[1];
        }

        return null;
    }

    public static GetChannelId(id: string) {
        if (this.IsId(id)) { return id; }

        const match = id.match(RegexConstants.CHANNEL);

        if (match) {
            return match[1];
        }

        return null;
    }

    public static ParseMessageToInfo(message: Message, user: User) {
        const info: IMessageInfo = {
            user: user,
            channel: message.channel as Channel,
            message: message,
            member: message.member || null,
            guild: message.guild || null,
        };

        return info;
    }

    public static async ParseInteractionToInfo(interaction: Interaction) {
        const info: IMessageInfo = {
            user: interaction.user,
            channel: await DiscordService.FindChannelById(interaction.channelId),
            guild: interaction.guildId ? await DiscordService.FindGuildById(interaction.guildId) : null,
            member: interaction.member == null ? null : interaction.member as GuildMember,
            interaction: interaction,
        };

        return info;
    }

    public static ParseChannelMentionsToIds(channels: Array<string>) {
        const ret = new Array<string>();

        for (let i = 0; i < channels.length; i++) {
            const id = this.GetChannelId(channels[i]);
            if (id) {
                ret.push(id);
            }
        }

        return ret;
    }

    public static GetUserFriendlyPermissionText(permission: PermissionResolvable) {
        if (typeof permission != 'string') {
            throw new TypeError('The permission is not of type string');
        }

        switch (permission) {
            case 'EMBED_LINKS': return 'send embedded messages';
        }

        return permission.toLowerCase().replaceAll('_', ' ');
    }
}