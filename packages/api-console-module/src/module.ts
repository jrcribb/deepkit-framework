import { createModule, findParentPath } from '@deepkit/app';
import { HttpRouteFilter, registerStaticHttpController } from '@deepkit/http';
import { ApiConsoleApi } from '@deepkit/api-console-gui/src/api';
import { config } from './module.config';
import { rpc } from '@deepkit/rpc';
import { ApiConsoleController } from './controller';

export class ApiConsoleModule extends createModule({
    config,
}, 'apiConsole') {
    protected routeFilter = new HttpRouteFilter().excludeRoutes({group: 'app-static'});

    filter(cb: (filter: HttpRouteFilter) => any): this {
        cb(this.routeFilter);
        return this;
    }

    process() {
        this.addProvider({provide: HttpRouteFilter, useValue: this.routeFilter});

        if (!this.config.listen) {
            @rpc.controller(ApiConsoleApi)
            class NamedController extends ApiConsoleController {
            }

            this.addController(NamedController);
            return;
        }

        const controllerName = '.deepkit/api-console/' + this.config.path;

        @rpc.controller(controllerName)
        class NamedController extends ApiConsoleController {
        }

        this.addController(NamedController);

        const localPath = findParentPath('node_modules/@deepkit/api-console-gui/dist/api-console-gui', __dirname);
        if (!localPath) throw new Error('node_modules/@deepkit/api-console-gui not installed in ' + __dirname);

        registerStaticHttpController(this, {
            path: this.config.path,
            localPath,
            groups: ['app-static'],
            controllerName: 'ApiConsoleController',
            indexReplace: {
                APP_CONTROLLER_NAME: controllerName
            }
        });
    }
}
