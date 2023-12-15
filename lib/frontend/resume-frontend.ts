import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket, IBucket, BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { AllowedMethods, Distribution, Function, FunctionCode, FunctionEventType, IDistribution, IFunction, IOrigin, OriginAccessIdentity, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { Certificate, ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { ARecord, HostedZone, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { NagSuppressions } from 'cdk-nag';
import { IResumeFrontendParams } from './resume-frontend.types';
import path = require('path');

export interface IResumeFrontendProps extends IResumeFrontendParams {
};

export class ResumeFrontend extends Construct {
  constructor(scope: Construct, id: string, props: IResumeFrontendProps) {
    super(scope, id);

    const s3RootBucket: IBucket = this.createS3Bucket();

    const s3Origin: IOrigin = this.createS3Origin(s3RootBucket);

    const certificate: ICertificate = this.findCertificate(props.certificateArn);

    const cloudFrontRequestHandlerFunction: IFunction = this.createCloudFrontRequestHandlerFunction();
    const cloudFrontDistribution:IDistribution = this.createCloudFrontDistribution(s3Origin, certificate, [props.domainName, props.domainAlias], cloudFrontRequestHandlerFunction);

    const hostedZone: IHostedZone = this.findHostedZone(props.hostedZoneName, props.hostedZoneId);

    this.createDnsRecords(hostedZone, cloudFrontDistribution, props.domainAlias);
  }

  
  private createS3Bucket(): IBucket {
    const bucket = new Bucket(this, 'ResumeFrontendRootBucket', {
      accessControl: BucketAccessControl.PRIVATE,
      enforceSSL: true
    });
    
    NagSuppressions.addResourceSuppressions(bucket, [{
      id: 'AwsSolutions-S1',
      reason: 'Disabling server acccess logs is accepted for this simple resume site in the free tier.'
    }]);

    return bucket;
  }

  private createS3Origin(bucket: IBucket) : IOrigin {
    const originAccessIdentity = new OriginAccessIdentity(this, 'ResumeFrontendOriginAccessControl');
    return new S3Origin(bucket, {
      originAccessIdentity
    });
  }

  private createCloudFrontRequestHandlerFunction(): IFunction {
    return new Function(this, 'ResumeFrontendDistributionDefaultDocHandler', {
      code: FunctionCode.fromFile({
        filePath: path.join(__dirname, 'cloudfront-handlers', 'request-handler.js')
      }),
      comment: 'Adds index.html to the end of directory paths and redirects from www to apex domain.'
    });
  }

  private createCloudFrontDistribution(origin: IOrigin, certificate: ICertificate, domainNames: string[], requestHandler: IFunction): IDistribution {
    const distribution = new Distribution(this, 'ResumeFrontendDistribution', {
      defaultBehavior: {
        origin,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS, 
        functionAssociations: [{
            function: requestHandler,
            eventType: FunctionEventType.VIEWER_REQUEST,
        }]
      },
      defaultRootObject: 'index.html',
      domainNames,
      certificate
    });

    NagSuppressions.addResourceSuppressions(distribution, [{
      id: 'AwsSolutions-CFR1',
      reason: 'This personal introduction site does not require geo restriction.'
    }, {
      id: 'AwsSolutions-CFR2',
      reason: 'This simple personal site in the free tier does not use WAF.'
    }, {
      id: 'AwsSolutions-CFR3',
      reason: 'Disabling access logging is accepted for this simple resume site in the free tier.'
    }])

    return distribution;
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

    new ARecord(this, 'ResumeFrontendDnsAliasRecord', {
      zone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudFrontDistribution)),
      recordName: `${domainAlias}.`     
    });
  }
}