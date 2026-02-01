import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface CheapEc2StackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
}

export class CheapEc2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CheapEc2StackProps) {
    super(scope, id, { ...props
        , terminationProtection: false 
    });

    // https://wiki.debian.org/Cloud/AmazonEC2Image
    const debianAmi = ec2.MachineImage.lookup({
      name: 'debian-12-arm64-*',
      owners: ['136693071363'], // Official Debian Account ID
    });

    const securityGroup = new ec2.SecurityGroup(this, 'InstanceSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true,
      allowAllIpv6Outbound: true,
    });

    // 3. Create the t4g.nano instance
    const instance = new ec2.Instance(this, 'CheapDebianInstance', {
      vpc: props.vpc,
      securityGroup: securityGroup,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.NANO),
      machineImage: debianAmi,
      ipv6AddressCount: 1,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      userData: ec2.UserData.forLinux({
        shebang: '#!/bin/bash',
      }),
    });

    instance.addUserData(
      'mkdir -p /tmp/ssm',
      'cd /tmp/ssm',
      'wget https://s3.us-west-2.amazonaws.com/amazon-ssm-us-west-2/latest/debian_arm64/amazon-ssm-agent.deb',
      'dpkg -i amazon-ssm-agent.deb',
      'systemctl enable amazon-ssm-agent',
      'systemctl start amazon-ssm-agent'
    );

    // 3. Security Group: Allow all outbound (Standard default)
    // Note: You can't SSH via IPv4. You must use IPv6 or SSM Session Manager.
    // IPv6 outbound is handled by allowAllIpv6Outbound: true in the Security Group.
    instance.role.addManagedPolicy(
      cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
    );

    new cdk.CfnOutput(this, 'InstanceId', { value: instance.instanceId });
  }
}