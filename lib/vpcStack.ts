import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class VpcStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'Vpc', {
      ipProtocol: ec2.IpProtocol.DUAL_STACK,
      natGateways: 0, // NAT Gateways cost money; we avoid them
      subnetConfiguration: [
        {
          name: 'PublicIPv6Only',
          subnetType: ec2.SubnetType.PUBLIC,
          mapPublicIpOnLaunch: false, // Ensure NO Public IPv4 is assigned
        },
      ],
    });

    this.vpc.addInterfaceEndpoint('ssm', {
      service: ec2.InterfaceVpcEndpointAwsService.SSM,
    });
    this.vpc.addInterfaceEndpoint('ssmmessages', {
      service: ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES,
    });
    this.vpc.addInterfaceEndpoint('ec2messages', {
      service: ec2.InterfaceVpcEndpointAwsService.EC2_MESSAGES,
    });
    this.vpc.addGatewayEndpoint('s3', {
      service: ec2.GatewayVpcEndpointAwsService.S3,
    });
  }
}
