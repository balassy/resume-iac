#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ResumeStack } from '../lib/resume-stack';

const app = new cdk.App();

new ResumeStack(app, 'ResumeStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  certificateArn: 'arn:aws:acm:us-east-1:469685831701:certificate/d07887ab-04a1-479d-b9f8-70766740a7bb',
  //domainName: 'staging.balassy.me',
  domainAlias: 'www.staging.balassy.me',
  hostedZoneName: 'staging.balassy.me',
  hostedZoneId: 'Z0405716G8G6B49GG8IT'
});