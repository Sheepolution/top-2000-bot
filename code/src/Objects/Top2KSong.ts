import Top2KConstants from '../Constants/Top2KConstants';

export default class Top2KSong {

    private id: string;
    private title: string;
    private artist: string;
    private currentPosition: number;
    private previousPosition: number;
    private change?: number;
    private imageUrl: string;
    private pageUrl: string;
    private audioUrl: string;
    private statsUrl: string;

    constructor(data: any) {
        this.id = data.track.id;
        this.title = data.track.title;
        this.artist = data.track.artist;
        this.currentPosition = data.position.current;
        this.previousPosition = data.position.previous;
        this.change = this.previousPosition == 0 ? undefined : this.previousPosition - this.currentPosition;
        this.imageUrl = data.track.coverUrl;
        this.pageUrl = `${Top2KConstants.BASE_URL}${data.track.detailUrl}`;
        this.audioUrl = data.track.previewUrl;
        this.statsUrl = data.track.historyUrl?.isFilled() ? Top2KConstants.BASE_URL + data.track.historyUrl : null;
    }

    public GetId() {
        return this.id;
    }

    public GetTitle() {
        return this.title;
    }

    public GetArtist() {
        return this.artist;
    }

    public GetCurrentPosition() {
        return this.currentPosition;
    }

    public GetPreviousPosition() {
        return this.previousPosition;
    }

    public GetChange() {
        return this.change;
    }

    public GetImageUrl() {
        return this.imageUrl;
    }

    public GetPageUrl() {
        return this.pageUrl;
    }

    public GetAudioUrl() {
        return this.audioUrl;
    }

    public GetStatsUrl() {
        return this.statsUrl;
    }
}
