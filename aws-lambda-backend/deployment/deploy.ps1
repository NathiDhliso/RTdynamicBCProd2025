# RT Dynamic Business Consulting - AWS Lambda Backend Deployment Script
# PowerShell script for Windows deployment

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
    [switch]$SkipInfrastructure,
    
    [Parameter(Mandatory=$false)]
    [switch]$UpdateFunctionsOnly
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
    if (!(Test-Path "functions\contact-handler\index.js") -or !(Test-Path "functions\questionnaire-handler\index.js")) {
        Write-Error "Please run this script from the aws-lambda-backend directory."
        exit 1
    }
    
    Write-Success "All prerequisites met!"
}

# Package Lambda functions
function Build-LambdaFunctions {
    Write-Info "Building Lambda functions..."
    
    $functions = @('contact-handler', 'questionnaire-handler')
    
    foreach ($function in $functions) {
        Write-Info "Building $function..."
        
        $functionPath = "functions\$function"
        Push-Location $functionPath
        
        try {
            # Install dependencies
            Write-Info "Installing dependencies for $function..."
            npm install --production --silent
            
            # Create deployment package
            Write-Info "Creating deployment package for $function..."
            if (Test-Path "$function.zip") {
                Remove-Item "$function.zip" -Force
            }
            
            # Create zip file (using PowerShell Compress-Archive)
            $filesToZip = @(
                'index.js',
                'validation.js',
                'package.json',
                'node_modules'
            )
            
            if ($function -eq 'questionnaire-handler') {
                $filesToZip += 'calculations.js'
            }
            
            # Add shared folder
            if (Test-Path "..\shared") {
                Copy-Item "..\shared" -Destination "shared" -Recurse -Force
                $filesToZip += 'shared'
            }
            
            Compress-Archive -Path $filesToZip -DestinationPath "$function.zip" -Force
            
            # Clean up shared folder copy
            if (Test-Path "shared") {
                Remove-Item "shared" -Recurse -Force
            }
            
            $zipSize = (Get-Item "$function.zip").Length / 1MB
            Write-Success "$function package created: $([math]::Round($zipSize, 2)) MB"
            
        } catch {
            Write-Error "Failed to build $function: $($_.Exception.Message)"
            Pop-Location
            exit 1
        } finally {
            Pop-Location
        }
    }
    
    Write-Success "All Lambda functions built successfully!"
}

# Deploy CloudFormation stack
function Deploy-Infrastructure {
    Write-Info "Deploying infrastructure..."
    
    $stackName = "rtdbc-backend-$Environment"
    $templatePath = "infrastructure\cloudformation.yaml"
    
    if (!(Test-Path $templatePath)) {
        Write-Error "CloudFormation template not found: $templatePath"
        exit 1
    }
    
    $parameters = @(
        "ParameterKey=Environment,ParameterValue=$Environment",
        "ParameterKey=BusinessEmail,ParameterValue=$BusinessEmail",
        "ParameterKey=FromEmail,ParameterValue=$FromEmail",
        "ParameterKey=SendConfirmation,ParameterValue=$SendConfirmation"
    )
    
    try {
        # Check if stack exists
        $stackExists = $false
        try {
            aws cloudformation describe-stacks --stack-name $stackName --region $Region --output json | Out-Null
            $stackExists = $true
            Write-Info "Stack $stackName exists, updating..."
        } catch {
            Write-Info "Stack $stackName does not exist, creating..."
        }
        
        if ($stackExists) {
            # Update stack
            aws cloudformation update-stack `
                --stack-name $stackName `
                --template-body "file://$templatePath" `
                --parameters $parameters `
                --capabilities CAPABILITY_NAMED_IAM `
                --region $Region
            
            Write-Info "Waiting for stack update to complete..."
            aws cloudformation wait stack-update-complete --stack-name $stackName --region $Region
        } else {
            # Create stack
            aws cloudformation create-stack `
                --stack-name $stackName `
                --template-body "file://$templatePath" `
                --parameters $parameters `
                --capabilities CAPABILITY_NAMED_IAM `
                --region $Region
            
            Write-Info "Waiting for stack creation to complete..."
            aws cloudformation wait stack-create-complete --stack-name $stackName --region $Region
        }
        
        Write-Success "Infrastructure deployment completed!"
        
        # Get stack outputs
        $outputs = aws cloudformation describe-stacks --stack-name $stackName --region $Region --query 'Stacks[0].Outputs' --output json | ConvertFrom-Json
        
        Write-Info "Stack Outputs:"
        foreach ($output in $outputs) {
            Write-Host "  $($output.OutputKey): $($output.OutputValue)" -ForegroundColor $Cyan
        }
        
        return $outputs
        
    } catch {
        Write-Error "Infrastructure deployment failed: $($_.Exception.Message)"
        exit 1
    }
}

