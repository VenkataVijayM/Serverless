#Title - hfx-foodie-feedback-polarity-cf
#Author - Venkata Vijaya Mandapati
#Description - This file responsible for fetching data from lambda and store data in bigquery for visualisation
#References - https://cloud.google.com/bigquery/docs/
from google.cloud import bigquery

def hello_world(request):

	#storing json input recieved from lambda
    request_json = request.get_json()
    print(request_json)
    
    client = bigquery.Client()
    
	#table id that stores data in bigquery
    tableId = 'csci5410-f22.serverless.polarity';
	
	#deleting data in bigquery to insert new data
    statement = ("Delete from "+tableId+ " where 1=1");
    resp = client.query(statement);
    print(resp)
    
	#inserting data into table
    response = client.insert_rows_json(tableId, request_json);
    print(response)
    
    return f'Hello World!'
