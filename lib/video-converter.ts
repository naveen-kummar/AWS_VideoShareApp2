import { CreateJobCommand, MediaConvertClient } from '@aws-sdk/client-mediaconvert'

interface Resolution {
    width: number;
    height: number;
    bitRate?: number;
    fileExtension?: string;
    nameExtension?: string;
}

interface VideoConvertorConfig {
    roleArn: string;
    region: string;
    endpoint: string;
    inputFile: string; //"s3://vidshareappstack-uploadbucketd2c1da78-q2fuxiqczr6z/0306bcb4-dee9-4ef6-9ac4-8c29dbf715a3"
    outputFile: string; //"s3://vidshare-upload-bucket-naveen/"
}

export class VideoConverter {
    private resolutions: Resolution[] = [];

    constructor(private config: VideoConvertorConfig) {

    }
    addResolution4(res: Resolution) { //res: Resolution
        console.log("Inside Video Convertor's addResolution4 -- 1");
        console.log("Adding Resoloution width - ", res.width, " , and height - ", res.height);
        this.resolutions.push(res);
    }

    private get client() {
        return new MediaConvertClient({
            region: this.config.region,
            endpoint: this.config.endpoint,
        });
    }

    async convert() {
        console.log("Inside Video Convertor's convert()");
        console.log(JSON.stringify(this.resolutions, null, 4))

        return this.client.send(
            new CreateJobCommand({
                UserMetadata: {},
                Role: this.config.roleArn,
                Settings: {
                    TimecodeConfig: {
                        Source: "ZEROBASED"
                    },
                    Inputs: [
                        {
                            AudioSelectors: {
                                "Audio Selector 1": {
                                    DefaultSelection: "DEFAULT"
                                }
                            },
                            VideoSelector: {},
                            TimecodeSource: "ZEROBASED",
                            FileInput: this.config.inputFile
                        }
                    ],
                    OutputGroups: [
                        {
                            CustomName: "test_MediaConvert_Output",
                            Name: "File Group",
                            OutputGroupSettings: {
                                Type: "FILE_GROUP_SETTINGS",
                                FileGroupSettings: {
                                    Destination: this.config.outputFile,
                                    DestinationSettings: {
                                        S3Settings: {
                                            StorageClass: "STANDARD"
                                        }
                                    }
                                }
                            },
                            Outputs: this.resolutions.map(res => {
                                return {
                                    ContainerSettings: {
                                        Container: "MP4",
                                        Mp4Settings: {},
                                    },
                                    VideoDescription: {
                                        CodecSettings: {
                                            Codec: "H_264",
                                            H264Settings: {
                                                Bitrate: res.bitRate || 500000,
                                                RateControlMode: "CBR",
                                            },
                                        },
                                    Height : res.height,
                                    Width : res.width
                                    },
                                    Extension: res.fileExtension || "mp4",
                                    NameModifier: res.nameExtension || `_${res.width}x${res.height}`,
                                };                    
                            })
                        },
                    ],
                    FollowSource: 1
                },
                BillingTagsSource: "JOB",
            })
        );
    }
}