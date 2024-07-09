import mongodb from 'mongodb'

const ObjectId = mongodb.ObjectId

let reviews

export default class ReviewsDAO{
    static async injectDB(conn){
        if(reviews){
            return
        }
        try{
            reviews = await conn.db(process.env.MOVIEREVIEWS_NS).collection('reviews')
        }
        catch(e){
            console.error(`unable to establish connection handle in reviewDAO:&{e}`)
        }
    }

    static async addReview(movieId,user,review,date){
        try{
            const reviewDoc = {
                name:user.name,
                user_id:user._id,
                date:date,
                review:review,
                movie_id:new ObjectId(movieId)
            }
            return await reviews.insertOne(reviewDoc)
        }catch(e){
            console.error(`unable to post review:${e}`)
            return {error:e}
        }
    }
    
    static async updateReview (reviewId, userId, review, date){
        try{
            const updateResponse = await reviews.updateOne(
                { user_id: userId, _id: new ObjectId(reviewId) },
                { $set: { review: review, date: date } }
            );
    
            if (updateResponse.matchedCount === 0) {
                console.error(`没有文档匹配查询条件。用户ID: ${userId}, 评论ID: ${reviewId}`);
                return { error: "没有文档匹配查询条件" };
            }
    
            if (updateResponse.modifiedCount === 0) {
                console.error(`文档匹配但未被修改。用户ID: ${userId}, 评论ID: ${reviewId}`);
                return { error: "文档匹配但未被修改" };
            }
    
            return updateResponse;
        } catch(e) {
            console.error(`无法更新评论: ${e}`);
            return { error: e };
        }
    }

    

    static async deleteReview(reviewId, userId) {
        try {
            if (!ObjectId.isValid(reviewId)) {
                console.error(`无效的评论ID: ${reviewId}`);
                return { error: "无效的评论ID" };
            }
    
            const deleteResponse = await reviews.deleteOne({
                _id: new ObjectId(reviewId),
                user_id: userId
            });
    
            if (deleteResponse.deletedCount === 0) {
                console.error(`没有文档被删除。用户ID: ${userId}, 评论ID: ${reviewId}`);
                return { error: "没有文档被删除" };
            }
    
            return deleteResponse;
        } catch (e) {
            console.error(`无法删除评论: ${e}`);
            return { error: e };
        }
    }


}