export default function makeCommentsDb ({ makeDb }) {
    return Object.freeze({
      findAll,
      findByHash,
      findById,
      findByPostId,
      findReplies,
      insert,
      remove,
      update
    })
    /** use id of a comment to search for the comment within the collection */
    async function findById({id:_id}){
      const db = await makeDb()
      result = await db.colllection('comment').find({_id})
      // Returns an array of each value in this collection
      found = await result.toArray()
      if(found.length === 0 ){
        return null
      }
      // copy the content of the key _id to id from array found and return the object
      const {_id: id, ...info} = found[0]
      return {id, ...info}
    }
    /** use post id to find comment(s) in a post*/
    async function findByPostId ({ postId, omitReplies = true }) {
      const db = await makeDb()
      const query = { postId: postId }
      if (omitReplies) {
        query.replyToId = null
      }
      const result = await db.collection('comments').find(query)
      return(await result.toArray()).map(({_id: id, ...found}) => ({id, ...found}))
    }
    /** use comment's has to find comment*/
    async function findByHash (comment) {
      const db = await makeDb()
      const result = await db.collection('comments').find({ hash: comment.hash })
      const found = await result.toArray()
      if (found.length === 0) {
        return null
      }
      const { _id: id, ...insertedInfo } = found[0]
      return { id, ...insertedInfo }
    }
    /** use commentId to find comment's replies*/
    async function findReplies ({ commentId, publishedOnly = true }) {
      const db = await makeDb()
      // if comment is published, then replyToId: commentId else don't set 'published'
      const query = publishedOnly
        ? { published: true, replyToId: commentId }
        : { replyToId: commentId }
      const result = await db.collection('comments').find(query)
      return (await result.toArray()).map(({ _id: id, ...found }) => ({
        id,
        ...found
      }))
    }
    //TODO: update
    async function insert ({ id: _id = Id.makeId(), ...commentInfo }) {
    const db = await makeDb()
    const result = await db
      .collection('comments')
      .insertOne({ _id, ...commentInfo })
    const { _id: id, ...insertedInfo } = result.ops[0]
    return { id, ...insertedInfo }
  }
    async function remove({id: _id}){
    const db = await makeDB()
    const result = await db.collection('comments').deleteOne({_id})
    return result.deletedCount
    }
       
    async function update ({ id: _id, ...commentInfo }) {
    const db = await makeDb()
    const result = await db
      .collection('comments')
    // Using the aggregation pipeline allows for a more expressive update statement
    // such as expressing conditional updates based on current field values 
    // or updating one field using the value of another field(s).
      .updateOne({ _id }, { $set: { ...commentInfo } })
    return result.modifiedCount > 0 ? { id: _id, ...commentInfo } : null
    }
    
}
