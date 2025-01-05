import * as cdk from 'aws-cdk-lib';
import * as lambdaFn from 'aws-cdk-lib/aws-lambda-nodejs'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3Notification from 'aws-cdk-lib/aws-s3-notifications'
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from 'constructs';
import {resolve} from 'path'
import * as LambdaEnvType from "../../lib/lambdaEnv"



export class VidShareAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    

    //2.  Upload Video Bucket (S3)

    //3. DynamoDB

    //General Info
    const table = new dynamodb.Table(this, 'VideoTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY //Need to explicity mention that this table need to be destroyed during "CDK Destroy"
    });

    //additional info
    table.addGlobalSecondaryIndex({
      indexName: "byUserId",
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'uploadedTime', type: dynamodb.AttributeType.NUMBER },
    });

    // Upload Video Bucket (S3)
    const uploadBucket = new s3.Bucket(this, "UploadBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY //Need to explicity mention that this s3 bucket need to be destroyed during "CDK Destroy"
    });

    //4.  Put Handler
    const putHandlerEnv : LambdaEnvType.PutHandler = {
        VIDEO_TABLE_NAME : table.tableName,
        VIDEO_TABLE_REGION : this.region,
        UPLOAD_BUCKET_NAME : uploadBucket.bucketName,
        UPLOAD_BUCKET_REGION : this.region,
    }
    const putHandler = new lambdaFn.NodejsFunction(this, "PutHandler", {
      entry: resolve(__dirname, "../../lambdas/putHandler.ts"),
      handler: "handler",
      bundling: {
        nodeModules: [ 'uuid', 'zod', '@smithy/core' ,'@aws-sdk/core'], // Mark as external
      }, 
      environment: putHandlerEnv,
    });

    //5. S3EventListener Handler
    const s3EventListenerEnv: LambdaEnvType.S3EventListener = {
      VIDEO_TABLE_NAME : table.tableName,
      VIDEO_TABLE_REGION : this.region,
      UPLOAD_BUCKET_NAME : uploadBucket.bucketName,
      UPLOAD_BUCKET_REGION : this.region,
      MEDIA_INFO_CLI_PATH : "./mediaInfo",
    };
    const s3EventListener = new lambdaFn.NodejsFunction(this, "s3EventListener", {
      entry: resolve(__dirname, "../../lambdas/s3EventListener.ts"),
      handler: "handler",
      bundling: {
        commandHooks: {
            //We need to copy mediainfo utillity after bundling done
            afterBundling(inputDir, outputDir) {
              return [
                `cp '${inputDir}/mediaInfo/mediainfo' '${outputDir}'`,
              ];
            },

            //For some reason type script need all 3 command hook function
            beforeBundling(inputDir, outputDir) {return []},

            //For some reason type script need all 3 command hook function
            beforeInstall(inputDir, outputDir) {return []},
        }, //commandHooks,
        nodeModules: [ 'uuid', 'zod', '@smithy/core' ,'@aws-sdk/core'], // Mark as external
      }, //bundling
      environment: s3EventListenerEnv,
    });

    //5.1 Send s3 event notification to our lambda
    uploadBucket.addObjectCreatedNotification(new s3Notification.LambdaDestination(s3EventListener));

    //1. API Gateway
    const mainApi = new apigateway.RestApi(this, 'VidShareMainApi', {
      deploy : false // Dont do default deploy and stagging let's do explicitly
    });
    //Similar to API Gateway in AWS Console
    mainApi.root
    .addResource("Video")
    .addMethod("PUT", new apigateway.LambdaIntegration(putHandler));

    //Now let's do explicit deployment of API Gateway
    mainApi.deploymentStage = new apigateway.Stage(
      this,
      "VidShareMainApiDevStage",
      {
        stageName: "dev",
        deployment: new apigateway.Deployment(this, "VidShareMainApiDevDeployment",
          {api: mainApi, }
        )
      }
    );

    //Provide access to putHandler to update dynamodb table and put data in to s3
    table.grantWriteData(putHandler);
    table.grantWriteData(s3EventListener);
    uploadBucket.grantPut(putHandler);
    uploadBucket.grantRead(s3EventListener);
  
  }
}
