'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _deepFreeze = require('deep-freeze');

var _deepFreeze2 = _interopRequireDefault(_deepFreeze);

var _ = require('../');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Integration', function () {
    var session = void 0;
    var orm = void 0;
    var state = void 0;

    describe('Immutable session', function () {
        beforeEach(function () {
            var _createTestSessionWit = (0, _utils.createTestSessionWithData)();
            // Deep freeze state. This will raise an error if we
            // mutate the state.

            session = _createTestSessionWit.session;
            orm = _createTestSessionWit.orm;
            state = _createTestSessionWit.state;


            (0, _deepFreeze2.default)(state);
        });

        it('Initial data bootstrapping results in a correct state', function () {
            expect(state).toEqual(expect.objectContaining({
                Book: expect.anything(),
                Cover: expect.anything(),
                Genre: expect.anything(),
                Author: expect.anything(),
                BookGenres: expect.anything(),
                Publisher: expect.anything()
            }));

            expect(state.Book.items).toHaveLength(3);
            expect((0, _keys2.default)(state.Book.itemsById)).toHaveLength(3);

            expect(state.Cover.items).toHaveLength(3);
            expect((0, _keys2.default)(state.Cover.itemsById)).toHaveLength(3);

            expect(state.Genre.items).toHaveLength(4);
            expect((0, _keys2.default)(state.Genre.itemsById)).toHaveLength(4);

            expect(state.BookGenres.items).toHaveLength(5);
            expect((0, _keys2.default)(state.BookGenres.itemsById)).toHaveLength(5);

            expect(state.Author.items).toHaveLength(3);
            expect((0, _keys2.default)(state.Author.itemsById)).toHaveLength(3);

            expect(state.Publisher.items).toHaveLength(2);
            expect((0, _keys2.default)(state.Publisher.itemsById)).toHaveLength(2);
        });

        it('Models correctly indicate if id exists', function () {
            var _session = session,
                Book = _session.Book;

            expect(Book.hasId(0)).toBe(true);
            expect(Book.hasId(92384)).toBe(false);
            expect(Book.hasId()).toBe(false);
        });

        it('Models correctly create new instances', function () {
            var _session2 = session,
                Book = _session2.Book;

            var book = Book.create({
                name: 'New Book',
                author: 0,
                releaseYear: 2015,
                publisher: 0
            });
            expect(session.Book.count()).toBe(4);
            expect(session.Book.last().ref).toBe(book.ref);
        });

        it('Model.getId works', function () {
            var _session3 = session,
                Book = _session3.Book;

            expect(Book.withId(0).getId()).toBe(0);
            expect(Book.withId(1).getId()).toBe(1);
        });

        it('Model.create throws if passing duplicate ids to many-to-many field', function () {
            var _session4 = session,
                Book = _session4.Book;


            var newProps = {
                name: 'New Book',
                author: 0,
                releaseYear: 2015,
                genres: [0, 0],
                publisher: 0
            };

            expect(function () {
                return Book.create(newProps);
            }).toThrowError('Book.genres');
        });

        it('Models are correctly deleted', function () {
            var _session5 = session,
                Book = _session5.Book;

            expect(Book.count()).toBe(3);
            Book.withId(0).delete();
            expect(session.Book.count()).toBe(2);
            expect(session.Book.hasId(0)).toBe(false);
        });

        it('Models correctly update when setting properties', function () {
            var _session6 = session,
                Book = _session6.Book;

            var book = Book.first();
            var newName = 'New Name';
            book.name = newName;
            expect(session.Book.first().name).toBe(newName);
        });

        it('Model.toString works', function () {
            var _session7 = session,
                Book = _session7.Book;

            var book = Book.first();
            expect(book.toString()).toBe('Book: {id: 0, name: Tommi Kaikkonen - an Autobiography, ' + 'releaseYear: 2050, author: 0, cover: 0, genres: [0, 1], publisher: 1}');
        });

        it('withId throws if model instance not found', function () {
            var _session8 = session,
                Book = _session8.Book;

            expect(function () {
                return Book.withId(10);
            }).toThrowError(Error);
        });

        it('Models correctly create a new instance via upsert', function () {
            var _session9 = session,
                Book = _session9.Book;

            var book = Book.upsert({
                name: 'New Book',
                author: 0,
                releaseYear: 2015,
                publisher: 0
            });
            expect(session.Book.count()).toBe(4);
            expect(session.Book.last().ref).toBe(book.ref);
            expect(book).toBeInstanceOf(Book);
        });

        it('Models correctly update existing instance via upsert', function () {
            var _Book$upsert;

            var _session10 = session,
                Book = _session10.Book;

            var book = Book.upsert({
                name: 'New Book',
                author: 0,
                releaseYear: 2015,
                publisher: 0
            });
            expect(session.Book.count()).toBe(4);
            expect(session.Book.last().ref).toBe(book.ref);
            expect(session.Book.last().releaseYear).toBe(2015);

            var nextBook = Book.upsert((_Book$upsert = {}, (0, _defineProperty3.default)(_Book$upsert, Book.idAttribute, book.getId()), (0, _defineProperty3.default)(_Book$upsert, 'releaseYear', 2016), _Book$upsert));

            expect(session.Book.count()).toBe(4);
            expect(session.Book.last().ref).toBe(book.ref);
            expect(session.Book.last().ref).toBe(nextBook.ref);
            expect(session.Book.last().releaseYear).toBe(2016);
            expect(book.ref).toBe(nextBook.ref);
            expect(nextBook).toBeInstanceOf(Book);
        });

        it('many-to-many relationship descriptors work', function () {
            var _session11 = session,
                Book = _session11.Book,
                Genre = _session11.Genre;

            // Forward (from many-to-many field declaration)

            var book = Book.first();
            var relatedGenres = book.genres;
            expect(relatedGenres).toBeInstanceOf(_.QuerySet);
            expect(relatedGenres.modelClass).toBe(Genre);
            expect(relatedGenres.count()).toBe(2);

            // Backward
            var genre = Genre.first();
            var relatedBooks = genre.books;
            expect(relatedBooks).toBeInstanceOf(_.QuerySet);
            expect(relatedBooks.modelClass).toBe(Book);
        });

        it('many-to-many relationship descriptors work with a custom through model', function () {
            var _session12 = session,
                Author = _session12.Author,
                Publisher = _session12.Publisher;

            // Forward (from many-to-many field declaration)

            var author = Author.get({ name: 'Tommi Kaikkonen' });
            var relatedPublishers = author.publishers;
            expect(relatedPublishers).toBeInstanceOf(_.QuerySet);
            expect(relatedPublishers.modelClass).toBe(Publisher);
            expect(relatedPublishers.count()).toBe(1);

            // Backward
            var publisher = Publisher.get({ name: 'Technical Publishing' });
            var relatedAuthors = publisher.authors;
            expect(relatedAuthors).toBeInstanceOf(_.QuerySet);
            expect(relatedAuthors.modelClass).toBe(Author);
            expect(relatedAuthors.count()).toBe(2);
        });

        it('adding related many-to-many entities works', function () {
            var _session13 = session,
                Book = _session13.Book,
                Genre = _session13.Genre;

            var book = Book.withId(0);
            expect(book.genres.count()).toBe(2);
            book.genres.add(Genre.withId(2));
            expect(book.genres.count()).toBe(3);
        });

        it('trying to add existing related many-to-many entities throws', function () {
            var _session14 = session,
                Book = _session14.Book;

            var book = Book.withId(0);

            var existingId = 1;
            expect(function () {
                return book.genres.add(existingId);
            }).toThrowError(existingId.toString());
        });

        it('updating related many-to-many entities through ids works', function () {
            var _session15 = session,
                Genre = _session15.Genre,
                Author = _session15.Author;

            var tommi = Author.get({ name: 'Tommi Kaikkonen' });
            var book = tommi.books.first();
            expect(book.genres.toRefArray().map(function (row) {
                return row.id;
            })).toEqual([0, 1]);

            var deleteGenre = Genre.withId(0);

            book.update({ genres: [1, 2] });
            expect(book.genres.toRefArray().map(function (row) {
                return row.id;
            })).toEqual([1, 2]);

            expect(deleteGenre.books.filter({ id: book.id }).exists()).toBe(false);
        });

        it('updating related many-to-many with not existing entities works', function () {
            var _session16 = session,
                Book = _session16.Book;

            var book = Book.first();

            book.update({ genres: [0, 99] });

            expect(session.BookGenres.filter({ fromBookId: book.id }).toRefArray().map(function (row) {
                return row.toGenreId;
            })).toEqual([0, 99]);
            expect(book.genres.toRefArray().map(function (row) {
                return row.id;
            })).toEqual([0]);

            book.update({ genres: [1, 98] });

            expect(session.BookGenres.filter({ fromBookId: book.id }).toRefArray().map(function (row) {
                return row.toGenreId;
            })).toEqual([1, 98]);
            expect(book.genres.toRefArray().map(function (row) {
                return row.id;
            })).toEqual([1]);
        });

        it('updating non-existing many-to-many entities works', function () {
            var _session17 = session,
                Genre = _session17.Genre,
                Author = _session17.Author;

            var tommi = Author.get({ name: 'Tommi Kaikkonen' });
            var book = tommi.books.first();
            expect(book.genres.toRefArray().map(function (row) {
                return row.id;
            })).toEqual([0, 1]);

            var deleteGenre = Genre.withId(0);
            var keepGenre = Genre.withId(1);
            var addGenre = Genre.withId(2);

            book.update({ genres: [addGenre, keepGenre] });
            expect(book.genres.toRefArray().map(function (row) {
                return row.id;
            })).toEqual([1, 2]);

            expect(deleteGenre.books.filter({ id: book.id }).exists()).toBe(false);
        });

        it('removing related many-to-many entities works', function () {
            var _session18 = session,
                Book = _session18.Book,
                Genre = _session18.Genre;

            var book = Book.withId(0);
            expect(book.genres.count()).toBe(2);
            book.genres.remove(Genre.withId(0));

            expect(session.Book.withId(0).genres.count()).toBe(1);
        });

        it('trying to remove unexisting related many-to-many entities throws', function () {
            var _session19 = session,
                Book = _session19.Book;

            var book = Book.withId(0);

            var unexistingId = 2012384;
            expect(function () {
                return book.genres.remove(0, unexistingId);
            }).toThrowError(unexistingId.toString());
        });

        it('clearing related many-to-many entities works', function () {
            var _session20 = session,
                Book = _session20.Book;

            var book = Book.withId(0);
            expect(book.genres.count()).toBe(2);
            book.genres.clear();

            expect(session.Book.withId(0).genres.count()).toBe(0);
        });

        it('foreign key relationship descriptors work', function () {
            var _session21 = session,
                Book = _session21.Book,
                Author = _session21.Author;

            // Forward

            var book = Book.first();
            var author = book.author;
            var rawFk = book.ref.author;
            expect(author).toBeInstanceOf(Author);
            expect(author.getId()).toBe(rawFk);

            // Backward
            var relatedBooks = author.books;
            expect(relatedBooks).toBeInstanceOf(_.QuerySet);
            relatedBooks._evaluate();
            expect(relatedBooks.rows).toContain(book.ref);
            expect(relatedBooks.modelClass).toBe(Book);
        });

        it('one-to-one relationship descriptors work', function () {
            var _session22 = session,
                Book = _session22.Book,
                Cover = _session22.Cover;

            // Forward

            var book = Book.first();
            var cover = book.cover;
            var rawFk = book.ref.cover;
            expect(cover).toBeInstanceOf(Cover);
            expect(cover.getId()).toBe(rawFk);

            // Backward
            var relatedBook = cover.book;
            expect(relatedBook).toBeInstanceOf(Book);
            expect(relatedBook.getId()).toBe(book.getId());
        });

        it('applying no updates returns the same state reference', function () {
            var book = session.Book.first();
            book.name = book.name;

            expect(session.state).toBe(state);
        });

        it('Model works with default value', function () {
            var returnId = 1;

            var DefaultFieldModel = function (_Model) {
                (0, _inherits3.default)(DefaultFieldModel, _Model);

                function DefaultFieldModel() {
                    (0, _classCallCheck3.default)(this, DefaultFieldModel);
                    return (0, _possibleConstructorReturn3.default)(this, _Model.apply(this, arguments));
                }

                return DefaultFieldModel;
            }(_.Model);

            DefaultFieldModel.fields = {
                id: (0, _.attr)({ getDefault: function getDefault() {
                        return returnId;
                    } })
            };
            DefaultFieldModel.modelName = 'DefaultFieldModel';

            var _orm = new _.ORM();
            _orm.register(DefaultFieldModel);

            var sess = _orm.session(_orm.getEmptyState());
            sess.DefaultFieldModel.create({});

            expect(sess.DefaultFieldModel.hasId(1)).toBe(true);

            returnId = 999;
            sess.DefaultFieldModel.create({});
            expect(sess.DefaultFieldModel.hasId(999)).toBe(true);
        });
    });

    describe('Mutating session', function () {
        beforeEach(function () {
            var _createTestSessionWit2 = (0, _utils.createTestSessionWithData)();

            session = _createTestSessionWit2.session;
            orm = _createTestSessionWit2.orm;
            state = _createTestSessionWit2.state;
        });

        it('works', function () {
            var mutating = orm.mutableSession(state);
            var Book = mutating.Book,
                Cover = mutating.Cover;


            var cover = Cover.create({ src: 'somecover.png' });
            var coverId = cover.getId();

            var book = Book.first();
            var bookRef = book.ref;
            var bookId = book.getId();
            expect(state.Book.itemsById[bookId]).toBe(bookRef);
            var newName = 'New Name';

            book.name = newName;

            expect(book.name).toBe(newName);

            var nextState = mutating.state;
            expect(nextState).toBe(state);
            expect(state.Book.itemsById[bookId]).toBe(bookRef);
            expect(bookRef.name).toBe(newName);
            expect(state.Cover.itemsById[coverId].src).toBe('somecover.png');
        });
    });

    describe('many-many forward/backward updates', function () {
        var Team = void 0;
        var User = void 0;
        var teamFirst = void 0;
        var userFirst = void 0;
        var userLast = void 0;
        var validateRelationState = void 0;

        beforeEach(function () {
            User = function (_Model2) {
                (0, _inherits3.default)(User, _Model2);

                function User() {
                    (0, _classCallCheck3.default)(this, User);
                    return (0, _possibleConstructorReturn3.default)(this, _Model2.apply(this, arguments));
                }

                return User;
            }(_.Model);
            User.modelName = 'User';
            User.fields = {
                id: (0, _.attr)(),
                name: (0, _.attr)()
            };

            Team = function (_Model3) {
                (0, _inherits3.default)(Team, _Model3);

                function Team() {
                    (0, _classCallCheck3.default)(this, Team);
                    return (0, _possibleConstructorReturn3.default)(this, _Model3.apply(this, arguments));
                }

                return Team;
            }(_.Model);
            Team.modelName = 'Team';
            Team.fields = {
                id: (0, _.attr)(),
                name: (0, _.attr)(),
                users: (0, _.many)('User', 'teams')
            };

            orm = new _.ORM();
            orm.register(User, Team);
            session = orm.session(orm.getEmptyState());

            session.Team.create({ name: 'team0' });
            session.Team.create({ name: 'team1' });

            session.User.create({ name: 'user0' });
            session.User.create({ name: 'user1' });
            session.User.create({ name: 'user2' });

            teamFirst = session.Team.first();
            userFirst = session.User.first();
            userLast = session.User.last();

            validateRelationState = function validateRelationState() {
                var _session23 = session,
                    TeamUsers = _session23.TeamUsers;


                teamFirst = session.Team.first();
                userFirst = session.User.first();
                userLast = session.User.last();

                expect(teamFirst.users.toRefArray().map(function (row) {
                    return row.id;
                })).toEqual([userFirst.id, userLast.id]);
                expect(userFirst.teams.toRefArray().map(function (row) {
                    return row.id;
                })).toEqual([teamFirst.id]);
                expect(userLast.teams.toRefArray().map(function (row) {
                    return row.id;
                })).toEqual([teamFirst.id]);

                expect(TeamUsers.count()).toBe(2);
            };
        });

        it('add forward many-many field', function () {
            teamFirst.users.add(userFirst, userLast);
            validateRelationState();
        });

        it('update forward many-many field', function () {
            teamFirst.update({ users: [userFirst, userLast] });
            validateRelationState();
        });

        it('add backward many-many field', function () {
            userFirst.teams.add(teamFirst);
            userLast.teams.add(teamFirst);
            validateRelationState();
        });

        it('update backward many-many field', function () {
            userFirst.update({ teams: [teamFirst] });
            userLast.update({ teams: [teamFirst] });
            validateRelationState();
        });

        it('create with forward many-many field', function () {
            session.Team.all().delete();
            session.User.all().delete();
            expect(session.Team.count()).toBe(0);
            expect(session.User.count()).toBe(0);
            expect(session.TeamUsers.count()).toBe(0);

            session.User.create({ name: 'user0' });
            session.User.create({ name: 'user1' });
            session.User.create({ name: 'user2' });

            session.Team.create({ name: 'team0', users: [session.User.first(), session.User.last()] });
            session.Team.create({ name: 'team1' });

            validateRelationState();
        });

        it('create with backward many-many field', function () {
            session.Team.all().delete();
            session.User.all().delete();
            expect(session.Team.count()).toBe(0);
            expect(session.User.count()).toBe(0);
            expect(session.TeamUsers.count()).toBe(0);

            session.Team.create({ name: 'team0' });
            session.Team.create({ name: 'team1' });

            session.User.create({ name: 'user0', teams: [session.Team.first()] });
            session.User.create({ name: 'user1' });
            session.User.create({ name: 'user2', teams: [session.Team.first()] });

            validateRelationState();
        });

        it('create with forward field with future many-many', function () {
            session.Team.all().delete();
            session.User.all().delete();
            expect(session.Team.count()).toBe(0);
            expect(session.User.count()).toBe(0);
            expect(session.TeamUsers.count()).toBe(0);

            session.Team.create({ id: 't0', users: ['u0', 'u2'] });
            session.Team.create({ id: 't1' });

            session.User.create({ id: 'u0' });
            session.User.create({ id: 'u1' });
            session.User.create({ id: 'u2' });

            validateRelationState();
        });

        it('create with backward field with future many-many', function () {
            session.Team.all().delete();
            session.User.all().delete();
            expect(session.Team.count()).toBe(0);
            expect(session.User.count()).toBe(0);
            expect(session.TeamUsers.count()).toBe(0);

            session.User.create({ id: 'u0', teams: ['t0'] });
            session.User.create({ id: 'u1' });
            session.User.create({ id: 'u2', teams: ['t0'] });

            session.Team.create({ id: 't0' });
            session.Team.create({ id: 't1' });

            validateRelationState();
        });

        it('create with forward field and existing backward many-many', function () {
            session.Team.all().delete();
            session.User.all().delete();
            expect(session.Team.count()).toBe(0);
            expect(session.User.count()).toBe(0);
            expect(session.TeamUsers.count()).toBe(0);

            session.User.create({ id: 'u0', teams: ['t0'] });
            session.User.create({ id: 'u1' });
            session.User.create({ id: 'u2', teams: ['t0'] });

            session.Team.create({ id: 't0', users: ['u0', 'u2'] });
            session.Team.create({ id: 't1' });

            validateRelationState();
        });

        it('create with backward field and existing forward many-many', function () {
            session.Team.all().delete();
            session.User.all().delete();
            expect(session.Team.count()).toBe(0);
            expect(session.User.count()).toBe(0);
            expect(session.TeamUsers.count()).toBe(0);

            session.Team.create({ id: 't0', users: ['u0', 'u2'] });
            session.Team.create({ id: 't1' });

            session.User.create({ id: 'u0', teams: ['t0'] });
            session.User.create({ id: 'u1' });
            session.User.create({ id: 'u2', teams: ['t0'] });

            validateRelationState();
        });
    });

    describe('many-many with a custom through model', function () {
        var validateRelationState = void 0;
        beforeEach(function () {
            validateRelationState = function validateRelationState() {
                var _session24 = session,
                    User = _session24.User,
                    Team = _session24.Team,
                    User2Team = _session24.User2Team;

                // Forward (from many-to-many field declaration)

                var user = User.get({ name: 'user0' });
                var relatedTeams = user.teams;
                expect(relatedTeams).toBeInstanceOf(_.QuerySet);
                expect(relatedTeams.modelClass).toBe(Team);
                expect(relatedTeams.count()).toBe(1);

                // Backward
                var team = Team.get({ name: 'team0' });
                var relatedUsers = team.users;
                expect(relatedUsers).toBeInstanceOf(_.QuerySet);
                expect(relatedUsers.modelClass).toBe(User);
                expect(relatedUsers.count()).toBe(2);

                expect(team.users.toRefArray().map(function (row) {
                    return row.id;
                })).toEqual(['u0', 'u1']);
                expect(Team.withId('t2').users.toRefArray().map(function (row) {
                    return row.id;
                })).toEqual(['u1']);

                expect(user.teams.toRefArray().map(function (row) {
                    return row.id;
                })).toEqual([team.id]);
                expect(User.withId('u1').teams.toRefArray().map(function (row) {
                    return row.id;
                })).toEqual(['t0', 't2']);

                expect(User2Team.count()).toBe(3);
            };
        });

        it('without throughFields', function () {
            var UserModel = function (_Model4) {
                (0, _inherits3.default)(UserModel, _Model4);

                function UserModel() {
                    (0, _classCallCheck3.default)(this, UserModel);
                    return (0, _possibleConstructorReturn3.default)(this, _Model4.apply(this, arguments));
                }

                return UserModel;
            }(_.Model);
            UserModel.modelName = 'User';
            UserModel.fields = {
                id: (0, _.attr)(),
                name: (0, _.attr)()
            };
            var User2TeamModel = function (_Model5) {
                (0, _inherits3.default)(User2TeamModel, _Model5);

                function User2TeamModel() {
                    (0, _classCallCheck3.default)(this, User2TeamModel);
                    return (0, _possibleConstructorReturn3.default)(this, _Model5.apply(this, arguments));
                }

                return User2TeamModel;
            }(_.Model);
            User2TeamModel.modelName = 'User2Team';
            User2TeamModel.fields = {
                user: (0, _.fk)('User'),
                team: (0, _.fk)('Team')
            };
            var TeamModel = function (_Model6) {
                (0, _inherits3.default)(TeamModel, _Model6);

                function TeamModel() {
                    (0, _classCallCheck3.default)(this, TeamModel);
                    return (0, _possibleConstructorReturn3.default)(this, _Model6.apply(this, arguments));
                }

                return TeamModel;
            }(_.Model);
            TeamModel.modelName = 'Team';
            TeamModel.fields = {
                id: (0, _.attr)(),
                name: (0, _.attr)(),
                users: (0, _.many)({
                    to: 'User',
                    through: 'User2Team',
                    relatedName: 'teams'
                })
            };

            orm = new _.ORM();
            orm.register(UserModel, TeamModel, User2TeamModel);
            session = orm.session(orm.getEmptyState());
            var _session25 = session,
                User = _session25.User,
                Team = _session25.Team,
                User2Team = _session25.User2Team;


            Team.create({ id: 't0', name: 'team0' });
            Team.create({ id: 't1', name: 'team1' });
            Team.create({ id: 't2', name: 'team2' });

            User.create({ id: 'u0', name: 'user0', teams: ['t0'] });
            User.create({ id: 'u1', name: 'user1', teams: ['t0', 't2'] });

            validateRelationState();
        });

        it('with throughFields', function () {
            var UserModel = function (_Model7) {
                (0, _inherits3.default)(UserModel, _Model7);

                function UserModel() {
                    (0, _classCallCheck3.default)(this, UserModel);
                    return (0, _possibleConstructorReturn3.default)(this, _Model7.apply(this, arguments));
                }

                return UserModel;
            }(_.Model);
            UserModel.modelName = 'User';
            UserModel.fields = {
                id: (0, _.attr)(),
                name: (0, _.attr)()
            };
            var User2TeamModel = function (_Model8) {
                (0, _inherits3.default)(User2TeamModel, _Model8);

                function User2TeamModel() {
                    (0, _classCallCheck3.default)(this, User2TeamModel);
                    return (0, _possibleConstructorReturn3.default)(this, _Model8.apply(this, arguments));
                }

                return User2TeamModel;
            }(_.Model);
            User2TeamModel.modelName = 'User2Team';
            User2TeamModel.fields = {
                user: (0, _.fk)('User'),
                team: (0, _.fk)('Team')
            };
            var TeamModel = function (_Model9) {
                (0, _inherits3.default)(TeamModel, _Model9);

                function TeamModel() {
                    (0, _classCallCheck3.default)(this, TeamModel);
                    return (0, _possibleConstructorReturn3.default)(this, _Model9.apply(this, arguments));
                }

                return TeamModel;
            }(_.Model);
            TeamModel.modelName = 'Team';
            TeamModel.fields = {
                id: (0, _.attr)(),
                name: (0, _.attr)(),
                users: (0, _.many)({
                    to: 'User',
                    through: 'User2Team',
                    relatedName: 'teams',
                    throughFields: ['user', 'team']
                })
            };

            orm = new _.ORM();
            orm.register(UserModel, TeamModel, User2TeamModel);
            session = orm.session(orm.getEmptyState());
            var _session26 = session,
                User = _session26.User,
                Team = _session26.Team,
                User2Team = _session26.User2Team;


            Team.create({ id: 't0', name: 'team0' });
            Team.create({ id: 't1', name: 'team1' });
            Team.create({ id: 't2', name: 'team2' });

            User.create({ id: 'u0', name: 'user0', teams: ['t0'] });
            User.create({ id: 'u1', name: 'user1', teams: ['t0', 't2'] });

            validateRelationState();
        });

        it('with additional attributes', function () {
            var UserModel = function (_Model10) {
                (0, _inherits3.default)(UserModel, _Model10);

                function UserModel() {
                    (0, _classCallCheck3.default)(this, UserModel);
                    return (0, _possibleConstructorReturn3.default)(this, _Model10.apply(this, arguments));
                }

                return UserModel;
            }(_.Model);
            UserModel.modelName = 'User';
            UserModel.fields = {
                id: (0, _.attr)(),
                name: (0, _.attr)()
            };
            var User2TeamModel = function (_Model11) {
                (0, _inherits3.default)(User2TeamModel, _Model11);

                function User2TeamModel() {
                    (0, _classCallCheck3.default)(this, User2TeamModel);
                    return (0, _possibleConstructorReturn3.default)(this, _Model11.apply(this, arguments));
                }

                return User2TeamModel;
            }(_.Model);
            User2TeamModel.modelName = 'User2Team';
            User2TeamModel.fields = {
                user: (0, _.fk)('User', 'links'),
                team: (0, _.fk)('Team', 'links'),
                name: (0, _.attr)()
            };
            var TeamModel = function (_Model12) {
                (0, _inherits3.default)(TeamModel, _Model12);

                function TeamModel() {
                    (0, _classCallCheck3.default)(this, TeamModel);
                    return (0, _possibleConstructorReturn3.default)(this, _Model12.apply(this, arguments));
                }

                return TeamModel;
            }(_.Model);
            TeamModel.modelName = 'Team';
            TeamModel.fields = {
                id: (0, _.attr)(),
                name: (0, _.attr)(),
                users: (0, _.many)({
                    to: 'User',
                    through: 'User2Team',
                    relatedName: 'teams'
                })
            };

            orm = new _.ORM();
            orm.register(UserModel, TeamModel, User2TeamModel);
            session = orm.session(orm.getEmptyState());
            var _session27 = session,
                User = _session27.User,
                Team = _session27.Team,
                User2Team = _session27.User2Team;


            Team.create({ id: 't0', name: 'team0' });
            Team.create({ id: 't1', name: 'team1' });
            Team.create({ id: 't2', name: 'team2' });

            User.create({ id: 'u0', name: 'user0' });
            User.create({ id: 'u1', name: 'user1' });

            User2Team.create({ user: 'u0', team: 't0', name: 'link0' });
            User2Team.create({ user: 'u1', team: 't0', name: 'link1' });
            User2Team.create({ user: 'u1', team: 't2', name: 'link2' });

            validateRelationState();

            expect(User.withId('u0').links.toRefArray().map(function (row) {
                return row.name;
            })).toEqual(['link0']);
            expect(User.withId('u1').links.toRefArray().map(function (row) {
                return row.name;
            })).toEqual(['link1', 'link2']);
        });
    });

    describe('Multiple concurrent sessions', function () {
        beforeEach(function () {
            var _createTestSessionWit3 = (0, _utils.createTestSessionWithData)();

            session = _createTestSessionWit3.session;
            orm = _createTestSessionWit3.orm;
            state = _createTestSessionWit3.state;
        });

        it('works', function () {
            var firstSession = session;
            var secondSession = orm.session(state);

            expect(firstSession.Book.count()).toBe(3);
            expect(secondSession.Book.count()).toBe(3);

            var newBookProps = {
                name: 'New Book',
                author: 0,
                releaseYear: 2015,
                genres: [0, 1]
            };

            firstSession.Book.create(newBookProps);

            expect(firstSession.Book.count()).toBe(4);
            expect(secondSession.Book.count()).toBe(3);
        });
    });
});

