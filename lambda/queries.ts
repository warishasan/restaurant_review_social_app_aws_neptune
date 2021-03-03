import { select } from 'async';
import {driver, process as gprocess, structure} from 'gremlin';
import * as gremlin from 'gremlin'
import { timeStamp } from 'console';
import { Values } from '@aws-cdk/aws-appsync';
export async function createPersonQuery(g:gprocess.GraphTraversalSource<gprocess.GraphTraversal>, name:string, email:string, username:string, area:string) {
    return g.addV('person').property('name',name).property('email', email).property('username',username).property("area",area).iterate();
 
}



export async function createRestaurantQuery(g:gprocess.GraphTraversalSource<gprocess.GraphTraversal>, name:string, area:string) {
    return g.addV('restaurant').property('name',name).property('area', area).iterate();
}



export async function createReviewQuery(g:gprocess.GraphTraversalSource<gprocess.GraphTraversal>, text:string, restaurantName:string, username:string,rating:number) {

    //const reviewRandomId = Math.floor(Math.random() * 100000000);

    var date = new Date();
    var date_milliSeconds = date.getTime();

    // const review_vertex = await g.addV('review').property('text',text).property('timeStamp',date_milliSeconds).property('rating',rating).next()
    // const restaurant_vertex = await g.V().hasLabel('restaurant').has('name',restaurantName).next()

    // console.log(review_vertex.value.Vertex.id)
    // console.log(restaurant_vertex)
    //console.log(restaurant_vertex)
    
   // const person_vetex = g.V().hasLabel('person').has('username',username).next();

    await g.addE('for').from_(g.addV('review').property('text',text).property('timeStamp',date_milliSeconds).property('rating',rating)).to(g.V().hasLabel('restaurant').has('name',restaurantName)).iterate();
    return g.addE('writtenBy').from_(g.V().hasLabel('person').has('username',username)).to(g.V().hasLabel('review').has('timeStamp',date_milliSeconds).has('text',text)).iterate();

    //await g.addV('review').property('text',text).property('id',reviewRandomId.toString()).property('timeStamp',dateString).addE("for").to(g.V("restaurant").has('name',restaurantName)).next()
  //  return g.addE('writtenBy').from_(g.V('person').has('username',username)).to(g.V('review').hasId(reviewRandomId.toString())).next()

}


//  review_vertex =  g.addV('review').property('text',"abcd").property('timeStamp',1213213).property('rating',1).next()
//  restaurant_vertex =  g.V().hasLabel('restaurant').has('name',"kfc").next();
//  person_vetex =  g.V().hasLabel('person').has('username',"war").next();

//  g.addE('for').from(g.V(review_vertex)).to(g.V(restaurant_vertex)).next();
//  g.addE('writtenBy').from(g.V(person_vetex)).to(g.V(review_vertex)).next();





export async function ReviewRatingQuery(g:gprocess.GraphTraversalSource<gprocess.GraphTraversal>, username:string, reviewId:string, like_dislike: "like" | "dislike") {

    
    var date = new Date();
    var date_milliSeconds = date.getTime();

    return g.addE(like_dislike).from_(g.V().hasLabel('person').has('username',username)).to(g.V().hasLabel('review').hasId(reviewId)).property('timeStamp',date_milliSeconds).iterate()
}



export async function addCuisineQuery(g:gprocess.GraphTraversalSource<gprocess.GraphTraversal>, cuisineName:string) {

    return g.addV('cuisine').property('name',cuisineName).next();
}



export async function AddCuisineInRestaurantQuery(g:gprocess.GraphTraversalSource<gprocess.GraphTraversal>, cuisineName:string, restaurantName:string) {

    return g.addE('serves').from_(g.V().hasLabel('restaurant').has('name',restaurantName)).to(g.V().hasLabel('cuisine').has('name',cuisineName)).iterate()
}


