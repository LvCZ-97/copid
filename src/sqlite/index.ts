import { PrismaClient, Clipboard, RendererConfig, Prisma } from './client';

export interface IResolveInfo<T> {
    data?: T;
    deleteRecord?: T; // 删除的记录
    hasSameRecord?: boolean; // 是否存在相同记录
}

let prisma: PrismaClient;

function load() {
    if (prisma) {
        // ...
    } else {
        prisma = new PrismaClient();
    }
}

const rendererConfig = {
    async search(project: string) {
        load();
        const resolveInfo: IResolveInfo<RendererConfig> = {};
        try {
            const result = await prisma.rendererConfig.findFirst({ where: { project } });
            if (result) {
                resolveInfo.data = result;
            }
            return resolveInfo;
        } catch (e) {
            console.error('sqlite.rendererConfig.updateConfig error -> ', e);
            return Promise.reject(e);
        }
    },

    async update(project: string, config: string) {
        load();
        const resolveInfo: IResolveInfo<RendererConfig> = {};
        try {
            resolveInfo.data = await prisma.rendererConfig.upsert({
                create: { project, config },
                update: { project, config },
                where: { project },
            });
            return resolveInfo;
        } catch (e) {
            console.error('sqlite.rendererConfig.update error -> ', e);
            return Promise.reject(e);
        }
    },
};

const clipboard = {
    /**
     * 添加记录
     *
     * options.deleteSameRecord 是否删除相同记录
     */
    async createOne(data: { content: string }, options?: { deleteSameRecord?: boolean }) {
        load();
        const resolveInfo: IResolveInfo<Clipboard> = {};
        try {
            resolveInfo.data = await prisma.clipboard.create({ data });
            return resolveInfo;
        } catch (e) {
            try {
                if (e instanceof Prisma.PrismaClientKnownRequestError) {
                    switch (e.code) {
                        case 'P2002': {
                            resolveInfo.hasSameRecord = true;

                            // 删除相同记录，插入新记录
                            if (options?.deleteSameRecord) {
                                const deleteSuccess = await prisma.clipboard.delete({ where: { content: data.content } });
                                if (deleteSuccess) {
                                    resolveInfo.deleteRecord = deleteSuccess;
                                    resolveInfo.data = await prisma.clipboard.create({ data });
                                    return resolveInfo;
                                }
                            }

                            return resolveInfo;
                        }
                    }
                }
                throw e;
            } catch (e) {
                console.error('sqlite.clipboard.createOne error -> ', e);
                return Promise.reject(e);
            }
        }
    },

    /**
     * 删除记录
     */
    async deleteOne(id: number) {
        load();
        const resolveInfo: IResolveInfo<Clipboard> = {};
        try {
            resolveInfo.data = await prisma.clipboard.delete({ where: { id } });
            return resolveInfo;
        } catch (e) {
            console.error('sqlite.clipboard.deleteOne error -> ', e);
            return Promise.reject(e);
        }
    },

    /**
     * 删除所有记录
     */
    async deleteAll() {
        try {
            load();
            await prisma.clipboard.deleteMany();
        } catch (e) {
            console.error('sqlite.clipboard.deleteAll error -> ', e);
            return Promise.reject(e);
        }
    },

    /**
     * 查询所有记录
     *
     * options.reverse 反转列表记录
     */
    async searchAll(options?: { reverse?: boolean }) {
        load();
        const resolveInfo: IResolveInfo<Clipboard[]> = {};
        try {
            resolveInfo.data = await prisma.clipboard.findMany();
            if (options?.reverse) {
                resolveInfo.data = resolveInfo.data.reverse();
            }
            return resolveInfo;
        } catch (e) {
            console.error('sqlite.clipboard.searchAll error -> ', e);
            return Promise.reject(e);
        }
    },
};

export * from './client';

export default {
    clipboard,
    rendererConfig,
};
