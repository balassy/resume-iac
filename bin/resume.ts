#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { ResumeStack } from '../lib/resume-stack';
import { BootstrapStack } from '../lib/bootstrap/bootstrap-stack';

const app = new cdk.App();

Aspects.of(app).add(new AwsSolutionsChecks({verbose: true}));

new ResumeStack(app, 'ResumeStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
});

new BootstrapStack(app, 'ResumeBootstrapStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
});