export async function addFriendQuery(g:gprocess.GraphTraversalSource<gprocess.GraphTraversal>, username:string, friendUsername:string) {

    // const user_vertex = await g.V().hasLabel('person').has('username',username).next();
    // const friend_vertex = await g.V().hasLabel('person').has('username',friendUsername).next();

    await  g.addE('friendsWith').from_(g.V().hasLabel('person').has('username',username)).to(g.V().hasLabel('person').has('username',friendUsername)).iterate();
    return  g.addE('friendsWith').from_(g.V().hasLabel('person').has('username',friendUsername)).to(g.V().hasLabel('person').has('username',username)).iterate();
}



export async function findFriendsQuery(g:gprocess.GraphTraversalSource<gprocess.GraphTraversal>, username:string) {

   // const user_vertex = await g.V().hasLabel('person').has('username',username).next();

    //return  g.V().hasLabel('person').has('username', "war").bothE('friendsWith').otherV().simplePath().valueMap().toList();

    return g.V().hasLabel('person').has('username',username).out('friendsWith').valueMap().toList();
}

export async function findFriendsOfFriendsQuery(g:gprocess.GraphTraversalSource<gprocess.GraphTraversal>, username:string) {

  //  const user_vertex = await g.V().hasLabel('person').has('username',username).next();

   // return await g.V().hasLabel('person').has('username',username).bothE('friendsWith').otherV().bothE('friendsWith').otherV().simplePath().values().toList();
  // g.V().hasLabel('person').has('username',"war").as('b').out('friendsWith').as('a').where(neq('b')).out("friendsWith").where(neq('b')).as('c').select('a','c').by(.fold()).fold();
   return g.V().hasLabel('person').has('username',username).as('user').out('friendsWith').as('friends').where(gremlin.process.P.neq('user')).out("friendsWith").where(gremlin.process.P.neq('user')).as('friends_friends').select('friends','friends_friends').by('name').toList();
   //return g.V().hasLabel('person').has('username',"war").out('friendsWith').where().out("friendsWith").where(not(out('friendsWith').has('username','war'))).valueMap().toList();
}

export async function topRatedSpecificCuisineRestaurantsNearmeQuery(g:gprocess.GraphTraversalSource<gprocess.GraphTraversal>, area:string, cuisineName:string ) {

  //  const cuisine_vertex = await g.V().hasLabel('cuisine').has('name',cuisineName).next();

   // return g.V().hasLabel('cuisine').has('name',cuisineName).in_('serves').has("area",area).in_('for').path().by('name').by('name').by('rating').toList();

   const result:any = await g.V().hasLabel('cuisine').has('name',cuisineName).as('cuisine').in_('serves').has("area",area).as('restaurant').in_('for').as('review').select('cuisine','restaurant','review').by('name').by('name').by('rating').toList()
   // return await g.V(cuisine_vertex).in_('serves').as('res').in_('for').path().by('name').by('name').by('rating').group().by(select("res")).unfold().select("values").fold().next();

    //right one
//g.V(cuisine_vertex).in('serves').as('res').in('for').path().by('name').by('name').by('rating').group().by(select('res')).unfold().select(values).fold()



const restaurants  = result.map((item:any) => item.restaurant)
.filter((value:any, index:any, self:any) => self.indexOf(value) === index)


let resultArray = []
console.log(restaurants)

let iterator;

for (let i =0; i<restaurants.length; i++){

  iterator = 0;

  resultArray.push({restaurant: restaurants[i], rating:0})
  for (let j=0; j<result.length; j++){

      if (restaurants[i] === result[j].restaurant ){
          iterator = iterator +1;

          resultArray[i].rating = resultArray[i].rating + result[j].review 
      }
  }

  resultArray[i].rating = resultArray[i].rating/iterator;
}



return resultArray.sort(function(a, b){return b.rating- a.rating});




// g.V(cuisine_vertex).in('serves').as('rest').in('for').as('a').inE('rates').path().by('name').by('name').by('text').by('rating').group().by(select('a')).unfold().select(values).fold()
}


