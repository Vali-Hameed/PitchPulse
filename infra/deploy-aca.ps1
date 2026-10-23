<#
.SYNOPSIS
    Deploys PitchPulse Studio to Azure Container Apps (ACA) and Azure OpenAI.

.DESCRIPTION
    Automates end-to-end cloud provisioning:
    1. Provisions Resource Group in target region (default: westus3)
    2. Provisions Azure Container Registry (ACR)
    3. Builds and pushes the FastAPI backend container image
    4. Creates the Azure Container Apps Managed Environment
    5. Deploys the backend container app with ingress on port 8000
    6. Extracts backend FQDN and builds the Next.js frontend standalone image
    7. Deploys the frontend container app with ingress on port 3000
    8. Outputs live production broadcast URLs

.PARAMETER ResourceGroup
    Name of the Azure Resource Group (Default: rg-pitchpulse-studio)

.PARAMETER Location
    Azure Region (Default: westus3)

.PARAMETER AcrName
    Unique Azure Container Registry name (Default: acrpitchpulse<random>)
#>

param(
    [string]$ResourceGroup = "rg-pitchpulse-studio",
    [string]$Location = "westus3",
    [string]$AcrName = "acrpitchpulse$((Get-Random -Minimum 1000 -Maximum 9999))",
    [string]$AzureOpenAiKey = "",
    [string]$AzureOpenAiEndpoint = "",
    [string]$AzureOpenAiDeployment = "gpt-4o"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  PITCHPULSE STUDIO - AZURE CONTAINER APPS DEPLOYMENT     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Create Resource Group
Write-Host "`n[1/7] Creating Resource Group: $ResourceGroup ($Location)..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location --output none

# 2. Create ACR
Write-Host "`n[2/7] Creating Azure Container Registry: $AcrName..." -ForegroundColor Yellow
az acr create --resource-group $ResourceGroup --name $AcrName --sku Basic --admin-enabled true --output none
$ACR_SERVER = az acr show --name $AcrName --query loginServer --output tsv

# 3. Build & Push Backend Image
Write-Host "`n[3/7] Building & Pushing Backend Image to ACR..." -ForegroundColor Yellow
az acr build --registry $AcrName --image pitchpulse-backend:latest ./backend --output none

# 4. Create ACA Managed Environment
$ACA_ENV = "aca-env-pitchpulse"
Write-Host "`n[4/7] Creating ACA Managed Environment: $ACA_ENV..." -ForegroundColor Yellow
az containerapp env create `
    --name $ACA_ENV `
    --resource-group $ResourceGroup `
    --location $Location `
    --output none

# 5. Deploy Backend Container App
$BACKEND_APP = "pitchpulse-backend"
Write-Host "`n[5/7] Deploying Backend Container App..." -ForegroundColor Yellow

$envVars = @(
    "DEPLOYMENT_REGION=$Location",
    "PORT=8000",
    "AZURE_OPENAI_DEPLOYMENT=$AzureOpenAiDeployment"
)
if ($AzureOpenAiKey -ne "" -and $AzureOpenAiEndpoint -ne "") {
    $envVars += "AZURE_OPENAI_API_KEY=$AzureOpenAiKey"
    $envVars += "AZURE_OPENAI_ENDPOINT=$AzureOpenAiEndpoint"
}

az containerapp create `
    --name $BACKEND_APP `
    --resource-group $ResourceGroup `
    --environment $ACA_ENV `
    --image "$ACR_SERVER/pitchpulse-backend:latest" `
    --target-port 8000 `
    --ingress external `
    --registry-server $ACR_SERVER `
    --env-vars $envVars `
    --cpu 0.5 --memory 1.0Gi `
    --output none

$BACKEND_FQDN = az containerapp show --name $BACKEND_APP --resource-group $ResourceGroup --query properties.configuration.ingress.fqdn --output tsv
$BACKEND_URL = "https://$BACKEND_FQDN"
Write-Host "Backend live at: $BACKEND_URL" -ForegroundColor Green

# 6. Build & Push Frontend Image with Backend URL
Write-Host "`n[6/7] Building Frontend Standalone Image (pointing to $BACKEND_URL)..." -ForegroundColor Yellow
az acr build `
    --registry $AcrName `
    --image pitchpulse-frontend:latest `
    --build-arg NEXT_PUBLIC_API_URL=$BACKEND_URL `
    --file ./frontend/Dockerfile `
    ./frontend `
    --output none

# 7. Deploy Frontend Container App
$FRONTEND_APP = "pitchpulse-frontend"
Write-Host "`n[7/7] Deploying Frontend Container App..." -ForegroundColor Yellow
az containerapp create `
    --name $FRONTEND_APP `
    --resource-group $ResourceGroup `
    --environment $ACA_ENV `
    --image "$ACR_SERVER/pitchpulse-frontend:latest" `
    --target-port 3000 `
    --ingress external `
    --registry-server $ACR_SERVER `
    --cpu 0.5 --memory 1.0Gi `
    --output none

$FRONTEND_FQDN = az containerapp show --name $FRONTEND_APP --resource-group $ResourceGroup --query properties.configuration.ingress.fqdn --output tsv
$FRONTEND_URL = "https://$FRONTEND_FQDN"

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  PITCHPULSE STUDIO LIVE ON AZURE CONTAINER APPS!        " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Frontend Broadcast Deck: $FRONTEND_URL" -ForegroundColor Cyan
Write-Host "Backend SSE Intelligence: $BACKEND_URL/api/health" -ForegroundColor Cyan