describe('Big Data Test', function () {
    var Item = void 0;
    var orm = void 0;

    beforeEach(function () {
        Item = function (_Model13) {
            (0, _inherits3.default)(Item, _Model13);

            function Item() {
                (0, _classCallCheck3.default)(this, Item);
                return (0, _possibleConstructorReturn3.default)(this, _Model13.apply(this, arguments));
            }

            return Item;
        }(_.Model);
        Item.modelName = 'Item';
        Item.fields = {
            id: (0, _.attr)(),
            name: (0, _.attr)()
        };
        orm = new _.ORM();
        orm.register(Item);
    });

    it('adds a big amount of items in acceptable time', function () {
        var session = orm.session(orm.getEmptyState());
        var start = new Date().getTime();

        var amount = 10000;
        for (var i = 0; i < amount; i++) {
            session.Item.create({ id: i, name: 'TestItem' });
        }
        var end = new Date().getTime();
        var tookSeconds = (end - start) / 1000;
        console.log('Creating ' + amount + ' objects took ' + tookSeconds + 's');
        expect(tookSeconds).toBeLessThanOrEqual(3);
    });

    it('looks up items by id in a large table in acceptable time', function () {
        var session = orm.session(orm.getEmptyState());

        var rowCount = 20000;
        for (var i = 0; i < rowCount; i++) {
            session.Item.create({ id: i, name: 'TestItem' });
        }

        var lookupCount = 10000;
        var maxId = rowCount - 1;
        var start = new Date().getTime();
        for (var j = maxId; j > maxId - lookupCount; j--) {
            session.Item.withId(j);
        }
        var end = new Date().getTime();
        var tookSeconds = (end - start) / 1000;
        console.log('Looking up ' + lookupCount + ' objects by id took ' + tookSeconds + 's');
        expect(tookSeconds).toBeLessThanOrEqual(3);
    });
});

