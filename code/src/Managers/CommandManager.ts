import RedisConstants from '../Constants/RedisConstants';
import SettingsConstants from '../Constants/SettingsConstants';
import ICooldownInfo from '../Interfaces/ICooldownInfo';
import IMessageInfo from '../Interfaces/IMessageInfo';
import ISpamInfo from '../Interfaces/ISpamInfo';
import Discord from '../Providers/Discord';
import { Redis } from '../Providers/Redis';

export default class CommandManager {

    private static readonly spamKey = RedisConstants.REDIS_KEY + RedisConstants.USER_KEY + RedisConstants.SPAM_KEY;
    private static readonly cooldownKey = RedisConstants.REDIS_KEY + RedisConstants.USER_KEY + RedisConstants.COOLDOWN_KEY;

    public static async CheckSpam(messageInfo: IMessageInfo): Promise<ISpamInfo> {
        const spamKey = this.spamKey + messageInfo.user.id;
        const total = await Redis.incr(spamKey);
        let spam = false;
        let warn = false;

        Redis.expire(spamKey, SettingsConstants.SPAM_EXPIRE_TIME);

        if (total >= 5) {
            spam = true;
            warn = total == 5;
        }

        return { spam: spam, warn: warn };
    }

    public static async GetCooldown(messageInfo: IMessageInfo): Promise<ICooldownInfo> {
        const cooldownKey = `${this.cooldownKey + messageInfo.user.id}:${messageInfo.commandInfo.command}`;

        let time = 0;
        let cooldown = await Redis.get(cooldownKey);

        if (cooldown == null) {
            return { time: 0, tell: false };
        } else {
            time = await Redis.ttl(cooldownKey);

            if (time == 0) {
                return { time: 0, tell: false };
            }

            cooldown = parseInt(cooldown) + 1;
            Redis.set(cooldownKey, cooldown, 'ex', time);
        }

        return { time: time, tell: cooldown < 5 };
    }

    public static SetCooldown(messageInfo: IMessageInfo, time: number) {
        const cooldownKey = `${this.cooldownKey + messageInfo.user.id}:${messageInfo.commandInfo.command}`;
        Redis.set(cooldownKey, 1, 'ex', time);
    }

    public static UpdateSlashCommands() {
        const data = [
            {
                name: 'zoek',
                description: 'Zoek naar de titel van een nummer, of naar alle nummers van een artiest.',
                options: [{
                    name: 'categorie',
                    type: 'STRING' as const,
                    choices: [
                        {name: 'titel', value: 'titel'},
                        {name: 'artiest', value: 'artiest'},
                        {name: 'plek',  value: 'plek'}
                    ],
                    description: 'Waar wil je op zoeken?',
                    required: true,
                }, {
                    name: 'zoekterm',
                    type: 'STRING' as const,
                    description: 'De naam of de plek.',
                    required: true,
                }],
            },
            {
                name: 'lijst',
                description: 'Krijg een lijst van de nummers die zijn geweest en die eraan komen.',
            },
            {
                name: 'remind',
                description: 'Laat de bot je een DM sturen wanneer een nummer bijna aan bod komt.',
                options: [{
                    name: 'plek',
                    type: 'INTEGER' as const,
                    description: 'Op welke plek het nummer staat.',
                    required: true,
                }],
            },
        ];

        Discord.client.application?.commands.set(data);
    }
}