import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket, IBucket, BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { AllowedMethods, Distribution, IDistribution, IOrigin, OriginAccessIdentity, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';

export class ResumeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const s3RootBucket = this.createS3Bucket();

    const s3Origin = this.createS3Origin(s3RootBucket);

    this.createCloudFrontDistribution(s3Origin);
  }

  private createS3Bucket(): IBucket {
    return new Bucket(this, 'ResumeFrontendRootBucket', {
      accessControl: BucketAccessControl.PRIVATE
    });
  }

  private createS3Origin(bucket: IBucket) : IOrigin {
    const originAccessIdentity = new OriginAccessIdentity(this, 'ResumeFrontendOriginAccessControl');
    return new S3Origin(bucket, {
      originAccessIdentity
    });
  }

  private createCloudFrontDistribution(origin: IOrigin): IDistribution {
    return new Distribution(this, 'ResumeFrontendDistribution', {
      defaultBehavior: {
        origin,
        viewerProtocolPolicy: ViewerProtocolPolicy.ALLOW_ALL,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS
      }
    });
  }
}
