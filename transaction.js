"use strict";
module.exports = function*(ctx, p, u) {
    yield* ctx.effect(p.hash); //TODO: what is u is true?
};