import { Channel, Client, Guild, GuildChannelResolvable, GuildMember, MessagePayload, PermissionResolvable, Snowflake, TextChannel, User } from 'discord.js';
import IMessageInfo from '../Interfaces/IMessageInfo';
import DiscordUtils from '../Utils/DiscordUtils';
import MessageService from './MessageService';

export default class DiscordService {

    private static client: Client;

    public static SetClient(client: Client) {
        if (this.client != null) {
            throw new Error('Client can only be set once.');
        }

        this.client = client;
    }

    public static async FindBotMember(guild: Guild) {
        return await DiscordService.FindMemberById(this.client.user.id, guild);
    }

    public static async FindMember(searchKey: string, guild: Guild) {
        const foundMember = await this.FindMemberById(searchKey, guild);
        if (foundMember) {
            return foundMember;
        }

        await guild.members.fetch();

        const lowerMember = searchKey.toLowerCase();
        return guild.members.cache.find(member => {
            return member.displayName.toLowerCase() == lowerMember || member.user.username.toLowerCase() == lowerMember;
        });
    }

    public static async FindMemberById(searchKey: string, guild: Guild) {
        const id = DiscordUtils.GetMemberId(searchKey);
        if (id) {
            const foundMember = guild.members.cache.get(id) || guild.members.fetch(id);
            if (foundMember != null) {
                return foundMember;
            }
        }
    }

    public static FindChannel(channelId: string, guild?: Guild) {
        const channel = this.FindChannelById(channelId, guild);

        if (channel == null && guild != null) {
            // Guild has already been fetched in FindChannelById
            return guild.channels.cache.find(channel => channel.name.toLowerCase() == channelId.toLowerCase());
        }
        return undefined;
    }

    public static async FindChannelById(searchKey: string, guild?: Guild) {
        const id = DiscordUtils.GetChannelId(searchKey);
        if (id) {
            let foundChannel;
            if (guild) {
                foundChannel = guild.channels.cache.get(id);
                if (!foundChannel) {
                    await guild.fetch();
                    foundChannel = guild.channels.cache.get(id);
                }
            } else {
                foundChannel = this.client.channels.cache.get(id) || await this.client.channels.fetch(id);
            }

            if (foundChannel != null) {
                return foundChannel;
            }
        }
    }

    public static async FindMessageById(messageId: string, channel: TextChannel) {
        return await channel.messages.fetch(messageId);
    }

    public static async FindUserById(userId: string) {
        return this.client.users.cache.get(userId) || await this.client.users.fetch(userId);
    }

    public static async FindGuildById(guildId: string) {
        return await this.client.guilds.fetch(guildId as Snowflake);
    }

    public static IsMemberAdmin(member: GuildMember) {
        return member.permissions.has('ADMINISTRATOR');
    }

    public static async CheckPermission(messageInfo: IMessageInfo, permission: PermissionResolvable, action?: string, sendMessage: boolean = true) {
        if (messageInfo.guild == null) {
            return;
        }

        const botMember = await DiscordService.FindBotMember(messageInfo.guild);
        const permissions = botMember.permissionsIn(messageInfo.channel as GuildChannelResolvable);
        if (permissions.has(permission)) {
            return true;
        }

        if (sendMessage) {
            MessageService.ReplyMessage(messageInfo, `I don't have permission to ${DiscordUtils.GetUserFriendlyPermissionText(permission)}${action?.isFilled() ? `, so I can't ${action}.` : '.'}`, false);
        }

        return false;
    }

    public static async SendMessage(channel: Channel, data: MessagePayload) {
        try {
            const textChannel: TextChannel = <TextChannel>channel;
            return await textChannel.send(data);
        } catch (error) {
            // Was not able to send message.
        }
    }

    public static async ReplyMessage(textChannel: TextChannel, user: User, data: any) {
        try {
            data.content = `${user} ${data.content || ''}`;

            return await textChannel.send(data);
        } catch (error) {
            // Was not able to send message.
        }
    }

    public static SetAvatar(imageUrl: string) {
        this.client.user?.setAvatar(imageUrl);
    }

    public static async SetNickname(member: GuildMember, name: string) {
        await member.setNickname(name);
    }
}