interface Metadata{
    width : number,
    height : number,
    fileSize : number
}

export class VideoMetadata{
    async frommUrl(url : string) : Promise<Metadata>{
        return undefined as any
    }
}

// width >= 1280 --> 1280x720 & 640x360
// 1280 < width <= 640 --> 640x360
// 640 < width --> width

