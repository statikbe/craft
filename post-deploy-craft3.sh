#!/bin/sh
#
# This script should be invoked from the root folder of your installation
#
# Usage: post-deploy.sh
# -env=<environment>   define the environment you are deploying
#
# For example a post deploy for the stag environment
# ./post-deploy.sh -env=stag
#
# When exists, application/htaccess-stag will be copied to public/.htaccess
# The same for application/robots-stag which will be copied to public/robots.txt
#
# Initialize parameters
ENVIRONMENT="local"
PHP="php"

# Gather parameters from arguments
for i in "$@"
do
    case $i in
        --env=*|--environment=*)
            ENVIRONMENT="${i#*=}"
            shift
        ;;
        *)
            # unknown option
        ;;
    esac
done

#
# Executes a command
# $1 Command to execute
# $2 Information message before the command
#
executeCommand() {
    echo $2
    $1
    if [ $? -ne 0 ]; then
        exit $?
    fi
}

executeCommand "composer install --no-dev" "Installing composer requirements..."
executeCommand "chmod +x ./craft"
executeCommand "./craft migrate/all"
executeCommand "./craft project-config/apply"

FILE="config/htaccess-$ENVIRONMENT"
if [ -f $FILE ]; then
    executeCommand "cp $FILE public/.htaccess" "Copying .htaccess file..."
else
    echo "htaccess not found, check your environment setting"
fi

FILE="config/robots-$ENVIRONMENT"
if [ -f $FILE ]; then
    executeCommand "cp $FILE public/robots.txt" "Copying robots.txt file..."
else
    echo "Robots not found, check your environment setting"
fi

executeCommand "yarn install --ignore-optional"
executeCommand "yarn run prod"

echo "Done"