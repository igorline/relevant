import test from 'ava';
import request from 'supertest';
import path from 'path';

process.env.NODE_ENV = 'test';
process.env.WEB = 'true';
process.chdir(path.join(__dirname, '/../../'));

module.exports = { test, request };
