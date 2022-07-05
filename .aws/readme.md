```sh
# deploy
aws cloudformation deploy --capabilities CAPABILITY_IAM --template .aws/template.yaml --stack-name alola

# function url
aws cloudformation describe-stacks --query "Stacks[].Outputs[?OutputKey=='DemoFunctionUrl'].OutputValue" --stack-name alola --output text

# DANGER: destroy
aws cloudformation delete-stack --stack-name alola && aws cloudformation wait stack-delete-complete --stack-name alola
```
