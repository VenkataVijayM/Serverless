#Title - hfx-foodie-recipe-similarity
#Author - Venkata Vijaya Mandapati
#Description - This file is reponsible to fetch recipe details based on recipe id from front end and send those details to Cloud function
#References - 
# 1 - https://docs.python.org/3.7/library/ast.html
# 2 - https://urllib3.readthedocs.io/en/stable/

import json
import boto3
import urllib3
import ast

url = urllib3.PoolManager()

#Fetching records from DynamoDb
dynamo_resource = boto3.resource('dynamodb')
tableData = dynamo_resource.Table('hfx_foodie_recipes') 
print(tableData.scan())

def lambda_handler(event, context):
	
	#storing recipie_id recieved from front end
    recipie_id = event.get("queryStringParameters", {}).get("recipeId", None)
    similarRecipies = []
    target = next((item for item in tableData.scan()['Items'] if item["recipeId"] == recipie_id),None)
    
	#data to be sent to cloud function
    data = {'recipie_name' : target['recipeName'], 'ingredients' : ' '.join(map(str,target['ingredients']))}
    print(data)
    
	#cloud function url that fetches list of similar recipes
    myurl='https://us-central1-csci5410-f22.cloudfunctions.net/similar_recipes'

	#http request that calls cloud function and returns response
    response = url.request('POST',myurl,
                        body=json.dumps(data) ,headers={'Content-Type':'application/json'},retries=False)
    print(response.data)
    
	#Cloud function returns the list of similar recipies in response
    dict = ast.literal_eval(response.data.decode('UTF-8'))['string_field_0']
    print(dict)
    
    for key in dict.keys():
        similarRecipies.append(dict.get(key))
    
    print(similarRecipies)
    return {
        'statusCode': 200,
        'body': similarRecipies
    }
