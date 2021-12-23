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
        this.id = data.id;
        this.title = data.title;
        this.artist = data.artist;
        this.currentPosition = data.position;
        this.previousPosition = data.lastPosition;
        this.change = this.previousPosition == 0 ? undefined : this.previousPosition - this.currentPosition;
        this.imageUrl = data.imageUrl;
        this.pageUrl = `${Top2KConstants.BASE_URL}/muziek/nummers/${this.id}/${this.title.replaceAll(' ', '-')}`;
        this.audioUrl = data.trackPreviewUrl;
        this.statsUrl = data.trackHistoryUrl?.isFilled() ? Top2KConstants.BASE_URL + data.trackHistoryUrl : null;
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