# Update Lambda function code
function Update-LambdaFunctions {
    param([array]$StackOutputs)
    
    Write-Info "Updating Lambda function code..."
    
    $functions = @(
        @{ Name = 'contact-handler'; OutputKey = 'ContactHandlerFunctionName' },
        @{ Name = 'questionnaire-handler'; OutputKey = 'QuestionnaireHandlerFunctionName' }
    )
    
    foreach ($function in $functions) {
        $functionName = ($StackOutputs | Where-Object { $_.OutputKey -eq $function.OutputKey }).OutputValue
        
        if (!$functionName) {
            Write-Warning "Function name not found in stack outputs for $($function.Name)"
            continue
        }
        
        Write-Info "Updating $functionName..."
        
        $zipPath = "functions\$($function.Name)\$($function.Name).zip"
        
        if (!(Test-Path $zipPath)) {
            Write-Error "Deployment package not found: $zipPath"
            continue
        }
        
        try {
            aws lambda update-function-code `
                --function-name $functionName `
                --zip-file "fileb://$zipPath" `
                --region $Region
            
            Write-Success "Updated $functionName"
            
            # Wait for function to be updated
            Write-Info "Waiting for $functionName to be ready..."
            aws lambda wait function-updated --function-name $functionName --region $Region
            
        } catch {
            Write-Error "Failed to update $functionName: $($_.Exception.Message)"
        }
    }
    
    Write-Success "Lambda functions updated successfully!"
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
            name = "Test User"
            email = "test@example.com"
            subject = "Test Subject"
            message = "This is a test message from the deployment script."
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
            companyName = "Test Company (Pty) Ltd"
            industry = "Information Technology"
            hasEmployees = "Yes"
            employeeCount = "6-20"
            managesStock = "No"
            dealsForeignCurrency = "No"
            taxComplexity = "Moderate"
            auditRequirements = "Not Required"
            regulatoryReporting = "Standard"
            primaryGoal = "Improve Financial Management"
            businessChallenges = "We need better financial reporting and tax compliance support for our growing IT company."
            contactName = "Test Contact"
            email = "test@example.com"
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
function Start-Deployment {
    Write-Info "Starting RT Dynamic Backend Deployment"
    Write-Info "Environment: $Environment"
    Write-Info "Region: $Region"
    Write-Info "Business Email: $BusinessEmail"
    Write-Info ""
    
    # Check prerequisites
    Test-Prerequisites
    
    # Build Lambda functions
    Build-LambdaFunctions
    
    $stackOutputs = $null
    
    # Deploy infrastructure (unless skipped)
    if (!$SkipInfrastructure -and !$UpdateFunctionsOnly) {
        $stackOutputs = Deploy-Infrastructure
    } else {
        Write-Info "Skipping infrastructure deployment"
        
        # Get existing stack outputs
        try {
            $stackName = "rtdbc-backend-$Environment"
            $stackOutputs = aws cloudformation describe-stacks --stack-name $stackName --region $Region --query 'Stacks[0].Outputs' --output json | ConvertFrom-Json
        } catch {
            Write-Warning "Could not retrieve existing stack outputs"
        }
    }
    
    # Update Lambda functions
    if ($stackOutputs) {
        Update-LambdaFunctions -StackOutputs $stackOutputs
        
        # Test deployment
        Test-Deployment -StackOutputs $stackOutputs
    }
    
    Write-Success "Deployment completed successfully!"
    Write-Info ""
    Write-Info "Next steps:"
    Write-Info "1. Update your frontend to use the new API endpoints"
    Write-Info "2. Configure your domain's DNS to point to the API Gateway"
    Write-Info "3. Set up SES email verification for your domain"
    Write-Info "4. Monitor CloudWatch logs for any issues"
}

# Run deployment
try {
    Start-Deployment
} catch {
    Write-Error "Deployment failed: $($_.Exception.Message)"
    exit 1
}