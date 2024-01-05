import json
import gspread
import boto3
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    request_body = json.loads(event["body"]) if type(event["body"]) is str else event["body"]
    write_events_to_google_sheet()

    return { "statusCode": 200 }
    

def write_events_to_google_sheet():
    gc = gspread.service_account(filename='google_service_account_credentials.json')
    gsheet = gc.open("dashboard-analytics")
    
    # # Users currently logged in 
    table = dynamodb.Table('user_master')
    response = table.scan(
        FilterExpression=Attr('isLoggedIn').eq('True')
    )
    items = response['Items']
    print(items)
    for item in items:
        row = [
            item["userId"],
            item["email"]
        ]   
    gsheet.sheet1.insert_row(row, index=2)
        
    # Total No of users 
    table = dynamodb.Table('hfx_foodie_users')
    response = table.scan(
        FilterExpression=Attr('isRestaurant').eq('False')
    )
    items = response['Items']
    print(items)
    for item in items:
        row = [
            item["userId"]
        ]   
    gsheet.get_worksheet(1).insert_row(row, index=1)

    # Total No of Recipes
    table = dynamodb.Table('hfx_foodie_recipes')
    response = table.scan(
        FilterExpression=Attr('isUploaded').eq('true')
    )
    items = response['Items']
    print(items)
    for item in items:
        row = [
            item["recipeId"]
        ]   
    gsheet.get_worksheet(2).insert_row(row, index=1)

    # Total No of Recipes
    table = dynamodb.Table('hfx_foodie_ratings_stats')
    response = table.scan(
        FilterExpression=Attr('rating_5').gt(20)
    )
    items = response['Items']
    print(items)
    for item in items:
        row = [
            item["restaurantName"]
        ]   
    gsheet.get_worksheet(3).insert_row(row, index=1)

    print(" Events logged to the Google Sheet.")
