# RT Dynamic Business Consulting - SAM Deployment Script
# PowerShell script for deploying with AWS SAM

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('development', 'staging', 'production')]
    [string]$Environment = 'production',
    
    [Parameter(Mandatory=$false)]
    [string]$Region = 'us-east-1',
    
    [Parameter(Mandatory=$false)]
    [string]$BusinessEmail = 'contact@rtdynamicbc.co.za',
    
    [Parameter(Mandatory=$false)]
    [string]$FromEmail = 'noreply@rtdynamicbc.co.za',
    
    [Parameter(Mandatory=$false)]
    [string]$SendConfirmation = 'true',
    
    [Parameter(Mandatory=$false)]
    [switch]$LocalTest,
    
    [Parameter(Mandatory=$false)]
    [switch]$BuildOnly,
    
    [Parameter(Mandatory=$false)]
    [switch]$ValidateOnly
)

# Set error action preference
$ErrorActionPreference = 'Stop'

# Colors for output
$Green = 'Green'
$Yellow = 'Yellow'
$Red = 'Red'
$Cyan = 'Cyan'

function Write-Status {
    param([string]$Message, [string]$Color = 'White')
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Status "✅ $Message" $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Status "⚠️ $Message" $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Status "❌ $Message" $Red
}

function Write-Info {
    param([string]$Message)
    Write-Status "ℹ️ $Message" $Cyan
}

# Check prerequisites
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check AWS CLI
    try {
        $awsVersion = aws --version 2>$null
        Write-Success "AWS CLI found: $($awsVersion.Split(' ')[0])"
    } catch {
        Write-Error "AWS CLI not found. Please install AWS CLI v2."
        exit 1
    }
    
    # Check SAM CLI
    try {
        $samVersion = sam --version 2>$null
        Write-Success "SAM CLI found: $samVersion"
    } catch {
        Write-Error "SAM CLI not found. Please install SAM CLI: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
        exit 1
    }
    
    # Check AWS credentials
    try {
        $identity = aws sts get-caller-identity --output json | ConvertFrom-Json
        Write-Success "AWS credentials configured for account: $($identity.Account)"
    } catch {
        Write-Error "AWS credentials not configured. Run 'aws configure' first."
        exit 1
    }
    
    # Check Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ([version]($nodeVersion.Substring(1)) -lt [version]"20.0.0") {
            Write-Error "Node.js version 20.0.0 or higher required. Found: $nodeVersion"
            exit 1
        }
        Write-Success "Node.js found: $nodeVersion"
    } catch {
        Write-Error "Node.js not found. Please install Node.js 20.0.0 or higher."
        exit 1
    }
    
    # Check if we're in the right directory
    if (!(Test-Path "template.yaml")) {
        Write-Error "Please run this script from the aws-lambda-backend directory containing template.yaml."
        exit 1
    }
    
    Write-Success "All prerequisites met!"
}

# Validate SAM template
function Test-SamTemplate {
    Write-Info "Validating SAM template..."
    
    try {
        sam validate --template template.yaml --region $Region
        Write-Success "SAM template validation passed!"
    } catch {
        Write-Error "SAM template validation failed: $($_.Exception.Message)"
        exit 1
    }
}

# Build SAM application
function Build-SamApplication {
    Write-Info "Building SAM application..."
    
    try {
        # Install dependencies for each function
        Write-Info "Installing dependencies for contact-handler..."
        Push-Location "functions/contact-handler"
        npm install --production --silent
        Pop-Location
        
        Write-Info "Installing dependencies for questionnaire-handler..."
        Push-Location "functions/questionnaire-handler"
        npm install --production --silent
        Pop-Location
        
        # Build with SAM
        sam build --template template.yaml --region $Region
        Write-Success "SAM application built successfully!"
        
    } catch {
        Write-Error "SAM build failed: $($_.Exception.Message)"
        exit 1
    }
}

