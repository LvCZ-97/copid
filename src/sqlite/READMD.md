该库在`运行环境`中无法直接用 ESModule 的方式引入，因为 client/index.js 是用 commonjs 导出模块的

解决：

```js
const sqlite = require('~sqlite').default;
```

但是如果构建阶段输出是 commonjs 模块格式的话，没有此问题



如果需要导出类型，则：

```js
import { FilowDirItem } from '~sqlite';
```