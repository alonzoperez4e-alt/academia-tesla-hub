data "aws_caller_identity" "current" {}

locals {
  name_prefix = lower(replace("${var.prefix}-${var.environment}", "_", "-"))
}

resource "aws_s3_bucket" "hosting" {
  bucket = "${local.name_prefix}-hosting"
}

resource "aws_s3_bucket_public_access_block" "hosting" {
  bucket = aws_s3_bucket.hosting.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "hosting" {
  bucket = aws_s3_bucket.hosting.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "hosting" {
  bucket = aws_s3_bucket.hosting.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

resource "aws_cloudfront_origin_access_control" "hosting" {
  name                             = "${local.name_prefix}-oac"
  description                      = "OAC for ${local.name_prefix}"
  origin_access_control_origin_type = "s3"
  signing_behavior                 = "always"
  signing_protocol                 = "sigv4"
}

resource "aws_cloudfront_distribution" "hosting" {
  enabled            = true
  is_ipv6_enabled    = true
  default_root_object = "index.html"
  comment            = "${local.name_prefix} hosting"

  origin {
    domain_name             = aws_s3_bucket.hosting.bucket_regional_domain_name
    origin_id               = "s3-${aws_s3_bucket.hosting.bucket}"
    origin_access_control_id = aws_cloudfront_origin_access_control.hosting.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-${aws_s3_bucket.hosting.bucket}"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = data.aws_cloudfront_cache_policy.caching_optimized.id
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

data "aws_iam_policy_document" "hosting_bucket" {
  statement {
    sid    = "AllowCloudFrontRead"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = ["s3:GetObject"]

    resources = ["${aws_s3_bucket.hosting.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.hosting.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "hosting" {
  bucket = aws_s3_bucket.hosting.id
  policy = data.aws_iam_policy_document.hosting_bucket.json

  depends_on = [aws_s3_bucket_public_access_block.hosting]
}
