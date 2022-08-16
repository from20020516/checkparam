import {
  Stack,
  StackProps,
  RemovalPolicy,
  aws_codebuild as codebuild,
  aws_secretsmanager as sm,
} from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { App, BasicAuth, GitHubSourceCodeProvider } from '@aws-cdk/aws-amplify-alpha'

export class CheckparamStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const secret = new sm.Secret(this, 'Secret', {
      generateSecretString: {
        generateStringKey: 'DUMMY_KEY',
        secretStringTemplate: JSON.stringify({
          GITHUB_OAUTH_TOKEN: process.env.GITHUB_OAUTH_TOKEN ?? 'DUMMY_TOKEN',
        }),
        excludePunctuation: true,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    })

    const app = new App(this, 'App', {
      sourceCodeProvider: new GitHubSourceCodeProvider({
        owner: 'from20020516',
        repository: 'checkparam',
        /** @see https://docs.aws.amazon.com/amplify/latest/userguide/setting-up-GitHub-access.html */
        oauthToken: secret.secretValueFromJson('GITHUB_OAUTH_TOKEN'),
      }),
      autoBranchCreation: {
        autoBuild: true,
        pullRequestPreview: true,
        stage: 'DEVELOPMENT',
        patterns: [
          '!main',
          '*'
        ],
      },
      autoBranchDeletion: true,
      buildSpec: codebuild.BuildSpec.fromObjectToYaml({
        version: '1.0',
        frontend: {
          phases: {
            preBuild: {
              commands: [
                'npm ci',
              ]
            },
            build: {
              commands: [
                'npm run build',
              ]
            }
          },
          artifacts: {
            baseDirectory: 'build',
            files: [
              '**/*'
            ]
          },
        },
        cache: {
          paths: [
            'node_modules/**/*',
            "$(npm root --global)/**/*"
          ]
        }
      })
    })
    app.addBranch('main', { basicAuth: undefined, stage: 'PRODUCTION' })
  }
}
