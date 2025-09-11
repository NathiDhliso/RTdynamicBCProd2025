#!/bin/bash

# RT Dynamic Business Consulting - AWS Lambda Backend Deployment Script
# Bash script for Unix/Linux/macOS deployment

set -e  # Exit on any error

# Default values
ENVIRONMENT="production"
REGION="us-east-1"
BUSINESS_EMAIL="contact@rtdynamicbc.co.za"
FROM_EMAIL="noreply@rtdynamicbc.co.za"
SEND_CONFIRMATION="true"
SKIP_INFRASTRUCTURE=false
UPDATE_FUNCTIONS_ONLY=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${CYAN}[$(date +'%H:%M:%S')] ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] ✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ❌ $1${NC}"
}

# Show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment ENV     Environment (development|staging|production) [default: production]"
    echo "  -r, --region REGION       AWS region [default: us-east-1]"
    echo "  -b, --business-email      Business email address [default: contact@rtdynamicbc.co.za]"
    echo "  -f, --from-email          From email address [default: noreply@rtdynamicbc.co.za]"
    echo "  -c, --send-confirmation   Send confirmation emails (true|false) [default: true]"
    echo "  --skip-infrastructure     Skip infrastructure deployment"
    echo "  --update-functions-only   Only update Lambda functions"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Deploy to production"
    echo "  $0 -e development                    # Deploy to development"
    echo "  $0 --update-functions-only           # Only update Lambda functions"
    echo "  $0 --skip-infrastructure             # Skip infrastructure, only update functions"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -b|--business-email)
            BUSINESS_EMAIL="$2"
            shift 2
            ;;
        -f|--from-email)
            FROM_EMAIL="$2"
            shift 2
            ;;
        -c|--send-confirmation)
            SEND_CONFIRMATION="$2"
            shift 2
            ;;
        --skip-infrastructure)
            SKIP_INFRASTRUCTURE=true
            shift
            ;;
        --update-functions-only)
            UPDATE_FUNCTIONS_ONLY=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    log_error "Invalid environment: $ENVIRONMENT. Must be development, staging, or production."
    exit 1
fi

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI not found. Please install AWS CLI v2."
        exit 1
    fi
    
    local aws_version=$(aws --version 2>&1 | cut -d/ -f2 | cut -d' ' -f1)
    log_success "AWS CLI found: $aws_version"
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured. Run 'aws configure' first."
        exit 1
    fi
    
    local account_id=$(aws sts get-caller-identity --query Account --output text)
    log_success "AWS credentials configured for account: $account_id"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js not found. Please install Node.js 20.0.0 or higher."
        exit 1
    fi
    
    local node_version=$(node --version | sed 's/v//')
    local required_version="20.0.0"
    
    if ! printf '%s\n%s\n' "$required_version" "$node_version" | sort -V -C; then
        log_error "Node.js version 20.0.0 or higher required. Found: v$node_version"
        exit 1
    fi
    
    log_success "Node.js found: v$node_version"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm not found. Please install npm."
        exit 1
    fi
    
    # Check if we're in the right directory
    if [[ ! -f "functions/contact-handler/index.js" ]] || [[ ! -f "functions/questionnaire-handler/index.js" ]]; then
        log_error "Please run this script from the aws-lambda-backend directory."
        exit 1
    fi
    
    # Check zip command
    if ! command -v zip &> /dev/null; then
        log_error "zip command not found. Please install zip utility."
        exit 1
    fi
    
    log_success "All prerequisites met!"
}

