'use strict'

const { v4 : uuidv4 } = require('uuid');

const gen = (() => {
    return {
        
        generate : function(){
            return uuidv4();
        },

        get : function(){
            let uuid = this.generate();
            uuid = uuid.split('-').join(''); 
            return uuid;
        }
    };
})();

module.exports = gen;