#!/bin/bash

# DEFIMON Equity Token - Comprehensive Test Suite
# This script runs all tests and generates comprehensive reports

set -e

echo "🚀 Starting DEFIMON Equity Token Test Suite..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the frontend directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
fi

# Create test results directory
mkdir -p test-results
mkdir -p test-results/coverage
mkdir -p test-results/reports

# Timestamp for reports
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

print_status "Test run started at: $(date)"

# Function to run tests with timeout
run_tests_with_timeout() {
    local test_type=$1
    local timeout_seconds=300  # 5 minutes timeout
    
    print_status "Running $test_type tests..."
    
    timeout $timeout_seconds npm run $test_type > "test-results/reports/${test_type}_${TIMESTAMP}.log" 2>&1
    
    if [ $? -eq 0 ]; then
        print_success "$test_type tests completed successfully"
        return 0
    elif [ $? -eq 124 ]; then
        print_error "$test_type tests timed out after ${timeout_seconds} seconds"
        return 1
    else
        print_error "$test_type tests failed"
        return 1
    fi
}

# Function to check test results
check_test_results() {
    local test_type=$1
    local log_file="test-results/reports/${test_type}_${TIMESTAMP}.log"
    
    if [ -f "$log_file" ]; then
        # Count test results
        local total_tests=$(grep -c "PASS\|FAIL" "$log_file" 2>/dev/null || echo "0")
        local passed_tests=$(grep -c "PASS" "$log_file" 2>/dev/null || echo "0")
        local failed_tests=$(grep -c "FAIL" "$log_file" 2>/dev/null || echo "0")
        
        echo "  📊 Results: $passed_tests passed, $failed_tests failed (Total: $total_tests)"
        
        if [ "$failed_tests" -gt 0 ]; then
            print_warning "Some $test_type tests failed. Check $log_file for details."
            return 1
        fi
    fi
    
    return 0
}

# Initialize test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Run all test suites
print_status "Starting comprehensive test suite..."

# 1. Unit Tests
if run_tests_with_timeout "test:unit"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
check_test_results "test:unit"

# 2. Integration Tests
if run_tests_with_timeout "test:integration"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
check_test_results "test:integration"

# 3. Security Tests
if run_tests_with_timeout "test:security"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
check_test_results "test:security"

# 4. Performance Tests
if run_tests_with_timeout "test:performance"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
check_test_results "test:performance"

# 5. Accessibility Tests
if run_tests_with_timeout "test:accessibility"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
check_test_results "test:accessibility"

# 6. Coverage Tests
print_status "Running coverage tests..."
if npm run test:coverage > "test-results/reports/coverage_${TIMESTAMP}.log" 2>&1; then
    print_success "Coverage tests completed successfully"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    
    # Copy coverage report
    if [ -d "coverage" ]; then
        cp -r coverage/* "test-results/coverage/"
        print_status "Coverage report saved to test-results/coverage/"
    fi
else
    print_error "Coverage tests failed"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# 7. All Tests Combined
print_status "Running all tests combined..."
if npm run test:all > "test-results/reports/all_tests_${TIMESTAMP}.log" 2>&1; then
    print_success "All tests completed successfully"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    print_error "Some tests failed in combined run"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Generate summary report
SUMMARY_FILE="test-results/reports/summary_${TIMESTAMP}.md"
cat > "$SUMMARY_FILE" << EOF
# DEFIMON Equity Token Test Suite Summary

**Test Run:** $(date)
**Timestamp:** $TIMESTAMP

## Test Results

| Test Suite | Status | Details |
|------------|--------|---------|
| Unit Tests | $(if [ $PASSED_TESTS -gt 0 ]; then echo "✅ PASS"; else echo "❌ FAIL"; fi) | Basic component functionality |
| Integration Tests | $(if [ $PASSED_TESTS -gt 1 ]; then echo "✅ PASS"; else echo "❌ FAIL"; fi) | Component interaction |
| Security Tests | $(if [ $PASSED_TESTS -gt 2 ]; then echo "✅ PASS"; else echo "❌ FAIL"; fi) | Security vulnerabilities |
| Performance Tests | $(if [ $PASSED_TESTS -gt 3 ]; then echo "✅ PASS"; else echo "❌ FAIL"; fi) | Performance benchmarks |
| Accessibility Tests | $(if [ $PASSED_TESTS -gt 4 ]; then echo "✅ PASS"; else echo "❌ FAIL"; fi) | WCAG compliance |
| Coverage Tests | $(if [ $PASSED_TESTS -gt 5 ]; then echo "✅ PASS"; else echo "❌ FAIL"; fi) | Code coverage |
| All Tests Combined | $(if [ $PASSED_TESTS -gt 6 ]; then echo "✅ PASS"; else echo "❌ FAIL"; fi) | Complete test suite |

## Statistics

- **Total Test Suites:** $TOTAL_TESTS
- **Passed:** $PASSED_TESTS
- **Failed:** $FAILED_TESTS
- **Success Rate:** $(( (PASSED_TESTS * 100) / TOTAL_TESTS ))%

## Coverage

Coverage reports are available in the \`test-results/coverage/\` directory.

## Log Files

Detailed logs for each test suite are available in the \`test-results/reports/\` directory.

## Next Steps

$(if [ $FAILED_TESTS -eq 0 ]; then
    echo "🎉 All tests passed! The application is ready for deployment."
else
    echo "⚠️  Some tests failed. Please review the logs and fix the issues before deployment."
fi)

---

*Generated automatically by DEFIMON Test Suite*
EOF

print_status "Summary report generated: $SUMMARY_FILE"

# Final results
echo ""
echo "================================================"
echo "🎯 Test Suite Results Summary"
echo "================================================"
echo "📊 Total Test Suites: $TOTAL_TESTS"
echo "✅ Passed: $PASSED_TESTS"
echo "❌ Failed: $FAILED_TESTS"
echo "📈 Success Rate: $(( (PASSED_TESTS * 100) / TOTAL_TESTS ))%"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    print_success "🎉 All tests passed! The application is ready for deployment."
    echo ""
    echo "📁 Test results saved to: test-results/"
    echo "📊 Coverage report: test-results/coverage/"
    echo "📋 Summary report: $SUMMARY_FILE"
    exit 0
else
    print_warning "⚠️  Some tests failed. Please review the logs and fix the issues."
    echo ""
    echo "📁 Failed test logs: test-results/reports/"
    echo "📋 Summary report: $SUMMARY_FILE"
    exit 1
fi
