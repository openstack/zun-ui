/**
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  'use strict';

  /**
   * @ngdoc overview
   * @ngname horizon.dashboard.container.containers.actions
   *
   * @description
   * Provides all of the actions for containers.
   */
  angular.module('horizon.dashboard.container.containers.actions', ['horizon.framework', 'horizon.dashboard.container'])
   .run(registerContainerActions);

  registerContainerActions.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'horizon.framework.util.i18n.gettext',
    'horizon.dashboard.container.containers.create.service',
    'horizon.dashboard.container.containers.delete.service',
    'horizon.dashboard.container.containers.start.service',
    'horizon.dashboard.container.containers.stop.service',
    'horizon.dashboard.container.containers.reboot.service',
    'horizon.dashboard.container.containers.pause.service',
    'horizon.dashboard.container.containers.unpause.service',
    'horizon.dashboard.container.containers.resourceType',
  ];

  function registerContainerActions(
    registry,
    gettext,
    createContainerService,
    deleteContainerService,
    startContainerService,
    stopContainerService,
    rebootContainerService,
    pauseContainerService,
    unpauseContainerService,
    resourceType)
  {
    var containersResourceType = registry.getResourceType(resourceType);
    containersResourceType.itemActions
      .append({
        id: 'startContainerAction',
        service: startContainerService,
        template: {
          text: gettext('Start Container')
        }
      })
      .append({
        id: 'stopContainerAction',
        service: stopContainerService,
        template: {
          text: gettext('Stop Container')
        }
      })
      .append({
        id: 'rebootContainerAction',
        service: rebootContainerService,
        template: {
          text: gettext('Reboot Container')
        }
      })
      .append({
        id: 'pauseContainerAction',
        service: pauseContainerService,
        template: {
          text: gettext('Pause Container')
        }
      })
      .append({
        id: 'unpauseContainerAction',
        service: unpauseContainerService,
        template: {
          text: gettext('Unpause Container')
        }
      })
      .append({
        id: 'deleteContainerAction',
        service: deleteContainerService,
        template: {
          type: 'delete',
          text: gettext('Delete Container')
        }
      });

    containersResourceType.batchActions
      .append({
        id: 'createContainerAction',
        service: createContainerService,
        template: {
          type: 'create',
          text: gettext('Create Container')
        }
      })
      .append({
        id: 'batchDeleteContainerAction',
        service: deleteContainerService,
        template: {
          type: 'delete-selected',
          text: gettext('Delete Containers')
        }
      });
  }

})();
