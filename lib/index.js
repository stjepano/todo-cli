var Fs = require('fs');
var Sift = require('sift');
var chalk = require('chalk');
const path = require('path');

const curpath = () => path.join(process.cwd(), '.todos.json');

var TODO = function (callback) {
    var self = this;

    callback = callback || function (error) {
        if (error) throw error;
    };


    if (self.isInitialized()) {
        self.list(function (error, todos) {
            if (error) {
                return callback(error);
            }

            self.todos = todos;
            callback(null, todos, self);
        });
    } else {
        self.indirection(function() {
            self.todos = [];
            callback(null, [], self);
        });
    }

    return self;
};

TODO.prototype.isInitialized = function() {
    try {
        Fs.statSync(curpath());
        return true;
    } catch (e) {
        return false;
    }
}

TODO.prototype.init = function() {
    if (this.isInitialized()) {
        console.log(chalk.red("Todo already initialized"));
        return this;
    }
    try {
        Fs.statSync(curpath());
    } catch (e) {
        this.todos = [];
        this.save();
    }
    console.log(chalk.green("Todo initialized in this directory"));
    return this;
};


TODO.prototype.indirection = function(callback) {
    setTimeout(() => { callback(); }, 0);
}

/**
 * @param  {Function} callback
 * @return {object}
 */
TODO.prototype.list = function (callback) {
    Fs.readFile(curpath(), "utf-8", function (err, content) {
        if (err) {
            return callback(err);
        }
        try {
            content = JSON.parse(content);
        } catch (e) {
            err = e;
        }
        callback(err, content);
    });

    return this;
};

/**
 * @param  {string} todo
 * @return {object}
 */
TODO.prototype.create = function (todo) {
    this.todos.push({
        id: this.todos.length,
        todo: todo,
        state: 'OPEN'
    });

    console.log(chalk.green("Todo " + this.todos.length + " created"));

    return this;
};

/**
 * @param  {int}   id
 * @return {object}
 */
TODO.prototype.close = function (ids) {
    ids = ids.split(",");
    var self = this;

    ids.forEach(function (id) {
        if (!self.todos[id - 1]) {
            return console.log(chalk.red("Can't find todo with id: " + id + "."));
        }

        self.todos[id - 1].state = "CLOSED";
        console.log(chalk.green("Todo " + id + " closed"));
    });

    return self;
};

/**
 * @return {object}
 */
TODO.prototype.closeAll = function () {
    var i, length = this.todos.length;

    for (i = 0; i < length; i++) {
        this.todos[i].state = "CLOSED";
    }

    console.log(chalk.green("Closed all todos"));

    return this;
};

/**
 * @param  {int}   id
 * @return {object}
 */
TODO.prototype.reopen = function (ids) {
    ids = ids.split(",");
    var self = this;

    ids.forEach(function (id) {
        if (!self.todos[id - 1]) {
            return console.log(chalk.red("Can't find todo with id: " + id + "."));
        }

        self.todos[id - 1].state = "OPEN";
        console.log(chalk.green("Todo " + id + " reopened"));
    });

    return self;
};

/**
 * @return {object}
 */
TODO.prototype.reopenAll = function () {

    this.todos.forEach(function (todo) {
        todo.state = "OPEN";
    });

    console.log(chalk.green("Reopened all todos"));

    return this;
};

/**
 * @return {object}
 */
TODO.prototype.save = function () {
    Fs.writeFile(curpath(), JSON.stringify(this.todos, null, 2), function() {});
    return this;
};

/**
 * @param  {object}   filters
 * @param  {Function} callback
 * @return {object}
 */
TODO.prototype.filter = function (filters, callback) {
    callback(null, Sift(filters, this.todos));
    return this;
};

/**
 * @return {object}
 */
TODO.prototype.clear = function () {
    Fs.unlinkSync(curpath());
    console.log(chalk.green("Todo list finished and removed"));
    return this;
};

module.exports = TODO;