import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket, IBucket, BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { AllowedMethods, Distribution, IDistribution, IOrigin, OriginAccessIdentity, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { Certificate, ICertificate } from 'aws-cdk-lib/aws-certificatemanager';

export class ResumeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const s3RootBucket: IBucket = this.createS3Bucket();

    const s3Origin: IOrigin = this.createS3Origin(s3RootBucket);

    const certificate: ICertificate = Certificate.fromCertificateArn(this, 'ResumeFrontendCertificate', 'arn:aws:acm:us-east-1:469685831701:certificate/d07887ab-04a1-479d-b9f8-70766740a7bb');

    this.createCloudFrontDistribution(s3Origin, certificate);
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

  private createCloudFrontDistribution(origin: IOrigin, certificate: ICertificate): IDistribution {
    return new Distribution(this, 'ResumeFrontendDistribution', {
      defaultBehavior: {
        origin,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS
      },
      defaultRootObject: 'index.html',
      domainNames: [
        'staging.balassy.me',
        'www.staging.balassy.me'
      ],
      certificate
    });
  }
}
