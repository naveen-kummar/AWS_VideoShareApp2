import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand, PutCommand, UpdateCommand, GetCommand, DynamoDBDocumentClient, ScanCommand , ScanCommandOutput} from "@aws-sdk/lib-dynamodb";
import { Key } from "aws-cdk-lib/aws-kms";



export class DB<T extends { id: string }>{

    private client: DynamoDBDocumentClient;

    constructor(
        private config: {
        tableName: string;
        region: string;
    }
) {
    
        const dynamoDBClient = new DynamoDBClient({
            region : this.config.region,
        });
        this.client = DynamoDBDocumentClient.from(dynamoDBClient, {
            marshallOptions : {
                removeUndefinedValues : true,
            },
        }
    );
    }

    /*Get document based on ID */
    async get(id: string) {
        const res = await this.client.send(
            new GetCommand({
                TableName: this.config.tableName,
                Key: {id,},
            })
        );

        return res.Item as T;
    };

    async queryGSI({
        IndexName,
        KeyConditionExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
    } : {
        IndexName: string;
        KeyConditionExpression: string;
        ExpressionAttributeNames: Record<string, string>;
        ExpressionAttributeValues: Record<string, string>;
    }) : Promise<T[]> { 
        const res = await this.client.send(
            new QueryCommand({
                TableName: this.config.tableName,
                IndexName,
                KeyConditionExpression,
                ExpressionAttributeNames,
                ExpressionAttributeValues,
            })
        );
        return res.Items as T[];
    }
    



    /*This function signature is made generic so that we can change 
    implementation to MongoDB instead of DynamoDB*/
    async save(doc : T) {

        console.log("Inside dbts - save func");
         return this.client.send(new PutCommand({
            TableName : this.config.tableName,
            Item : doc,
         }))
    }

  // Correcting the scan method to match the right shape
    async scan(queryParams: { userId: string }) {
        console.log("Scanning for userId:", queryParams.userId);

        const params = {
            TableName: this.config.tableName,  // Use the class config here
            FilterExpression: "#userId = :userId",
            ExpressionAttributeNames: {
                "#userId": "userId",
            },
            ExpressionAttributeValues: {
                ":userId": queryParams.userId,
            },
        };

        const command = new ScanCommand(params); // Using ScanCommand
        try {
            const data: ScanCommandOutput = await this.client.send(command);
            console.log("Scan result:", data.Items);  // Log the scanned items
            return data.Items;  // Return the items directly
        } catch (error) {
            console.error("Error scanning table:", error);
            throw new Error("Error scanning DynamoDB table");
        }
    }

    /*This function signature is made generic so that we can change 
    implementation to MongoDB instead of DynamoDB in future if required*/
    async update({id, attrs} : {id : string, attrs : Partial<Omit<T, 'id'>>}){
        console.log("Inside VideoDB update");
        const UpdateExpressionArr: string[] = []; //set #title = :title, #description = :description
        const ExpressionAttributeNames: Record<string, any> = {};
        const ExpressionAttributeValues: Record<string, any> = {};

        (Object.keys(attrs) as Array<keyof typeof attrs>).forEach((key) => {
            ExpressionAttributeNames[`#${String(key)}`] = key;
            /*Below line will emit compile warning if you do not use 
            "as Array<keyof typeof attrs>" in above line after "Object.keys(attrs)"
            as key will be of type 'any' instead of string*/
            ExpressionAttributeValues[`:${String(key)}`] = attrs[key]; 
            UpdateExpressionArr.push(`#${String(key)} = :${String(key)}`);
        });

        return this.client.send(
            new UpdateCommand({
                TableName : this.config.tableName,
                Key : {
                    id: id, //Input Param
                },
                UpdateExpression: `set ${UpdateExpressionArr.join(", ")}`,
                ExpressionAttributeNames,
                ExpressionAttributeValues,
            })
        );

    }
}