describe('Many-to-many relationship performance', function () {
    var Parent = void 0;
    var Child = void 0;
    var orm = void 0;

    beforeEach(function () {
        Parent = function (_Model14) {
            (0, _inherits3.default)(Parent, _Model14);

            function Parent() {
                (0, _classCallCheck3.default)(this, Parent);
                return (0, _possibleConstructorReturn3.default)(this, _Model14.apply(this, arguments));
            }

            return Parent;
        }(_.Model);
        Parent.modelName = 'Parent';
        Parent.fields = {
            id: (0, _.attr)(),
            name: (0, _.attr)(),
            children: (0, _.many)('Child', 'parent')
        };
        Child = function (_Model15) {
            (0, _inherits3.default)(Child, _Model15);

            function Child() {
                (0, _classCallCheck3.default)(this, Child);
                return (0, _possibleConstructorReturn3.default)(this, _Model15.apply(this, arguments));
            }

            return Child;
        }(_.Model);
        Child.modelName = 'Child';
        orm = new _.ORM();
        orm.register(Parent, Child);
    });

    it('adds many-to-many relationships in acceptable time', function () {
        var session = orm.session(orm.getEmptyState());

        var totalAmount = 8000;
        for (var i = 0; i < totalAmount; i++) {
            session.Child.create({ id: i, name: 'TestChild' });
        }

        var parent = session.Parent.create({});
        var start = new Date().getTime();
        var childAmount = 2500;
        for (var _i = 0; _i < childAmount; _i++) {
            parent.children.add(_i);
        }

        var end = new Date().getTime();
        var tookSeconds = (end - start) / 1000;
        console.log('Adding ' + childAmount + ' relations took ' + tookSeconds + 's');
        expect(tookSeconds).toBeLessThanOrEqual(process.env.TRAVIS ? 10 : 3);
    });

    it('queries many-to-many relationships in acceptable time', function () {
        var session = orm.session(orm.getEmptyState());

        var totalAmount = 10000;
        for (var i = 0; i < totalAmount; i++) {
            session.Child.create({ id: i, name: 'TestChild' });
        }

        var parent = session.Parent.create({});
        var relationshipAmount = 3000;
        for (var _i2 = 0; _i2 < relationshipAmount; _i2++) {
            parent.children.add(_i2);
        }

        var start = new Date().getTime();
        var queryCount = 500;
        for (var j = 0; j < queryCount; j++) {
            parent.children.count();
        }

        var end = new Date().getTime();
        var tookSeconds = (end - start) / 1000;
        console.log('Performing ' + queryCount + ' queries took ' + tookSeconds + 's');
        expect(tookSeconds).toBeLessThanOrEqual(process.env.TRAVIS ? 10 : 3);
    });

    it('removes many-to-many relationships in acceptable time', function () {
        var session = orm.session(orm.getEmptyState());

        var totalAmount = 10000;
        for (var i = 0; i < totalAmount; i++) {
            session.Child.create({ id: i, name: 'TestChild' });
        }

        var parent = session.Parent.create({});
        var childAmount = 2000;
        for (var _i3 = 0; _i3 < childAmount; _i3++) {
            parent.children.add(_i3);
        }

        var removeCount = 1000;
        var start = new Date().getTime();
        for (var j = 0; j < removeCount; j++) {
            parent.children.remove(j);
        }

        var end = new Date().getTime();
        var tookSeconds = (end - start) / 1000;
        console.log('Removing ' + removeCount + ' relations took ' + tookSeconds + 's');
        expect(tookSeconds).toBeLessThanOrEqual(process.env.TRAVIS ? 10 : 3);
    });
});