# Build Lambda functions
build_lambda_functions() {
    log_info "Building Lambda functions..."
    
    local functions=("contact-handler" "questionnaire-handler")
    
    for function in "${functions[@]}"; do
        log_info "Building $function..."
        
        local function_path="functions/$function"
        
        pushd "$function_path" > /dev/null
        
        # Install dependencies
        log_info "Installing dependencies for $function..."
        npm install --production --silent
        
        # Create deployment package
        log_info "Creating deployment package for $function..."
        
        # Remove existing zip file
        rm -f "$function.zip"
        
        # Copy shared folder
        if [[ -d "../shared" ]]; then
            cp -r "../shared" "shared"
        fi
        
        # Create zip file
        local files_to_zip=("index.js" "validation.js" "package.json" "node_modules")
        
        if [[ "$function" == "questionnaire-handler" ]]; then
            files_to_zip+=("calculations.js")
        fi
        
        if [[ -d "shared" ]]; then
            files_to_zip+=("shared")
        fi
        
        zip -r "$function.zip" "${files_to_zip[@]}" -q
        
        # Clean up shared folder copy
        rm -rf "shared"
        
        local zip_size=$(du -h "$function.zip" | cut -f1)
        log_success "$function package created: $zip_size"
        
        popd > /dev/null
    done
    
    log_success "All Lambda functions built successfully!"
}

# Deploy CloudFormation stack
deploy_infrastructure() {
    log_info "Deploying infrastructure..."
    
    local stack_name="rtdbc-backend-$ENVIRONMENT"
    local template_path="infrastructure/cloudformation.yaml"
    
    if [[ ! -f "$template_path" ]]; then
        log_error "CloudFormation template not found: $template_path"
        exit 1
    fi
    
    local parameters=(
        "ParameterKey=Environment,ParameterValue=$ENVIRONMENT"
        "ParameterKey=BusinessEmail,ParameterValue=$BUSINESS_EMAIL"
        "ParameterKey=FromEmail,ParameterValue=$FROM_EMAIL"
        "ParameterKey=SendConfirmation,ParameterValue=$SEND_CONFIRMATION"
    )
    
    # Check if stack exists
    local stack_exists=false
    if aws cloudformation describe-stacks --stack-name "$stack_name" --region "$REGION" &> /dev/null; then
        stack_exists=true
        log_info "Stack $stack_name exists, updating..."
    else
        log_info "Stack $stack_name does not exist, creating..."
    fi
    
    if [[ "$stack_exists" == true ]]; then
        # Update stack
        aws cloudformation update-stack \
            --stack-name "$stack_name" \
            --template-body "file://$template_path" \
            --parameters "${parameters[@]}" \
            --capabilities CAPABILITY_NAMED_IAM \
            --region "$REGION"
        
        log_info "Waiting for stack update to complete..."
        aws cloudformation wait stack-update-complete --stack-name "$stack_name" --region "$REGION"
    else
        # Create stack
        aws cloudformation create-stack \
            --stack-name "$stack_name" \
            --template-body "file://$template_path" \
            --parameters "${parameters[@]}" \
            --capabilities CAPABILITY_NAMED_IAM \
            --region "$REGION"
        
        log_info "Waiting for stack creation to complete..."
        aws cloudformation wait stack-create-complete --stack-name "$stack_name" --region "$REGION"
    fi
    
    log_success "Infrastructure deployment completed!"
    
    # Get stack outputs
    log_info "Stack Outputs:"
    aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
        --output table
}

# Update Lambda function code
update_lambda_functions() {
    log_info "Updating Lambda function code..."
    
    local stack_name="rtdbc-backend-$ENVIRONMENT"
    
    # Get function names from stack outputs
    local contact_function=$(aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`ContactHandlerFunctionName`].OutputValue' \
        --output text)
    
    local questionnaire_function=$(aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`QuestionnaireHandlerFunctionName`].OutputValue' \
        --output text)
    
    # Update contact handler
    if [[ -n "$contact_function" ]]; then
        log_info "Updating $contact_function..."
        
        aws lambda update-function-code \
            --function-name "$contact_function" \
            --zip-file "fileb://functions/contact-handler/contact-handler.zip" \
            --region "$REGION" > /dev/null
        
        log_info "Waiting for $contact_function to be ready..."
        aws lambda wait function-updated --function-name "$contact_function" --region "$REGION"
        
        log_success "Updated $contact_function"
    else
        log_warning "Contact handler function name not found in stack outputs"
    fi
    
    # Update questionnaire handler
    if [[ -n "$questionnaire_function" ]]; then
        log_info "Updating $questionnaire_function..."
        
        aws lambda update-function-code \
            --function-name "$questionnaire_function" \
            --zip-file "fileb://functions/questionnaire-handler/questionnaire-handler.zip" \
            --region "$REGION" > /dev/null
        
        log_info "Waiting for $questionnaire_function to be ready..."
        aws lambda wait function-updated --function-name "$questionnaire_function" --region "$REGION"
        
        log_success "Updated $questionnaire_function"
    else
        log_warning "Questionnaire handler function name not found in stack outputs"
    fi
    
    log_success "Lambda functions updated successfully!"
}

