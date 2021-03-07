
import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as lambda from '@aws-cdk/aws-lambda';
import * as neptune from "@aws-cdk/aws-neptune";
import * as appsync from '@aws-cdk/aws-appsync';
import * as cognito from '@aws-cdk/aws-cognito'

export class Project17Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);



    const userPool = new cognito.UserPool(this, 'project17UserPool', {
      userPoolName: 'project17UserPool',
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: 'Verify your email for our awesome app!',
        emailBody: 'Hello {username}, Thanks for signing up to our awesome app! Your verification code is {####}',
        emailStyle: cognito.VerificationEmailStyle.CODE,
        smsMessage: 'Hello {username}, Thanks for signing up to our awesome app! Your verification code is {####}',
      },
      signInAliases: {
        username: true,
        email: true
      },
      standardAttributes: {
        nickname: {
          required: false,
          mutable: true,
        },
        address:{
          required: true,
          mutable: false
        }
      }
    });

    const userPoolClient = new cognito.UserPoolClient(this, "project15UserPoolClient", {
      userPool,
    })

    new cdk.CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId,
    })

    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId,
    })





      // The code that defines your stack goes here
      const vpc = new ec2.Vpc(this, "Vpc", {
        subnetConfiguration: [
          {
            cidrMask: 24, // Creates a size /24 IPv4 subnet (a range of 256 private IP addresses) in the VPC
            name: 'Ingress',
            subnetType: ec2.SubnetType.ISOLATED,
          }
        ]
      });
  
  
      // Create a security group and subnetgroup to ensure lambda and neptune cluster deploy on the same vpc
      const sg1 = new ec2.SecurityGroup(this, "mySecurityGroup1", {
        vpc,
        allowAllOutbound: true,
        description: "security group 1",
        securityGroupName: "mySecurityGroup",
      });
      cdk.Tags.of(sg1).add("Name", "mySecurityGroup");
  
      sg1.addIngressRule(sg1, ec2.Port.tcp(8182), "MyRule");
  
      const neptuneSubnet = new neptune.CfnDBSubnetGroup(
        this,
        "neptuneSubnetGroup",
        {
          dbSubnetGroupDescription: "My Subnet",
          subnetIds: vpc.selectSubnets({ subnetType: ec2.SubnetType.ISOLATED })
            .subnetIds,
          dbSubnetGroupName: "mysubnetgroup",
        }
      );
  
      // Creating neptune cluster
      const neptuneCluster = new neptune.CfnDBCluster(this, "MyCluster", {
        dbSubnetGroupName: neptuneSubnet.dbSubnetGroupName,
        dbClusterIdentifier: "myDbCluster",
        vpcSecurityGroupIds: [sg1.securityGroupId],
      });
      neptuneCluster.addDependsOn(neptuneSubnet);
  
  
      // Creating neptune instance
      const neptuneInstance = new neptune.CfnDBInstance(this, "myinstance", {
        dbInstanceClass: "db.t3.medium",
        dbClusterIdentifier: neptuneCluster.dbClusterIdentifier,
        availabilityZone: vpc.availabilityZones[0],
      });
      neptuneInstance.addDependsOn(neptuneCluster);
  
      // add this code after the VPC code
      const handler = new lambda.Function(this, "Lambda", { 
        runtime: lambda.Runtime.NODEJS_10_X,
        code: new lambda.AssetCode("lambda"),
        handler: "main.handler",
        vpc: vpc,
        securityGroups: [sg1],
        environment: {
          NEPTUNE_ENDPOINT: neptuneCluster.attrEndpoint
        },
        vpcSubnets:
          {
            subnetType: ec2.SubnetType.ISOLATED                                                                                                               
          }
      });
  
  
      //https://github.com/aws-samples/aws-dbs-refarch-graph/tree/master/src/accessing-from-aws-lambda
      //We will review this link and update our code latter to put the lambda outside the VPC
  
     new cdk.CfnOutput(this, "Neptune Endpoint", {
       value: neptuneCluster.attrEndpoint
     }
     )



     
    const api = new appsync.GraphqlApi(this, "project17API", {
      name: "project17API",
      schema: appsync.Schema.fromAsset("graphql/schema.graphql"),
    })

    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: api.graphqlUrl,
    })
  
    

    

    userPool.addTrigger(cognito.UserPoolOperation.PRE_SIGN_UP, new lambda.Function(this, 'signupTrigger', {
      runtime: lambda.Runtime.NODEJS_10_X,
    handler: 'preSignup.handler',
    code: new lambda.AssetCode("lambda"),
    environment: {
      API_KEY: api.apiKey!,
      API_URL: api.graphqlUrl
    },
  }));




    const lambda_data_source = api.addLambdaDataSource("lamdaDataSource", handler);

    lambda_data_source.createResolver({
      typeName: "Mutation",
      fieldName: "createPerson"
    })

    
    lambda_data_source.createResolver({
      typeName: "Mutation",
      fieldName: "createRestaurant"
    })

    lambda_data_source.createResolver({
      typeName: "Mutation",
      fieldName: "createReview"
    })

    
    lambda_data_source.createResolver({
      typeName: "Mutation",
      fieldName: "reviewRating"
    })

     
    lambda_data_source.createResolver({
      typeName: "Mutation",
      fieldName: "createCuisine"
    })

     
    lambda_data_source.createResolver({
      typeName: "Mutation",
      fieldName: "addCuisineToRestaurant"
    })

    lambda_data_source.createResolver({
      typeName: "Mutation",
      fieldName: "addFriend"
    })

    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "findFriends"
    })

    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "findFriendsOfFriendsQuery"
    })

    
    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "topRatedSpecificCuisineRestaurantsNearme"
    })

    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "topRestaurantsNearMe"
    })
    
    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "restaurantLatestReviews"
    })

    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "restaurantsFriendsRecommend"
    })

    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "restaurantsFriendsRecommendReviewRating"
    })
    
    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "restaurantsFriendsReviewedinPastDays"
    })
    
    
    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "getAllCuisines"
    })
    
    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "getAllRestaurants"
    })
    
    
    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "getRestaurantInfo"
    })
    
    lambda_data_source.createResolver({
      typeName: "Query",
      fieldName: "getReviewsLikesDislikes"
    })
    

    
        
    
  }
}

