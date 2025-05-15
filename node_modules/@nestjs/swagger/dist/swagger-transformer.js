"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerTransformer = void 0;
const lodash_1 = require("lodash");
const sort_object_lexicographically_1 = require("./utils/sort-object-lexicographically");
class SwaggerTransformer {
    normalizePaths(denormalizedDoc) {
        const roots = (0, lodash_1.filter)(denormalizedDoc, (r) => r.root);
        const groupedByPath = (0, lodash_1.groupBy)(roots, ({ root }) => root.path);
        const paths = (0, lodash_1.mapValues)(groupedByPath, (routes) => {
            const keyByMethod = (0, lodash_1.keyBy)(routes, ({ root }) => root.method);
            return (0, lodash_1.mapValues)(keyByMethod, (route) => {
                const mergedDefinition = Object.assign(Object.assign({}, (0, lodash_1.omit)(route, 'root')), (0, lodash_1.omit)(route.root, ['method', 'path']));
                return (0, sort_object_lexicographically_1.sortObjectLexicographically)(mergedDefinition);
            });
        });
        return {
            paths
        };
    }
    unescapeColonsInPath(app, moduleRoutes) {
        const httpAdapter = app.getHttpAdapter();
        const usingFastify = httpAdapter && httpAdapter.getType() === 'fastify';
        const unescapeColon = usingFastify
            ? (path) => path.replace(/:\{([^}]+)\}/g, ':$1')
            : (path) => path.replace(/\[:\]/g, ':');
        return moduleRoutes.map((moduleRoute) => (Object.assign(Object.assign({}, moduleRoute), { root: Object.assign(Object.assign({}, moduleRoute.root), { path: unescapeColon(moduleRoute.root.path) }) })));
    }
}
exports.SwaggerTransformer = SwaggerTransformer;
