terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

module "hosting" {
  source      = "../../modules/hosting"
  prefix      = "academia-tesla-hub"
  environment = "dev"
}
