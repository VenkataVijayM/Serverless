// Code reference
// _______________________
// Title: AWS Cognito Password Regex - Specific to AWS Cognito
// Author: Jonathan Irwin
// Publication: Stack Overflow
// Published date: 08-Nov-2019
// Available: https://stackoverflow.com/questions/58767980/aws-cognito-password-regex-specific-to-aws-cognito
// Accessed: 04-Dec-2022
export const COGNITO_PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\^$*.[\]{}()?"!@#%&/\\,><':;|_~`=+\- ])[A-Za-z0-9^$*.[\]{}()?"!@#%&/\\,><':;|_~`=+\- ]{8,256}$/;

export const COGNITO_USER_POOL_ID= "us-east-1_qkoCdUZFC"
export const COGNITO_CLIENT_ID = "456hh57bno8rm041unjf9g9cvs"

export const LOGIN_INFO_FUNCTION_URL = "https://us-central1-hfx-foodie.cloudfunctions.net/hfx-foodie-login-info";
export const SECURITY_ANSWERS_FUNCTION_URL = 'https://us-central1-hfx-foodie.cloudfunctions.net/security-questions';

export const USER_INFO_FUNCTION_URL = 'https://5d2dgzmnnc7hiu4svs63h4pi4i0apyjw.lambda-url.us-east-1.on.aws/';
export const CIPHER_DATA_FUNCTION_URL = 'https://xeibqohkai7j4f4fsatgkosnka0hvcdt.lambda-url.us-east-1.on.aws/';
export const RECIPE_FUNCTION_URL = 'https://2obhqqifjh6vgwt64atxmdpg4q0dzmxr.lambda-url.us-east-1.on.aws/';
export const PRESIGNED_URL_FUNCTION_URL = 'https://dcw7phtjvdcvsaiqofob42he3q0pzrhk.lambda-url.us-east-1.on.aws/';
export const COMPREHEND_FUNCTION_URL = 'https://a26z6c3vymzyqmjblt52tpshn40vojjr.lambda-url.us-east-1.on.aws/';

export const SIMILAR_RECIPES_FUNCTION_URL = "https://e4kvcnk3peoybpodvawolqflkm0aisni.lambda-url.us-east-1.on.aws/";
export const POLARITY_FUNCTION_URL = "https://sjud36cxhjj4jbp3mymaajdafm0zitgp.lambda-url.us-east-1.on.aws/";
