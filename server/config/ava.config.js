import test from 'ava';
import request from 'supertest';
import path from 'path';

process.env.NODE_ENV = 'test';
process.env.WEB = 'true';
process.env.BABEL_ENV = 'development_web';
process.chdir(path.join(__dirname, '/../../'));

export { test, request };
