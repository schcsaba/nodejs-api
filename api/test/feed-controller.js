const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');
const io = require('../socket');

const User = require('../models/user');
const FeedController = require('../controllers/feed');

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@nodejs01-mongo.eg2g7ue.mongodb.net/test-messages?retryWrites=true&w=majority`;

describe('Feed Controller', function () {
    before(function (done) {
        mongoose
            .connect(MONGODB_URI)
            .then(result => {
                const user = new User({
                    email: 'test@test.com',
                    password: 'tester',
                    name: 'Test',
                    posts: [],
                    _id: '5c0f66b979af55031b34728a'
                });
                return user.save();
            })
            .then(() => {
                done();
            });
    });
    it('should add a created post to the posts of the creator', function (done) {
        const req = {
            body: {
                title: 'Test Post',
                content: 'A test post'
            },
            file: {
                path: 'abc'
            },
            userId: '5c0f66b979af55031b34728a'
        };
        const res = {
            status: function () {
                return this;
            },
            json: function () { }
        };
        sinon.stub(io, 'getIO');
        io.getIO.returns({ emit: () => { } });
        FeedController.createPost(req, res, () => { })
            .then(savedUser => {
                expect(savedUser).to.have.property('posts');
                expect(savedUser.posts).to.have.length(1);
                io.getIO.restore();
                done();
            });
    });
    after(function (done) {
        User.deleteMany({})
            .then(() => {
                return mongoose.disconnect();
            })
            .then(() => {
                done();
            });
    });
});
