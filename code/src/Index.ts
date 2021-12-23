require('dotenv').config();

import BotManager from './Managers/BotManager';
import Discord from './Providers/Discord';
import './Utils/MonkeyPatches';

class Main {

    constructor() {
        Discord.SetEventReadyCallback(BotManager.OnReady);
        Discord.SetEventMessageCallback(BotManager.OnMessage);
        Discord.SetEventGuildCreateCallback(BotManager.OnAddedToGuild);
        Discord.SetEventGuildDeleteCallback(BotManager.OnKickedFromGuild);
        Discord.SetEventInteractionCommandCallback(BotManager.OnInteractionCommand);
        Discord.SetEventInteractionButtonCallback(BotManager.OnInteractionButton);
        Discord.Init();
    }
}

new Main();