# Test deployment
test_deployment() {
    log_info "Testing deployment..."
    
    local stack_name="rtdbc-backend-$ENVIRONMENT"
    
    # Get API Gateway URL
    local api_url=$(aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' \
        --output text)
    
    if [[ -z "$api_url" ]]; then
        log_warning "API Gateway URL not found in stack outputs"
        return
    fi
    
    log_info "API Gateway URL: $api_url"
    
    # Test contact endpoint
    log_info "Testing contact endpoint..."
    local contact_response=$(curl -s -X POST "$api_url/api/contact" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test Subject",
            "message": "This is a test message from the deployment script."
        }' || echo '{"success": false, "error": "Request failed"}')
    
    if echo "$contact_response" | grep -q '"success".*true'; then
        log_success "Contact endpoint test passed"
    else
        log_warning "Contact endpoint test failed: $contact_response"
    fi
    
    # Test questionnaire endpoint
    log_info "Testing questionnaire endpoint..."
    local questionnaire_response=$(curl -s -X POST "$api_url/api/questionnaire" \
        -H "Content-Type: application/json" \
        -d '{
            "entityType": "Private Company (Pty Ltd)",
            "annualRevenue": "R1,000,001 - R5,000,000",
            "companyName": "Test Company (Pty) Ltd",
            "industry": "Information Technology",
            "hasEmployees": "Yes",
            "employeeCount": "6-20",
            "managesStock": "No",
            "dealsForeignCurrency": "No",
            "taxComplexity": "Moderate",
            "auditRequirements": "Not Required",
            "regulatoryReporting": "Standard",
            "primaryGoal": "Improve Financial Management",
            "businessChallenges": "We need better financial reporting and tax compliance support for our growing IT company.",
            "contactName": "Test Contact",
            "email": "test@example.com",
            "phoneNumber": "+27123456789"
        }' || echo '{"success": false, "error": "Request failed"}')
    
    if echo "$questionnaire_response" | grep -q '"success".*true'; then
        log_success "Questionnaire endpoint test passed"
        
        # Extract quote if available
        local quote=$(echo "$questionnaire_response" | grep -o '"quote":[0-9]*' | cut -d: -f2)
        if [[ -n "$quote" ]]; then
            log_info "Quote calculation: R$quote"
        fi
    else
        log_warning "Questionnaire endpoint test failed: $questionnaire_response"
    fi
}

# Main deployment process
main() {
    log_info "Starting RT Dynamic Backend Deployment"
    log_info "Environment: $ENVIRONMENT"
    log_info "Region: $REGION"
    log_info "Business Email: $BUSINESS_EMAIL"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Build Lambda functions
    build_lambda_functions
    
    # Deploy infrastructure (unless skipped)
    if [[ "$SKIP_INFRASTRUCTURE" != true ]] && [[ "$UPDATE_FUNCTIONS_ONLY" != true ]]; then
        deploy_infrastructure
    else
        log_info "Skipping infrastructure deployment"
    fi
    
    # Update Lambda functions
    update_lambda_functions
    
    # Test deployment
    test_deployment
    
    log_success "Deployment completed successfully!"
    echo ""
    log_info "Next steps:"
    log_info "1. Update your frontend to use the new API endpoints"
    log_info "2. Configure your domain's DNS to point to the API Gateway"
    log_info "3. Set up SES email verification for your domain"
    log_info "4. Monitor CloudWatch logs for any issues"
}

# Run main function
main "$@"