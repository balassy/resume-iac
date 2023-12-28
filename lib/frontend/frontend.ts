import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Effect, IManagedPolicy, ManagedPolicy, PolicyStatement, Role, WebIdentityPrincipal } from 'aws-cdk-lib/aws-iam';
import { Bucket, IBucket, BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { AllowedMethods, Distribution, Function, FunctionCode, FunctionEventType, IDistribution, IFunction, IOrigin, OriginAccessIdentity, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { Certificate, ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { ARecord, HostedZone, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { NagSuppressions } from 'cdk-nag';
import { IFrontendProps } from './types';
import path = require('path');
import { AccountId, GitHubUserName, GitHubRepoName, Arn } from '../types';

export class Frontend extends Construct {
  constructor(scope: Construct, id: string, props: IFrontendProps) {
    super(scope, id);

    const s3RootBucket: IBucket = this.createS3Bucket();

    const s3Origin: IOrigin = this.createS3Origin(s3RootBucket);

    const certificate: ICertificate = this.findCertificate(props.certificateArn);

    const cloudFrontRequestHandlerFunction: IFunction = this.createCloudFrontRequestHandlerFunction();
    const cloudFrontDistribution: IDistribution = this.createCloudFrontDistribution(s3Origin, certificate, [props.domainName, props.domainAlias], cloudFrontRequestHandlerFunction);

    const hostedZone: IHostedZone = this.findHostedZone(props.hostedZoneName, props.hostedZoneId);

    this.createDnsRecords(hostedZone, cloudFrontDistribution, props.domainAlias);

    this.createUploadPermissions(s3RootBucket, cloudFrontDistribution, props.accountId, props.gitHubUserName, props.gitHubRepoName);
  }

  
  private createS3Bucket(): IBucket {
    const bucket = new Bucket(this, 'RootBucket', {
      accessControl: BucketAccessControl.PRIVATE,
      enforceSSL: true
    });
    
    NagSuppressions.addResourceSuppressions(bucket, [{
      id: 'AwsSolutions-S1',
      reason: 'Disabling server acccess logs is accepted for this simple resume site in the free tier.'
    }]);

    new cdk.CfnOutput(this, 'OutputAwsBucketName', {
      value: bucket.bucketName
    }).overrideLogicalId('AwsBucketName');

    return bucket;
  }

  private createS3Origin(bucket: IBucket) : IOrigin {
    const originAccessIdentity = new OriginAccessIdentity(this, 'OriginAccessControl');
    return new S3Origin(bucket, {
      originAccessIdentity
    });
  }

  private createCloudFrontRequestHandlerFunction(): IFunction {
    return new Function(this, 'DistributionDefaultDocHandler', {
      code: FunctionCode.fromFile({
        filePath: path.join(__dirname, 'cloudfront-handlers', 'request-handler.js')
      }),
      comment: 'Adds index.html to the end of directory paths and redirects from www to apex domain.'
    });
  }

  private createCloudFrontDistribution(origin: IOrigin, certificate: ICertificate, domainNames: string[], requestHandler: IFunction): IDistribution {
    const distribution = new Distribution(this, 'Distribution', {
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

    new cdk.CfnOutput(this, 'OutputAwsCloudfrontDistributionId', {
      value: distribution.distributionId
    }).overrideLogicalId('AwsCloudfrontDistributionId');

    return distribution;
  }

  private findCertificate(certificateArn: string): ICertificate {
    return Certificate.fromCertificateArn(this, 'Certificate', certificateArn);
  }

  private findHostedZone(zoneName: string, hostedZoneId: string): IHostedZone {
    return HostedZone.fromHostedZoneAttributes(this, 'DnsHostedZone', {
      zoneName,
      hostedZoneId
    });
  }

  private createDnsRecords(zone: IHostedZone, cloudFrontDistribution: IDistribution, domainAlias: string) {
    new ARecord(this, 'DnsARecord', {
      zone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudFrontDistribution))      
    });

    new ARecord(this, 'DnsAliasRecord', {
      zone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudFrontDistribution)),
      recordName: `${domainAlias}.`     
    });
  }

  private createUploadPermissions(bucket: IBucket, cloudFrontDistribution: IDistribution, accountId: AccountId, gitHubUserName: GitHubUserName, gitHubRepoName: GitHubRepoName) {
    const cloudFrontDistributionArn: string = `arn:aws:cloudfront::${accountId}:distribution/${cloudFrontDistribution.distributionId}`;
    const openIdConnectProviderArn: string = `arn:aws:iam::${accountId}:oidc-provider/token.actions.githubusercontent.com`;

    const policy = this.createUploaderPolicy(bucket.bucketArn, cloudFrontDistributionArn);
    this.createUploaderRole(policy, openIdConnectProviderArn, gitHubUserName, gitHubRepoName);
  }

  private createUploaderPolicy(bucketArn: Arn, cloudFrontDistributionArn: Arn): IManagedPolicy {
    return new ManagedPolicy(this, 'UploaderPolicy', {
      description: 'All permissions required to update the resume frontend application.',
      statements: [
        new PolicyStatement({
          sid: 'UploadFiles',
          effect: Effect.ALLOW,
          actions: [
            's3:DeleteObject',
            's3:GetBucketLocation',
            's3:GetObject',
            's3:ListBucket',
            's3:PutObject'
          ],
          resources: [
            bucketArn,
            `${bucketArn}/*`
          ]
        }),
        new PolicyStatement({
          sid: 'InvalidateCache',
          effect: Effect.ALLOW,
          actions: [
            'cloudfront:CreateInvalidation',
            'cloudfront:GetInvalidation'
          ],
          resources: [
            cloudFrontDistributionArn
          ]
        })
      ]
    });
  }

  private createUploaderRole(policy: IManagedPolicy, openIdConnectProviderArn: Arn, gitHubUserName: GitHubUserName, gitHubRepoName: GitHubRepoName) {
    const principal = new WebIdentityPrincipal(
      openIdConnectProviderArn,
      {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com'
        },
        StringLike: {
          'token.actions.githubusercontent.com:sub': `repo:${gitHubUserName}/${gitHubRepoName}:*`
        }
      }
    );   

    const role = new Role(this, 'UploaderRole', {
      description: 'The permissions assigned to the GitHub Actions workflow that updates the frontend.',
      assumedBy: principal,
      managedPolicies: [ policy ]
    });

    new cdk.CfnOutput(this, 'OutputAwsUploadRoleArn', {
      value: role.roleArn
    }).overrideLogicalId('AwsUploadRoleArn');
  }
}