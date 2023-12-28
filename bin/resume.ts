#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { ResumeStack } from '../lib/resume-stack';
import { BootstrapStack } from '../lib/bootstrap/bootstrap-stack';

const app = new cdk.App();

// Add tags to all objects.
cdk.Tags.of(app).add('project', 'resume');

// Run best practices check during build.
Aspects.of(app).add(new AwsSolutionsChecks({verbose: true}));

new ResumeStack(app, 'Resume', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  description: 'This stack includes all resources needed for the Resume application.'
});

new BootstrapStack(app, 'ResumeBootstrap', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  description: 'This stack includes all resources needed for the deployment of the infrastructure of the Resume application.'
});
