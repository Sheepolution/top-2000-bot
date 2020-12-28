import Top2KConstants from '../Constants/Top2KConstants';
import Top2KSong from '../Objects/Top2KSong';

var fetch = require('node-fetch');

export default class Top2KProvider {

    private static currentSongId: string;
    private static currentPosition: number;
    private static currentPresenterId: string;
    private static list: Array<any> = new Array<any>();

    public static async GetTop2KList() {
        if (this.list.length == 0) {
            this.list = await this.GetTopListJSON();
        }

        return this.list;
    }

    public static async GetNewCurrentSong() {
        const song = await this.GetCurrentSongJSON();
        if (this.currentSongId != null && (this.currentSongId == song.id || this.currentSongId == song.title + song.artist)) {
            return;
        }

        this.currentSongId = song.id;

        if (this.currentSongId == '') {
            this.currentSongId = song.title + song.artist;
        }

        return song;
    }

    public static async GetNewCurrentPresenter() {
        const broadcast = await this.GetCurrentBroadcastJSON();
        const presenter = broadcast.presenters[0];

        if (this.currentPresenterId != null && this.currentSongId == presenter.id) {
            return;
        }

        this.currentPresenterId = presenter.id;

        presenter.image = broadcast.image;

        return presenter
    }

    public static GetSongObject() {
        const songData = this.GetSongData();
        if (songData != null) {
            this.UpdateCurrentPosition(songData);
            const song = new Top2KSong(songData);
            return song;
        }
    }

    public static GetCurrentPosition() {
        return this.currentPosition;
    }

    public static UpdateCurrentPosition(songData: any) {
        const currentPosition = this.list.indexOf(songData);
        if (this.currentPosition != -1) {
            this.currentPosition = <number> currentPosition + 1;
        }
    }

    private static GetSongData() {
        var songData = this.list.find((s: any) => s.aid == this.currentSongId || s.s + s.a == this.currentSongId);
        if (songData == null) {
            songData = this.list[this.currentPosition - 2];
        }
        return songData;
    }

    private static async GetTopListJSON() {
        return await this.GetJSON(`${Top2KConstants.BASE_URL}/?option=com_ajax&plugin=Top2000&format=json&year=2020`);
    }

    private static async GetCurrentSongJSON() {
        return await this.GetJSON(`${Top2KConstants.BASE_URL}/?option=com_ajax&plugin=nowplaying&format=json&channel=nporadio2`);
    }

    private static async GetCurrentBroadcastJSON() {
        return await this.GetJSON(`${Top2KConstants.BASE_URL}/?option=com_ajax&plugin=currentbroadcast&type=guide&format=json&channel=nporadio2`);
    }

    private static async GetJSON(url: string) {
        var response = await fetch(url);
        var json = await response.json();
        return json.data[0];
    }
}