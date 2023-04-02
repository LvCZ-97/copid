import sqlite from './index';
import { Prisma } from './client';

test(sqlite.clipboard.searchAll());

async function test(promise?: Promise<unknown>) {
    try {
        const resolve = await promise;
        if (resolve) {
            console.log(resolve);
        }
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            console.error('error -> ', e.code);
        }
    }
}
