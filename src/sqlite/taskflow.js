const path = require('path');
const fs = require('fs-extra');
const { sh } = require('tasksfile');
const concurrently = require('concurrently');

const packageJson = require('../../package.json');
const { deepProps, getAppDataPath } = require('../../taskutils');

const schemaName = 'schema.prisma';
const devSchemaName = 'schema.dev.prisma';

/**
 * 重写 schema.prisma 文件，用于构建 client
 */
function rewriteSchemaFile(input, output, templateData) {
    let fileContent = fs.readFileSync(input, 'utf-8');

    const matchStrArr = fileContent.matchAll(/\$\{.*\}/g);
    [...matchStrArr].forEach(item => {
        const key = item[0];
        const value = deepProps(packageJson.customerBuild.sqlite, key.replace('${', '').replace('}', ''));
        if (value) {
            templateData['\\' + key] = value;
        }
    });

    for (const key in templateData) {
        const reg = new RegExp(key, 'g');
        fileContent = fileContent.replace(reg, templateData[key]);
    }

    fs.writeFileSync(output, fileContent);
}

function getBinaryTargets() {
    return process.platform === 'darwin' ? packageJson.customerBuild.sqlite.binaryTargets.mac : packageJson.customerBuild.sqlite.binaryTargets.win;
}

class TaskMap {
    clear() {
        sh('rimraf client');
    }

    /**
     * 按开发模式下的构建
     */
    build() {
        this.clear();

        const schemaPath = path.join(__dirname, schemaName);
        const devSchemaPath = path.join(__dirname, devSchemaName);
        rewriteSchemaFile(devSchemaPath, schemaPath, {
            '#{binaryTargets}': getBinaryTargets(),
            '#{dbpath}': packageJson.customerBuild.sqlite.dbpath.default,
        });

        sh('prisma db push --force-reset');
    }

    dev() {
        concurrently(['tsc --watch index.ts --skipLibCheck --outDir ../../dist/sqlite']);
    }

    pack() {
        sh('tsc index.ts --skipLibCheck --outDir ../../dist/sqlite');

        // dist
        const targetDir = path.join(__dirname, '..', '..', packageJson.build.directories.output);

        const devSchemaPath = path.join(__dirname, devSchemaName);
        const schemaPath = path.join(targetDir, 'sqlite', 'client', schemaName);
        rewriteSchemaFile(devSchemaPath, schemaPath, {
            '#{binaryTargets}': getBinaryTargets(),
            '#{dbpath}': getAppDataPath() + '/' + packageJson.customerBuild.sqlite.dbpath.appData,
        });
    }

    test() {
        concurrently(['ts-node test.ts --skipLibCheck']);
    }
}

function run() {
    const args = process.argv;
    if (args && args.length >= 2) {
        const taskMap = new TaskMap();
        const argArray = args.slice(2);
        const [task] = argArray;
        taskMap[task]();
    }
}

run();
