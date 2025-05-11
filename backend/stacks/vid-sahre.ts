import * as cdk from 'aws-cdk-lib';
import * as lambdaFn from 'aws-cdk-lib/aws-lambda-nodejs'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3Notification from 'aws-cdk-lib/aws-s3-notifications'
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from 'constructs';
import {resolve} from 'path'
import * as LambdaEnvType from "../../lib/lambdaEnv"
import * as event from 'aws-cdk-lib/aws-events'
import * as eventTarget from 'aws-cdk-lib/aws-events-targets'
import opensearch, { EngineVersion } from 'aws-cdk-lib/aws-opensearchservice'



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
      sortKey: { name: 'uploadTime', type: dynamodb.AttributeType.NUMBER },
    });

    // Upload Video Bucket (S3)
    const uploadBucket = new s3.Bucket(this, "UploadBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY //Need to explicity mention that this s3 bucket need to be destroyed during "CDK Destroy"
    });

    // Stream Bucket (S3)
    const streamBucket = new s3.Bucket(this, "streamBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY ,//Need to explicity mention that this s3 bucket need to be destroyed during "CDK Destroy"
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS, // disable only ACL blocking
      // OR completely allow public access:
      //blockPublicAccess: s3.BlockPublicAccess.NONE, // <--- add this line
    });

    streamBucket.grantPublicAccess()

    //4.  Put Handler
    const videoCrudHandlerEnv : LambdaEnvType.videoCrudHandler = {
        VIDEO_TABLE_NAME : table.tableName,
        VIDEO_TABLE_REGION : this.region,
        UPLOAD_BUCKET_NAME : uploadBucket.bucketName,
        UPLOAD_BUCKET_REGION : this.region,
    }
    const videoCrudHandler = new lambdaFn.NodejsFunction(this, "videoCrudHandler", {
      entry: resolve(__dirname, "../../lambdas/videoCrudHandler.ts"),
      handler: "handler",
      bundling: {
        nodeModules: [ 'uuid', 'zod', '@smithy/core' ,'@aws-sdk/core'], // Mark as external '@smithy/core' ,
        externalModules: ['@aws-sdk/nested-clients/sts', '@aws-sdk/nested-clients/sso-oidc'],
      }, 
      environment: videoCrudHandlerEnv,
    });

    //4b. Create MediaConvert Role to read from upload bucket and write to stream bucket
    const mediaConvertRole = new iam.Role(this, 'MediaConvertRole', {
      assumedBy: new iam.ServicePrincipal('mediaconvert.amazonaws.com'),
    });

    //4c. MediaConvertEventHandler
    const mediaConvertEventHandlerEnv: LambdaEnvType.MediaConvertEventHandler = {
      UPLOAD_BUCKET_NAME : uploadBucket.bucketName,
      UPLOAD_BUCKET_REGION : this.region,
      VIDEO_TABLE_NAME : table.tableName,
      VIDEO_TABLE_REGION : this.region
    }
    const mediaConvertEventHandler = new  lambdaFn.NodejsFunction(this, "MediaConvertEventHandler",
      {
        entry : resolve (__dirname, "../../lambdas/mediaConvertEventHandler.ts"),
        bundling: {
          nodeModules: [ 'uuid', 'zod', '@smithy/core' ,'@aws-sdk/core'], // Mark as external '@smithy/core' ,
          externalModules: ['@aws-sdk/nested-clients/sts', '@aws-sdk/nested-clients/sso-oidc'],
        },         
        environment : mediaConvertEventHandlerEnv
      }
    )

    //5. S3EventListener Handler
    const s3EventListenerEnv: LambdaEnvType.S3EventListener = {
      VIDEO_TABLE_NAME : table.tableName,
      VIDEO_TABLE_REGION : this.region,
      UPLOAD_BUCKET_NAME : uploadBucket.bucketName,
      UPLOAD_BUCKET_REGION : this.region,
      MEDIA_INFO_CLI_PATH : "./mediaInfo",
      MEDIA_CONVERT_ENDPOINT : "https://xnbzilj6c.mediaconvert.ap-south-1.amazonaws.com",   
      MEDIA_CONVERT_OUTPUT_BUCKET : streamBucket.bucketName,
      MEDIA_CONVERT_REGION : this.region,         
      MEDIA_CONVERT_ROLE_ARN : mediaConvertRole.roleArn
    };
    const s3EventListener = new lambdaFn.NodejsFunction(this, "s3EventListener", {
      entry: resolve(__dirname, "../../lambdas/s3EventListener.ts"),
      handler: "handler",
      timeout: cdk.Duration.seconds(15),
      bundling: {
        commandHooks: {
            //We need to copy mediaInfo utillity after bundling done
            afterBundling(inputDir, outputDir) {
              return [
                `echo "Listing input dir..."`,
                `ls -la '${inputDir}/mediaInfo'`,                
                `cp '${inputDir}/mediaInfo/mediainfo' '${outputDir}'`,
              ];
            },

            //For some reason type script need all 3 command hook function
            beforeBundling(inputDir, outputDir) {return []},

            //For some reason type script need all 3 command hook function
            beforeInstall(inputDir, outputDir) {return []},
        }, //commandHooks,
        nodeModules: [ 'uuid', 'zod',  '@smithy/core' ,'@aws-sdk/core'], // Mark as external '@smithy/core' ,
        externalModules: ['@aws-sdk/nested-clients/sts', '@aws-sdk/nested-clients/sso-oidc'],
      }, //bundling
      environment: s3EventListenerEnv,
    });

    //5.1 Send s3 event notification to our lambda
    uploadBucket.addObjectCreatedNotification(new s3Notification.LambdaDestination(s3EventListener));

    //5.2 MediaConvertJobStateChangeRule
    new event.Rule(this, "MediaConvertJobStateChangeRule", {
      eventPattern : {
          "source": ["aws.mediaconvert"],
          "detailType": ["MediaConvert Job State Change"],
          "detail": {
            "status": ["ERROR", "COMPLETE", "PROGRESSING"]
          }
      },
      targets : [
        new eventTarget.LambdaFunction(mediaConvertEventHandler)
      ]
    })


    //1. API Gateway
    const mainApi = new apigateway.RestApi(this, 'VidShareMainApi', {
      deploy : false // Dont do default deploy and stagging let's do explicitly
    });
    //Similar to API Gateway in AWS Console
    mainApi.root
    .addResource("video")
    .addMethod("ANY", new apigateway.LambdaIntegration(videoCrudHandler));

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

    //OpenSearch Domain
    const domain = new opensearch.Domain(this, "Domain", {
      version: EngineVersion.OPENSEARCH_2_3,
      capacity: {
        dataNodes : 1,
        dataNodeInstanceType : "t3.small.search",
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY, //Need to explicity mention that this s3 bucket need to be destroyed during "CDK Destroy"
    })
      
    //Provide access to videoCrudHandler to update dynamodb table and put data in to s3
    table.grantReadWriteData(videoCrudHandler);
    table.grantWriteData(s3EventListener);
    table.grantWriteData(mediaConvertEventHandler);
    uploadBucket.grantPut(videoCrudHandler);
    uploadBucket.grantRead(s3EventListener);
    uploadBucket.grantDelete(mediaConvertEventHandler);
    uploadBucket.grantRead(mediaConvertRole);
    streamBucket.grantWrite(mediaConvertRole);  

    domain.addAccessPolicies(
      new iam.PolicyStatement({
        actions: ["*"],
        resources: ["*"],
        effect: iam.Effect.ALLOW,
        principals: [new iam.ArnPrincipal("arn:aws:iam::086505785551:user/opean-search-admin")],
      })
    );

    /*Now we need enhance the Role Policy of s3Evenlisterer lambda to 
    transfer the ARN of our mediaConvertRole to the MediaConvertClient during the
    video convert operation*/
    s3EventListener.role?.attachInlinePolicy(
      new iam.Policy(this, "S3EventListenerPolicy#passRole", {
        statements: [
          new iam.PolicyStatement({
              actions: ["iam:PassRole", "mediaconvert:CreateJob"],
              resources: ["*"],
          }),
        ],
      })
    );
  }
}