export async function topRestaurantsNearMe(g:gprocess.GraphTraversalSource<gprocess.GraphTraversal>, area:string ) {


    const result:any = await g.V().hasLabel('restaurant').has("area",area).as('restaurant').in_('for').as('review').select('restaurant','review').by('name').by('rating').toList()


    


const restaurants  = result.map((item:any) => item.restaurant)
.filter((value:any, index:any, self:any) => self.indexOf(value) === index)


let resultArray = []
console.log(restaurants)

let iterator;

for (let i =0; i<restaurants.length; i++){

  iterator = 0;

  resultArray.push({restaurant: restaurants[i], rating:0})
  for (let j=0; j<result.length; j++){

      if (restaurants[i] === result[j].restaurant ){
          iterator = iterator +1;

          resultArray[i].rating = resultArray[i].rating + result[j].review 
      }
  }

  resultArray[i].rating = resultArray[i].rating/iterator;
}



return resultArray.sort(function(a, b){return b.rating- a.rating});


   // return await g.V().hasLabel('restaurant').has("area",area).in_('for').path().by('name').by('name').by('rating').fold().next();

   // return await g.V(cuisine_vertex).in_('serves').as('res').in_('for').path().by('name').by('name').by('rating').group().by(select("res")).unfold().select("values").fold().next();

    //right one
//g.V(cuisine_vertex).in('serves').as('res').in('for').path().by('name').by('name').by('rating').group().by(select('res')).unfold().select(values).fold()




// g.V(cuisine_vertex).in('serves').as('rest').in('for').as('a').inE('rates').path().by('name').by('name').by('text').by('rating').group().by(select('a')).unfold().select(values).fold()
}



export async function restaurantLatestReviewsQuery(g:gprocess.GraphTraversalSource<gprocess.GraphTraversal>, name:string ) {
return g.V().hasLabel('restaurant').has("name",name).in_('for').order().by('timeStamp',gremlin.process.order.desc).as('review').in_('writtenBy').as('user').select('review','user').by(gremlin.process.statics.values().fold()).by('name').toList();

}


export async function restaurantsFriendsRecommend(g:gprocess.GraphTraversalSource<gprocess.GraphTraversal>, username:string ) {
    return g.V().hasLabel('person').has('username',username).out('friendsWith').out("writtenBy").where(gremlin.process.statics.values('rating').is(gremlin.process.P.gt(3))).out('for').dedup().valueMap().toList();
    
    }

 export async function restaurantsFriendsRecommendReviewRating(g:gprocess.GraphTraversalSource<gprocess.GraphTraversal>, username:string ) {
        return g.V().hasLabel('person').has('username',username).out('friendsWith').out("like").where(gremlin.process.statics.values('rating').is(gremlin.process.P.gt(3))).out('for').dedup().valueMap().toList();
        
        }


 export async function restaurantsFriendsReviewedinPastDays(g:gprocess.GraphTraversalSource<gprocess.GraphTraversal>,  username:string, pastDays:number) {


    const date= new Date(Date.now() - pastDays * 24 * 60 * 60 * 1000);
   const date_milli =date.getTime();


         return g.V().hasLabel('person').has('username',username).out('friendsWith').union(gremlin.process.statics.outE('like').where(gremlin.process.statics.values('timeStamp').is(gremlin.process.P.gt(date_milli))).inV(),gremlin.process.statics.outE('dislike').where(gremlin.process.statics.values('timeStamp').is(gremlin.process.P.gt(date_milli))).inV(),gremlin.process.statics.out('writtenBy').where(gremlin.process.statics.values('timeStamp').is(gremlin.process.P.gt(date_milli)))).out('for').dedup().valueMap().toList()
            
         }

//const gg = g.V().hasLabel('restaurant').has("name",name).in('for').order().by('timeStamp',gremlin.process.order.desc).valueMap().toList()



// rating of a particular review

 //g.V(cuisine_vertex).in('serves').hasId(IDOFREVIEW).in('for').union(path().by('name').by('name').by('text').by('rating'),inE('rates').values('rating').mean())