# Deploy SAM application
function Deploy-SamApplication {
    Write-Info "Deploying SAM application to $Environment environment..."
    
    try {
        $configEnv = if ($Environment -eq 'production') { 'default' } else { $Environment }
        
        sam deploy `
            --config-env $configEnv `
            --region $Region `
            --parameter-overrides `
                "Environment=$Environment" `
                "BusinessEmail=$BusinessEmail" `
                "FromEmail=$FromEmail" `
                "SendConfirmation=$SendConfirmation"
        
        Write-Success "SAM application deployed successfully!"
        
        # Get stack outputs
        $stackName = if ($Environment -eq 'production') { 'rtdbc-backend' } else { "rtdbc-backend-$Environment" }
        $outputs = aws cloudformation describe-stacks --stack-name $stackName --region $Region --query 'Stacks[0].Outputs' --output json | ConvertFrom-Json
        
        Write-Info "Stack Outputs:"
        foreach ($output in $outputs) {
            Write-Host "  $($output.OutputKey): $($output.OutputValue)" -ForegroundColor $Cyan
        }
        
        return $outputs
        
    } catch {
        Write-Error "SAM deployment failed: $($_.Exception.Message)"
        exit 1
    }
}

# Test local API
function Start-LocalApi {
    Write-Info "Starting local API for testing..."
    Write-Info "API will be available at http://localhost:3000"
    Write-Info "Press Ctrl+C to stop the local API"
    
    try {
        sam local start-api --template template.yaml --region $Region --env-vars env.json
    } catch {
        Write-Error "Failed to start local API: $($_.Exception.Message)"
        exit 1
    }
}

# Create environment variables file for local testing
function New-LocalEnvFile {
    Write-Info "Creating environment variables file for local testing..."
    
    $envVars = @{
        "ContactHandlerFunction" = @{
            "SES_REGION" = $Region
            "BUSINESS_EMAIL" = $BusinessEmail
            "FROM_EMAIL" = $FromEmail
            "SEND_CONFIRMATION" = $SendConfirmation
            "NODE_ENV" = "development"
        }
        "QuestionnaireHandlerFunction" = @{
            "SES_REGION" = $Region
            "BUSINESS_EMAIL" = $BusinessEmail
            "FROM_EMAIL" = $FromEmail
            "SEND_CONFIRMATION" = $SendConfirmation
            "NODE_ENV" = "development"
        }
    }
    
    $envVars | ConvertTo-Json -Depth 3 | Out-File -FilePath "env.json" -Encoding UTF8
    Write-Success "Environment variables file created: env.json"
}

# Test deployment
function Test-Deployment {
    param([array]$StackOutputs)
    
    Write-Info "Testing deployment..."
    
    $apiUrl = ($StackOutputs | Where-Object { $_.OutputKey -eq 'ApiGatewayUrl' }).OutputValue
    
    if (!$apiUrl) {
        Write-Warning "API Gateway URL not found in stack outputs"
        return
    }
    
    Write-Info "API Gateway URL: $apiUrl"
    
    # Test contact endpoint
    try {
        $contactUrl = "$apiUrl/api/contact"
        Write-Info "Testing contact endpoint: $contactUrl"
        
        $testData = @{
            name = "SAM Test User"
            email = "samtest@example.com"
            subject = "SAM Deployment Test"
            message = "This is a test message from the SAM deployment script."
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri $contactUrl -Method POST -Body $testData -ContentType "application/json" -TimeoutSec 30
        
        if ($response.success) {
            Write-Success "Contact endpoint test passed"
        } else {
            Write-Warning "Contact endpoint test failed: $($response.message)"
        }
        
    } catch {
        Write-Warning "Contact endpoint test failed: $($_.Exception.Message)"
    }
    
    # Test questionnaire endpoint
    try {
        $questionnaireUrl = "$apiUrl/api/questionnaire"
        Write-Info "Testing questionnaire endpoint: $questionnaireUrl"
        
        $testData = @{
            entityType = "Private Company (Pty Ltd)"
            annualRevenue = "R1,000,001 - R5,000,000"
            companyName = "SAM Test Company (Pty) Ltd"
            industry = "Information Technology"
            hasEmployees = "Yes"
            employeeCount = "6-20"
            managesStock = "No"
            dealsForeignCurrency = "No"
            taxComplexity = "Moderate"
            auditRequirements = "Not Required"
            regulatoryReporting = "Standard"
            primaryGoal = "Improve Financial Management"
            businessChallenges = "We need better financial reporting and tax compliance support for our growing IT company deployed with SAM."
            contactName = "SAM Test Contact"
            email = "samtest@example.com"
            phoneNumber = "+27123456789"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri $questionnaireUrl -Method POST -Body $testData -ContentType "application/json" -TimeoutSec 45
        
        if ($response.success) {
            Write-Success "Questionnaire endpoint test passed"
            if ($response.data.quote) {
                Write-Info "Quote calculation: R$($response.data.quote)"
            }
        } else {
            Write-Warning "Questionnaire endpoint test failed: $($response.message)"
        }
        
    } catch {
        Write-Warning "Questionnaire endpoint test failed: $($_.Exception.Message)"
    }
}

# Main deployment process
function Start-SamDeployment {
    Write-Info "Starting RT Dynamic Backend SAM Deployment"
    Write-Info "Environment: $Environment"
    Write-Info "Region: $Region"
    Write-Info "Business Email: $BusinessEmail"
    Write-Info ""
    
    # Check prerequisites
    Test-Prerequisites
    
    # Validate template
    Test-SamTemplate
    
    if ($ValidateOnly) {
        Write-Success "Template validation completed successfully!"
        return
    }
    
    # Build application
    Build-SamApplication
    
    if ($BuildOnly) {
        Write-Success "Build completed successfully!"
        return
    }
    
    if ($LocalTest) {
        # Create environment file and start local API
        New-LocalEnvFile
        Start-LocalApi
        return
    }
    
    # Deploy application
    $stackOutputs = Deploy-SamApplication
    
    # Test deployment
    if ($stackOutputs) {
        Test-Deployment -StackOutputs $stackOutputs
    }
    
    Write-Success "SAM deployment completed successfully!"
    Write-Info ""
    Write-Info "Next steps:"
    Write-Info "1. Update your frontend to use the new API endpoints"
    Write-Info "2. Configure your domain's DNS to point to the API Gateway"
    Write-Info "3. Set up SES email verification for your domain"
    Write-Info "4. Monitor CloudWatch logs for any issues"
    Write-Info ""
    Write-Info "Useful SAM commands:"
    Write-Info "  sam logs --stack-name rtdbc-backend-$Environment --tail"
    Write-Info "  sam local start-api (for local testing)"
    Write-Info "  sam delete --stack-name rtdbc-backend-$Environment (to delete stack)"
}

# Run deployment
try {
    Start-SamDeployment
} catch {
    Write-Error "SAM deployment failed: $($_.Exception.Message)"
    exit 1
}