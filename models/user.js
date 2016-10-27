// user.js
// User model logic.
var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase("http://neo4j:root@localhost:7474");
;

// private constructor:
var User = module.exports = function User(_node) {
	// all we'll really store is the node; the rest of our properties will be
	// derivable or just pass-through properties (see below).
	this._node = _node;
}

// static methods:
User.get = function (id, callback) {
	var qp = {
		query: [
			'MATCH (user:User)',
			'WHERE ID(user) = {userId}',
			'RETURN user',
		].join('\n'),
		params: {
			userId: parseInt(id)
		}
	}

	db.cypher(qp, function (err, result) {
		if (err) return callback(err);
		callback(null, result[0]['user']);
	});
};

User.getBy = function (field, value, callback) {
	var qp = {
		query: [
			'MATCH (user:User)',
			'WHERE ' + field + ' = {value}',
			'RETURN user',
		].join('\n'),
		params: {
			value: value
		}
	}

	db.cypher(qp, function (err, result) {
		if (err) return callback(err);
		if (!result[0]) {
			callback(null, null);
		} else {
			callback(null, result[0]['user']);
		}
	});
}

User.create = function (data, callback) {
	var qp = {
		query: [
			'CREATE (user:User {data})',
			'RETURN user',
		].join('\n'),
		params: {
			data: data
		}
	}

	db.cypher(qp, function (err, results) {
		if (err) return callback(err);
		callback(null, results[0]['user']);
	});
};

User.update = function (data, callback) {
	var qp = {
		query: [
			'MATCH (user:User)',
			'WHERE id(user) = {userId}',
			'SET user += {props}',
			'RETURN user',
		].join('\n'),
		params: {
			userId: data.id,
			props: data.props,
		}
	}

	db.cypher(qp, function (err, results) {
		if (err) return callback(err);
		callback(null, results[0]['user']);
	});
}

