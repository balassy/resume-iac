# Resume IaC

[![Continuous Integration - Build](https://github.com/balassy/resume-iac/actions/workflows/build.yml/badge.svg)](https://github.com/balassy/resume-iac/actions/workflows/build.yml)

[![Continuous Integration - Deploy](https://github.com/balassy/resume-iac/actions/workflows/build-and-deploy.yml/badge.svg)](https://github.com/balassy/resume-iac/actions/workflows/build-and-deploy.yml)

Infrastructure as a Code configuration using [AWS Cloud Development Kit (CDK)](https://aws.amazon.com/cdk/) for my resume website.

## Set up AWS access

1. Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
2. Log in to the account: `aws sso login`
3. Verify caller identity: `aws sts get-caller-identity`
4. Verify access with listing buckets: `aws s3 ls`

## Initialize the AWS account for the CDK

### CDK bootstrap

This will create the S3 bucket and related objects required for CDK metadata:

```shell
npx cdk bootstrap --tags project=resume
```

It it fails with `Unable to resolve AWS account to use.` you probably logged in to the AWS CLI with a named profiled instead of the default. In this case set these environment variables:

```powershell
$env:CDK_DEFAULT_ACCOUNT=123412341234
$env:CDK_DEFAULT_REGION='us-east-1'
```

And specify the `--profile` parameter:

```shell
npx cdk bootstrap --tags project=resume --profile my-sso-profile-name
```

Similarly, **specify the profile** in all npm script that calls the CDK:

```shell
npm run diff -- --profile my-sso-profile-name
```

### Undo CDK bootstrap

At the moment [there is no single command](https://github.com/aws/aws-cdk/issues/986) to delete every objects the bootstrap command created, so you have to do that manually.

Delete every object created by this stack:

```shell
npx cdk destroy
```

Delete the CloudFormation stack itself:

```shell
aws cloudformation delete-stack --stack-name CDKToolkit
```

Find the CDK bucket name: 

```shell
aws s3 ls | grep cdk
```

Delete bucket (`--force` is required to delete non-empty bucket):

```shell
aws s3 rb s3://TODO-ADD-BUCKET-NAME --force
```

## Set up AWS access for GitHub Actions

### Set up with CDK

You can use the `ResumeBootstrapStack` in this project to create objects in the AWS account for infrastructure and website deployment directly from GitHub Actions.

1. Build the source code: `npm run build:tsc`

2. Build the CloudFormation template: `npm run build:cdk: bootstrap`

3. **IMPORTANT!** Before running the following command check it in `package.json` because it contains hardcoded GitHub user and repository names as CDK input parameters! 

4. Deploy to the AWS account: `npm run deploy:bootstrap`

5. Note the output parameters from the deployment. They must be set as GitHub Actions secrets in this repository:

  - Environment secrets: `AWS_CDK_ROLE_ARN` for `Staging` and `Production` environments
  - Repository secrets: `AWS_REGION`

### Manual setup

For detailed steps follow [this](https://aws.amazon.com/blogs/security/use-iam-roles-to-connect-github-actions-to-actions-in-aws/) guide.

In short:

1. Create [GitHub OIDC provider](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services).

2. Check that the CDK bootstrap process successfully created `cdk-` roles in IAM.  

3. Create the `resume-iac-cdk` IAM policy:

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Effect": "Allow",
			"Action": [
				"sts:AssumeRole"
			],
			"Resource": [
				"arn:aws:iam::*:role/cdk-*"
			]
		}
	]
}
```

4. Create `resume-iac-deployer` IAM role:

Policy: `resume-iac-cdk`

Trust relationships:

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Effect": "Allow",
			"Principal": {
				"Federated": "arn:aws:iam::TODO-YOUR-ACCOUNT-ID:oidc-provider/token.actions.githubusercontent.com"
			},
			"Action": "sts:AssumeRoleWithWebIdentity",
			"Condition": {
				"StringEquals": {
					"token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
				},
				"StringLike": {
					"token.actions.githubusercontent.com:sub": "repo:TODO-YOUR-GITHUB-USERNAME/TODO-YOUR-GITHUB-REPO:*"
				}
			}
		}
	]
}
```

5. Copy the ARN of the `resume-iac-deployer` role and set it as the `AWS_CDK_ROLE_ARN` Actions environment secret to this GitHub repository for both `Staging` and `Production` environments.

6. Set the `AWS_REGION` Actions repository secret.

## Useful commands

| Command             | Description                                                                |
|---------------------|----------------------------------------------------------------------------|
| `npm run build:tsc` | Generate JavaScript files from the TypeScript source code.                 |
| `npm run build:cdk` | Generate (synthesize) the CloudFormation template to the `cdk.out` folder. |
| `npm run diff`      | Compares the stack with the content of the AWS account.                    |
| `npm run deploy`    | Create the resources in the AWS account.                                   |
| `npm run destroy`   | Delete the created resources from the AWS account.                         |
| `npx cdk`           | Run any CDK commands, e.g. `npx cdk --version`                             |


## How it works

NOTE: If no diagrams appear here then most probably the PlantUML Proxy Service timed out and could not render images from the source `.puml` files. In that case please refresh the page a little bit later.

IMPORTANT: If you use the [jebbs.plantuml](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml) Visual Studio Code extension to render PlantUML during development, and you see the diagrams rendered with dark theme instead of light theme then you probably have an outdated version of PlantUML. You can upgrade it by [downloading](https://plantuml.com/download) the latest `plantuml.jar` and overwriting the old one in the `$HOME/.vscode/extensions/jebbs.plantuml-<version>` folder. To display the version number you can add `Title %version()` to your `.puml` file.

### Bootstrap stack

![Bootstrap stack](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/balassy/resume-iac/main/bootstrap.puml)

### Build and deployment pipeline

![Build and deployment pipeline](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/balassy/resume-iac/main/pipeline.puml)

### Cloud architecture

![Cloud architecture](http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/balassy/resume-iac/main/architecture.puml)

## Behind the scenes

This project was created with:

```shell
npx aws-cdk init --language typescript
```

The `cdk.json` file tells the CDK Toolkit how to execute the app.

## Issues

`diff` does not work before first deployment: https://github.com/aws/aws-cdk/issues/17942
Solution: in `cdk.json` set `"@aws-cdk/core:newStyleStackSynthesis": false`






