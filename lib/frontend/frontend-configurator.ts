import * as cdk from 'aws-cdk-lib';
import { Effect, IOpenIdConnectProvider, ManagedPolicy, OpenIdConnectProvider, PolicyStatement, Role, WebIdentityPrincipal } from 'aws-cdk-lib/aws-iam';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from "constructs";
import { IFrontendParams } from './types';

const ParamNames = {
  DOMAIN_NAME: '/Resume/Frontend/DomainName',
  DOMAIN_ALIAS: '/Resume/Frontend/DomainAlias',
  CERTIFICATE_ARN: '/Resume/Frontend/CertificateArn',
  HOSTEDZONE_NAME: '/Resume/Frontend/HostedZoneName',
  HOSTEDZONE_ID: '/Resume/Frontend/HostedZoneId',
};

export class FrontendConfigurator extends Construct {
  constructor(scope: Construct, id: string ) {
    super(scope, id);
  }

  public getParams(): IFrontendParams {
    return {
      domainName: StringParameter.valueForStringParameter(this, ParamNames.DOMAIN_NAME),
      domainAlias: StringParameter.valueForStringParameter(this, ParamNames.DOMAIN_ALIAS),
      certificateArn: StringParameter.valueForStringParameter(this, ParamNames.CERTIFICATE_ARN),
      hostedZoneName: StringParameter.valueForStringParameter(this, ParamNames.HOSTEDZONE_NAME),
      hostedZoneId: StringParameter.valueForStringParameter(this, ParamNames.HOSTEDZONE_ID)
    };
  }

  public createParamsWithDefaults() {
    new StringParameter(this, 'DomainName', { parameterName: ParamNames.DOMAIN_NAME, stringValue: 'example.com' });
    new StringParameter(this, 'DomainAlias', { parameterName: ParamNames.DOMAIN_ALIAS, stringValue: 'www.example.com' });
    new StringParameter(this, 'CertificateArn', { parameterName: ParamNames.CERTIFICATE_ARN, stringValue: 'arn:aws:acm:us-east-1:...' });
    new StringParameter(this, 'HostedZoneName', { parameterName: ParamNames.HOSTEDZONE_NAME, stringValue: 'example.com' });
    new StringParameter(this, 'HostedZoneId', { parameterName: ParamNames.HOSTEDZONE_ID, stringValue: 'Z04057...' });
  }

  public createAccessPermissions(gitHubUserName: string, gitHubRepoName: string) {
    const gitHubIdentityProvider = new OpenIdConnectProvider(this, 'ResumeGitHubIdentityProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: [ // aka. Audiences
        'sts.amazonaws.com'
      ]
    });

    this.createAccessPermissionsForIaCUpdate(gitHubIdentityProvider, gitHubUserName, gitHubRepoName);
    this.createAccessPermissionsForFrontendUpdate();
  }

  private createAccessPermissionsForIaCUpdate(identityProvider: IOpenIdConnectProvider, gitHubUserName: string, gitHubRepoName: string) {
    const managedPolicy = new ManagedPolicy(this, 'IaCDeployPolicy', {
      description: 'Permissions required to IaC update from CDK.',
      statements: [new PolicyStatement({
        actions: [
          'sts:AssumeRole',
        ],
        resources: [
          'arn:aws:iam::*:role/cdk-*'
        ],
        effect: Effect.ALLOW
      })],
    });
    
    NagSuppressions.addResourceSuppressions(managedPolicy, [{
      id: 'AwsSolutions-IAM5',
      reason: 'Access is granted to perform all CDK operations.'
    }]);

    const principal = new WebIdentityPrincipal(
      identityProvider.openIdConnectProviderArn,
      {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com'
        },
        StringLike: {
          'token.actions.githubusercontent.com:sub': `repo:${gitHubUserName}/${gitHubRepoName}:*`
        }
      }
    );   

    const role = new Role(this, 'IaCDeployer', {
      description: 'The permissions assigned to the GitHub Actions workflow.',
      assumedBy: principal,
    });
    role.addManagedPolicy(managedPolicy);

    new cdk.CfnOutput(this, 'OutputAwsCdkRoleArn', {
      value: role.roleArn
    }).overrideLogicalId('AwsCdkRoleArn');
  }

  private createAccessPermissionsForFrontendUpdate() {

  }
}
