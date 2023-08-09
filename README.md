# Resume IaC

Infrastructure as a Code configuration using [AWS Cloud Development Kit (CDK)](https://aws.amazon.com/cdk/) for my resume website.

## Set up AWS access

1. Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
2. Log in to the account: `aws sso login`
3. Verify caller identity: `aws sts get-caller-identity`
4. List buckets: `aws s3 ls`

## Initialize the AWS account for the CDK

### Bootstrap

This will create the S3 bucket and related objects required for CDK metadata:

```shell
npx cdk bootstrap --tags project=resume
```

### Undo bootstrap

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
				"Federated": "arn:aws:iam::236419181767:oidc-provider/token.actions.githubusercontent.com"
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

## Behind the scenes

This project was created with:

```shell
npx aws-cdk init --language typescript
```

The `cdk.json` file tells the CDK Toolkit how to execute the app.

## Issues

`diff` does not work before first deployment: https://github.com/aws/aws-cdk/issues/17942
Solution: in `cdk.json` set `"@aws-cdk/core:newStyleStackSynthesis": false`






