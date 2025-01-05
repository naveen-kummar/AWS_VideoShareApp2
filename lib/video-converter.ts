interface Resolution{
    width: number;
    height: number;
}

export class VideoConverter{
    private resolutions: Resolution[] = [];


    addResolution4(res: Resolution) { //res: Resolution
        console.log("Inside Video Convertor's addResolution4 -- 1");
        console.log("Adding Resoloution width - ", res.width, " , and height - ", res.height);
        this.resolutions.push(res);
    }

    async convert() {
        console.log("Inside Video Convertor's convert()");
        console.log(JSON.stringify(this.resolutions, null, 4))
    }
}