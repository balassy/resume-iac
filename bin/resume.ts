#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ResumeStack } from '../lib/resume-stack';

const app = new cdk.App();
new ResumeStack(app, 'ResumeStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */

  certificateArn: 'arn:aws:acm:us-east-1:469685831701:certificate/d07887ab-04a1-479d-b9f8-70766740a7bb',
  domainName: 'staging.balassy.me',
  domainAlias: 'www.staging.balassy.me',
  hostedZoneName: 'staging.balassy.me',
  hostedZoneId: 'Z0405716G8G6B49GG8IT'
});