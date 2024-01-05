#Title - hfx-foodie-feedback-polarity
#Author - Venkata Vijaya Mandapati
#Description - This file is reponsible to fetch feedback for particular restaurant user from dynamo and do sentiment analysis using comprehend and send those details to Cloud function.
#References - 
# 1 - https://urllib3.readthedocs.io/en/stable/


import json
import boto3
import urllib3

url = urllib3.PoolManager()


def lambda_handler(event, context):
    
	#storing restaurantId recieved from front end
    restaurantId = query_params = event.get("queryStringParameters", None).get("userId", None)
    print(restaurantId)

    #fetching table data from dynamodb
    client = boto3.resource('dynamodb')
    tableData = client.Table('hfx_foodie_orders') 
    print(tableData.scan())
    finalList = []
    
    comprehend = boto3.client("comprehend")
    
	#filtering data based in restaurantId and storing only requried details into new list
    for item in tableData.scan()['Items']:
        newitem = {}
        if(item['restaurant'] == restaurantId):
            sentiment = comprehend.detect_sentiment(Text=item['order_feedback'], LanguageCode='en')
            print(sentiment['Sentiment'])
    
            newitem['order_id'] = item['orderId']
            newitem['feedback'] = item['order_feedback']
            newitem['rating'] = item['order_ratings']
            newitem['polarity'] = sentiment['Sentiment']
            finalList.append(newitem)
            
    print(finalList)

	#cloud function url that fetches stores data in bigquery for visualisation
    myurl='https://us-central1-csci5410-f22.cloudfunctions.net/feedbackpolarity'

	#http request that calls cloud function and returns response
    response = url.request('POST',myurl,
                        body=json.dumps(finalList) ,headers={'Content-Type':'application/json'},retries=False)
    print(response)
    
    return {
        'statusCode': 200,
        'body': json.dumps(response)
    }
