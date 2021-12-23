import IMessageInfo from '../Interfaces/IMessageInfo';
import { ButtonMessageType } from '../Enums/ButtonMessageType';
import { Message, User } from 'discord.js';
import { Utils } from '../Utils/Utils';
import SongHandler from '../Handlers/SongHandler';

export default class ButtonManager {

    private static messages: any = {};

    public static AddMessage(message: Message, buttonMessageType: ButtonMessageType, messageInfo?: IMessageInfo, values?: any, duration: number = 0) {
        const id = message.id;
        let timeout;
        if (duration > 0) {
            timeout = setTimeout(() => {
                message.edit({components: []});
                delete ButtonManager.messages[id];
            }, Utils.GetMinutesInMilliseconds(duration));
        }

        ButtonManager.messages[id] = { message: message, messageInfo: messageInfo, buttonMessageType: buttonMessageType, timeout: timeout, values: values, duration: duration };
    }

    public static OnClick(message: Message, id: string, user: User) {
        const obj = ButtonManager.messages[message.id];
        if (obj == null) {
            return;
        }

        if (obj.messageInfo && user.id != obj.messageInfo.user.id && (!obj.requester || user.id != obj.requester.id)) {
            return;
        }

        if (obj.timeout) {
            clearTimeout(obj.timeout);

            obj.timeout = setTimeout(() => {
                obj.message.reactions.removeAll();
                delete ButtonManager.messages[obj.message.id];
            }, Utils.GetMinutesInMilliseconds(obj.duration));
        }

        switch (obj.buttonMessageType) {
            case ButtonMessageType.SongList:
                SongHandler.OnPlaylistNavigation(obj, id);
                break;
        }
    }
}