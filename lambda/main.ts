//https://docs.aws.amazon.com/neptune/latest/userguide/access-graph-gremlin-node-js.html
//https://docs.aws.amazon.com/neptune/latest/userguide/lambda-functions-examples.html

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import {driver, process as gprocess, structure} from 'gremlin';
import * as async from 'async';
import {createPersonQuery, createRestaurantQuery,createReviewQuery,ReviewRatingQuery,addCuisineQuery,AddCuisineInRestaurantQuery,addFriendQuery,findFriendsQuery,findFriendsOfFriendsQuery,topRatedSpecificCuisineRestaurantsNearmeQuery,topRestaurantsNearMe,restaurantLatestReviewsQuery,restaurantsFriendsRecommend,restaurantsFriendsRecommendReviewRating,restaurantsFriendsReviewedinPastDays} from './queries'    

declare var process : {
    env: {
      NEPTUNE_ENDPOINT: string
    }
  }

let conn: driver.DriverRemoteConnection;
let g: gprocess.GraphTraversalSource;

// async function query() {
//     return g.addV('a').next();
// }




export async function handler(event: any, context: Context) {

console.log(event)


async function doQuery() {

    
    if (event.info.fieldName === "createPerson"){
        try{
    const result = await createPersonQuery(g,event.arguments.input.name,event.arguments.input.email,event.arguments.input.username,event.arguments.input.area)
    return "Person Created"
}
catch(e){
    return "Person Creation Failed"
}

}

    if (event.info.fieldName === 'createRestaurant'){

        try{
        const result = await createRestaurantQuery(g,event.arguments.input.name,event.arguments.input.area)
        return "Restaurant Created"
    }
    catch(e){
        return "Restaurant Creation Failed"
    }
    }


    if (event.info.fieldName === 'createReview'){

        try{
        const result = await createReviewQuery(g,event.arguments.input.text,event.arguments.input.restaurantName,event.arguments.input.username,event.arguments.input.rating)
        return "Review Created"
    }
    catch(e){
        console.log(e)
        return "Review Creation Failed"
    }
    }


    
    if (event.info.fieldName === 'reviewRating'){

        try{
        const result = await ReviewRatingQuery(g,event.arguments.input.username,event.arguments.input.reviewId,event.arguments.input.like_dislike)
        return "Review Rating Recorded"
    }
    catch(e){
        console.log(e)
        return "Review Rating Failed"
    }
    }


        
    if (event.info.fieldName === 'createCuisine'){

        try{
        const result = await addCuisineQuery(g,event.arguments.input.cuisineName)
        return "Cuisine Created"
    }
    catch(e){
        console.log(e)
        return "Cuisine Creation Failed"
    }
    }


    if (event.info.fieldName === 'addCuisineToRestaurant'){

        try{
        const result = await AddCuisineInRestaurantQuery(g,event.arguments.input.cuisineName,event.arguments.input.restaurantName)
        return "Cuisine Created"
    }
    catch(e){
        console.log(e)
        return "Cuisine Creation Failed"
    }
    }


    if (event.info.fieldName === 'addFriend'){

        try{
        const result = await addFriendQuery(g,event.arguments.input.username,event.arguments.input.friendUsername)
        return "friend added"
    }
    catch(e){
        console.log(e)
        return "failed adding friend"
    }
    }


    
    if (event.info.fieldName === 'findFriends'){

        try{
        const result = await findFriendsQuery(g,event.arguments.input.username)
        console.log(result)
        return result
    }
    catch(e){
        console.log(e)
        return "failed adding friend"
    }
    }

    if (event.info.fieldName === 'findFriendsOfFriendsQuery'){

        try{
        const result = await findFriendsOfFriendsQuery(g,event.arguments.input.username)
        console.log(result)
        return result
    }
    catch(e){
        console.log(e)
        return "Failed"
    }
    }


    
    if (event.info.fieldName === 'topRatedSpecificCuisineRestaurantsNearme'){

        try{
        const result = await topRatedSpecificCuisineRestaurantsNearmeQuery(g,event.arguments.input.area,event.arguments.input.cuisineName)
        console.log(result)
        return result
    }
    catch(e){
        console.log(e)
        return "Failed"
    }
    }

      
    if (event.info.fieldName === 'topRestaurantsNearMe'){

        try{
        const result = await topRestaurantsNearMe(g,event.arguments.input.area)
        console.log(result)
        return result
    }
    catch(e){
        console.log(e)
        return "Failed"
    }
    }


    
      
    if (event.info.fieldName === 'restaurantLatestReviews'){

        try{
        const result = await restaurantLatestReviewsQuery(g,event.arguments.input.name)
        console.log(result)
        return result
    }
    catch(e){
        console.log(e)
        return "Failed"
    }
    }


         
    if (event.info.fieldName === 'restaurantsFriendsRecommend'){

        try{
        const result = await restaurantsFriendsRecommend(g,event.arguments.input.username)
        console.log(result)
        return result
    }
    catch(e){
        console.log(e)
        return "Failed"
    }
    }



           
    if (event.info.fieldName === 'restaurantsFriendsRecommendReviewRating'){

        try{
        const result = await restaurantsFriendsRecommendReviewRating(g,event.arguments.input.username)
        console.log(result)
        return result
    }
    catch(e){
        console.log(e)
        return "Failed"
    }
    }


    if (event.info.fieldName === 'restaurantsFriendsReviewedinPastDays'){

        try{
        const result = await restaurantsFriendsReviewedinPastDays(g,event.arguments.input.username,event.arguments.input.pastDays)
        console.log(result)
        return result
    }
    catch(e){
        console.log(e)
        return "Failed"
    }
    }



    

    return "undefined Query"


}


    const getConnectionDetails = () => {
        const database_url = 'wss://' + process.env.NEPTUNE_ENDPOINT + ':8182/gremlin';
        return { url: database_url, headers: {}};
    };

    const createRemoteConnection = () => {
        const { url, headers } = getConnectionDetails();

        return new driver.DriverRemoteConnection(
            url, 
            { 
                mimeType: 'application/vnd.gremlin-v2.0+json', 
                pingEnabled: false,
                headers: headers 
            });       
    };

    const createGraphTraversalSource = (conn: driver.DriverRemoteConnection) => {
        return gprocess.traversal().withRemote(conn);
    };

    if (conn == null){
        conn = createRemoteConnection();
        g = createGraphTraversalSource(conn);
    }




return async.retry(
    { 
        times: 5,
        interval: 1000,
        errorFilter: function (err) { 
            
            // Add filters here to determine whether error can be retried
            console.warn('Determining whether retriable error: ' + err.message);
            
            // Check for connection issues
            if (err.message.startsWith('WebSocket is not open')){
                console.warn('Reopening connection');
                conn.close();
                conn = createRemoteConnection();
                g = createGraphTraversalSource(conn);
                return true;
            }
            
            // Check for ConcurrentModificationException
            if (err.message.includes('ConcurrentModificationException')){
                console.warn('Retrying query because of ConcurrentModificationException');
                return true;
            }
            
            // Check for ReadOnlyViolationException
            if (err.message.includes('ReadOnlyViolationException')){
                console.warn('Retrying query because of ReadOnlyViolationException');
                return true;
            }
            
            return false; 
        }
        
    }, 
    doQuery
    
    
    );

   
    
}


