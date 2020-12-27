require('dotenv').config();

import BotManager from './Managers/BotManager';
import Discord from './Providers/Discord';
import './Utils/MonkeyPatches';

class Main {

    constructor() {
        Discord.SetEventReadyCallback(BotManager.OnReady);
        Discord.Init();
    }
}

new Main();