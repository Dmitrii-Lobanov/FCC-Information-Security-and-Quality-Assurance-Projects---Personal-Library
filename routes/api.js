/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const expect = require('chai').expect;
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) =>{
        if(err) res.json({'message': 'db connection error', 'error': err});
        let query = {};
        db.collection('personallibrary_books').find(query, {_id: 1, title: 1, comments: 1}.toArray((err, doc) =>{
          if(err) res.json({'message': 'Error occured while finding', 'error': err});
          if(doc !== null && doc !== undefined && doc.length > 0) {
            for(let i = 0; i < doc.length; i++){
              doc[i].commentcount = doc[i].comments.length;
              delete doc[i].comments;
            }
            res.json(doc);
          } else {
            res.json({'message': 'No books exists'});
          }
          db.close();
        }));
      });
    })
    
    .post(function (req, res){
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if(!title){
        res.json({'message': 'Title is empty'});
      } else{
        MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) =>{
          if(err) res.json({'message': 'db connection error', 'error': err});
          let query = {title: title, comments: []};
          db.collection('personallibrary_books').insertOne(query, (err, doc) =>{
            if(err) res.json({'message': 'Error occurred while inserting', 'error': err});
            res.json(doc.ops[0]);
            db.close();
          });
        });
      }
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) =>{
        if(err) res.json({'message': 'db connection error', 'error': err});
        let query = {};
        db.collection('personallibrary_books').deleteMany(query, (err, doc) =>{
          if(err) res.json({'message': 'Error occurred while deleting', 'error': err});
          console.log(doc);
          res.json({'message': 'Deleted successfully'});
          db.close();
        });
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) =>{
        if(err) res.json({'message': 'db connection error', 'error': err});
        let query = {'_id': bookid.length === 24 ? ObjectId(bookid) : bookid};
        db.collection('personallibrary_books').findOne(query, (err, doc) =>{
          if(err) res.json({'message': 'Error occurred while finding', 'error': err});
          if(doc !== null & doc !== undefined){
            res.json(doc);
          } else{
            res.json({'message': 'Could not find', 'error': err});
          }
          db.close();
        });
      });
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if(!comment){
        res.json({'message': 'Comment is empty'});
      } else {
        MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) =>{
          if(err) res.json({'message': 'db connection error', 'error': err});
          let query = {'_id': bookid.length === 24 ? ObjectId(bookid) : bookid};
          db.collection('personallibrary_books').findOneAndUpdate(query, {$push: {comments: comment}}, (err, doc) =>{
            if(err) res.json({'message': 'Error occurred while finding', 'error': err});
            if(doc !== null && doc !== undefined){
              doc.value.comments.push(comment);
              console.log(doc.value);
              res.json(doc.value);
            }
            db.close();
          });
        });
    }
  })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) =>{
        if(err) res.json({'message': 'db connection string', 'error': err});
        let query = {'_id': bookid.length === 24 ? ObjectId(bookid) : bookid};
        db.collection('personallibrary_books').deleteOne(query, (err, doc) =>{
          if(err) res.json({'message': 'Error occurred while deleting', 'error': err});
          res.json({'message': 'Deleted successfully', '_id': bookid});
          db.close();
        });
      });
    });
  
};
