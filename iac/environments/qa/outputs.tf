output "hosting_bucket_name" {
  value       = module.hosting.hosting_bucket_name
  description = "Nombre del bucket S3 para el hosting"
}

output "cloudfront_domain_name" {
  value       = module.hosting.cloudfront_domain_name
  description = "Dominio de CloudFront para el acceso público"
}
