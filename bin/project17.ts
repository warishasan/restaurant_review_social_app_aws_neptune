#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Project17Stack } from '../lib/project17-stack';

const app = new cdk.App();
new Project17Stack(app, 'Project17Stack');
