# Gmail Finance Manager - Google Cloud Infrastructure
terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "Google Cloud Region"
  type        = string
  default     = "us-central1"
}

variable "database_url" {
  description = "Neon Database URL"
  type        = string
  sensitive   = true
}

variable "google_client_id" {
  description = "Google OAuth Client ID"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret"
  type        = string
  sensitive   = true
}

variable "session_secret" {
  description = "Session Secret Key"
  type        = string
  sensitive   = true
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "cloud_run_api" {
  service = "run.googleapis.com"
}

resource "google_project_service" "cloud_build_api" {
  service = "cloudbuild.googleapis.com"
}

resource "google_project_service" "artifact_registry_api" {
  service = "artifactregistry.googleapis.com"
}

# Artifact Registry for Docker images
resource "google_artifact_registry_repository" "gmail_finance_repo" {
  location      = var.region
  repository_id = "gmail-finance-manager"
  description   = "Gmail Finance Manager container images"
  format        = "DOCKER"

  depends_on = [google_project_service.artifact_registry_api]
}

# Secret Manager for environment variables
resource "google_secret_manager_secret" "database_url" {
  secret_id = "database-url"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "database_url" {
  secret      = google_secret_manager_secret.database_url.id
  secret_data = var.database_url
}

resource "google_secret_manager_secret" "google_client_id" {
  secret_id = "google-client-id"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "google_client_id" {
  secret      = google_secret_manager_secret.google_client_id.id
  secret_data = var.google_client_id
}

resource "google_secret_manager_secret" "google_client_secret" {
  secret_id = "google-client-secret"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "google_client_secret" {
  secret      = google_secret_manager_secret.google_client_secret.id
  secret_data = var.google_client_secret
}

resource "google_secret_manager_secret" "session_secret" {
  secret_id = "session-secret"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "session_secret" {
  secret      = google_secret_manager_secret.session_secret.id
  secret_data = var.session_secret
}

# IAM role for Cloud Run to access secrets
resource "google_project_iam_member" "cloud_run_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# Service account for Cloud Run
resource "google_service_account" "cloud_run_sa" {
  account_id   = "gmail-finance-cloud-run"
  display_name = "Gmail Finance Manager Cloud Run Service Account"
  description  = "Service account for Gmail Finance Manager Cloud Run service"
}

# Cloud Run service
resource "google_cloud_run_v2_service" "gmail_finance_service" {
  name     = "gmail-finance-manager"
  location = var.region

  depends_on = [google_project_service.cloud_run_api]

  template {
    scaling {
      min_instance_count = 1
      max_instance_count = 10
    }

    service_account = google_service_account.cloud_run_sa.email

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/gmail-finance-manager/gmail-finance-manager:latest"
      
      ports {
        container_port = 8080
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.database_url.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "GOOGLE_CLIENT_ID"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.google_client_id.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "GOOGLE_CLIENT_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.google_client_secret.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "SESSION_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.session_secret.secret_id
            version = "latest"
          }
        }
      }

      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }

      liveness_probe {
        http_get {
          path = "/api/health"
          port = 8080
        }
        initial_delay_seconds = 30
        period_seconds        = 10
      }

      startup_probe {
        http_get {
          path = "/api/ready"
          port = 8080
        }
        initial_delay_seconds = 5
        period_seconds        = 5
        failure_threshold     = 10
      }
    }
  }

  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }
}

# Allow public access to the Cloud Run service
resource "google_cloud_run_v2_service_iam_member" "public_access" {
  location = google_cloud_run_v2_service.gmail_finance_service.location
  name     = google_cloud_run_v2_service.gmail_finance_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Cloud Build trigger for automatic deployments
resource "google_cloudbuild_trigger" "gmail_finance_trigger" {
  name     = "gmail-finance-deploy"
  filename = "cloudbuild.yaml"

  github {
    owner = "YOUR_GITHUB_USERNAME"  # Replace with actual GitHub username
    name  = "gmail-finance-manager" # Replace with actual repository name
    push {
      branch = "^main$"
    }
  }

  substitutions = {
    _REGION     = var.region
    _PROJECT_ID = var.project_id
  }

  depends_on = [google_project_service.cloud_build_api]
}

# Output values
output "cloud_run_url" {
  description = "URL of the deployed Cloud Run service"
  value       = google_cloud_run_v2_service.gmail_finance_service.uri
}

output "artifact_registry_url" {
  description = "URL of the Artifact Registry repository"
  value       = google_artifact_registry_repository.gmail_finance_repo.name
}