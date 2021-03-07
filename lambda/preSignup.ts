const axios = require('axios');
const gql = require('graphql-tag');
const graphql = require('graphql');
const { print } = graphql;


const createPerson = gql`
  mutation CreatePerson($input: PersonInput) {
    createPerson(input: $input) 
  }
`

exports.handler = async (event:any, context:any, callback:any) => {


    try {

        const graphqlData = await axios({
          url: process.env.API_URL,
          method: 'post',
          headers: {
            'x-api-key': process.env.API_KEY          },
          data: {
            query: print(createPerson),
            variables: {
              input: {
                name: event.request.userAttributes.nickname,
                email:  event.request.userAttributes.nickname,
                username:  event.userName,
                area:  event.request.userAttributes.address
              }
            }
          }
        });
        const body = {
          message: "successfully created todo!"
        }

        event.response.autoConfirmUser = true;

        // Set the email as verified if it is in the request
        if (event.request.userAttributes.hasOwnProperty("email")) {
            event.response.autoVerifyEmail = true;
        }
    
        // Set the phone number as verified if it is in the request
        if (event.request.userAttributes.hasOwnProperty("phone_number")) {
            event.response.autoVerifyPhone = true;
        

        }

        return event


      } catch (err) {

        return null
      } 

};