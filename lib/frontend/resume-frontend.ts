import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket, IBucket, BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { AllowedMethods, Distribution, IDistribution, IOrigin, OriginAccessIdentity, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { Certificate, ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { ARecord, AaaaRecord, HostedZone, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { IResumeFrontendParams } from './resume-frontend.types';

export interface IResumeFrontendProps extends IResumeFrontendParams {
};

export class ResumeFrontend extends Construct {
  constructor(scope: Construct, id: string, props: IResumeFrontendProps) {
    super(scope, id);

    const s3RootBucket: IBucket = this.createS3Bucket();

    const s3Origin: IOrigin = this.createS3Origin(s3RootBucket);

    const certificate: ICertificate = this.findCertificate(props.certificateArn);

    const cloudFrontDistribution:IDistribution = this.createCloudFrontDistribution(s3Origin, certificate, [props.domainName, props.domainAlias]);

    const hostedZone: IHostedZone = this.findHostedZone(props.hostedZoneName, props.hostedZoneId);

    this.createDnsRecords(hostedZone, cloudFrontDistribution, props.domainAlias);
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

  private createCloudFrontDistribution(origin: IOrigin, certificate: ICertificate, domainNames: string[]): IDistribution {
    return new Distribution(this, 'ResumeFrontendDistribution', {
      defaultBehavior: {
        origin,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS
      },
      defaultRootObject: 'index.html',
      domainNames,
      certificate
    });  
  }

  private findCertificate(certificateArn: string): ICertificate {
    return Certificate.fromCertificateArn(this, 'ResumeFrontendCertificate', certificateArn);
  }

  private findHostedZone(zoneName: string, hostedZoneId: string): IHostedZone {
    return HostedZone.fromHostedZoneAttributes(this, 'ResumeFrontendDnsHostedZone', {
      zoneName,
      hostedZoneId
    });
  }

  private createDnsRecords(zone: IHostedZone, cloudFrontDistribution: IDistribution, domainAlias: string) {
    new ARecord(this, 'ResumeFrontendDnsARecord', {
      zone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudFrontDistribution))      
    });

    new AaaaRecord(this, 'ResumeFrontendDnsAliasRecord', {
      zone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudFrontDistribution)),
      recordName: `${domainAlias}.`     
    });
  }
}