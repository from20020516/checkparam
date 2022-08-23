#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CheckparamStack } from '../lib/checkparam-stack'

const app = new cdk.App()
new CheckparamStack(app, 'CheckparamStack')
