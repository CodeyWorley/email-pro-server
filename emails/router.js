const express = require('express');
const router = express.Router();

const passport = require('passport');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {Email} = require('../models/email');

const jwtAuth = passport.authenticate('jwt', { session: false });

// Read all
router.get('/', jwtAuth, (req, res) => {
    const userId = req.user.id;

    return Email.find({userId})
        .then(results => {
            return res.status(200).json(results);
        })
        .catch(err => {
            res.status(500).json(err);
        }); 
});

// Read one
router.get('/:id', jwtAuth, (req,res) => {
    const {id} = req.params;
    const userId = req.user.id;
    
    return Email.findOne({_id: id, userId})
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            res.status(500).json(err);
        })
});

// Update
router.put('/:id', jsonParser, jwtAuth, (req, res) => {
    const {id} = req.params;
    const userId = req.user.id;
    const toUpdate = {};
    const updateableFields = ['title', 'content', 'recipients'];

    updateableFields.forEach(field => {
        if (field in req.body) {
        toUpdate[field] = req.body[field];
        }
    });

    return Email.findOneAndUpdate({_id: id, userId}, toUpdate, {new: true})
        .then(results => {
            res.status(200).json(results);
        })
        .catch(err => {
            res.status(500).json(err);
        }); 
});

// Create
router.post('/', jsonParser, jwtAuth, (req, res) => {
    const {title, content, recipients} = req.body;
    const userId = req.user.id;

    return Email.find({userId, title})
        .count()
        .then(count => {
            if(count > 0) {
                return Promise.reject({
                    code: 422,
                    reason: 'ValidationError',
                    message: 'Email already exists in collection',
                    location: 'email'
                });
            }
            return Email.create({
                userId,
                title,
                content,
                recipients
            })
        })
        .then(email => {
            return res.status(201).json(email);
        })
        .catch(err => {
            if(err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({code: 500, message: 'Internal server error'})
        });    
});

// Delete 
router.delete('/:id', jwtAuth, (req,res) => {
    const {id} = req.params;
    const userId = req.user.id;

    return Email.findOneAndRemove({_id: id, userId})
        .then( () => {
            return res.status(200).json('deleted');
        })
        .catch(err => {
            res.status(500).json({code: 500, message: err})
        });
});

module.exports = {router};