output "hosting_bucket_name" {
  value       = aws_s3_bucket.hosting.bucket
  description = "Nombre del bucket S3 para el hosting"
}

output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.hosting.domain_name
  description = "Dominio de CloudFront para el acceso público"
}
