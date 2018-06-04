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
  angular.module('horizon.dashboard.container.containers.actions',
    [
      'horizon.framework',
      'horizon.dashboard.container'
    ])
    .run(registerContainerActions);

  registerContainerActions.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'horizon.framework.util.i18n.gettext',
    'horizon.dashboard.container.containers.create.service',
    'horizon.dashboard.container.containers.update.service',
    'horizon.dashboard.container.containers.delete.service',
    'horizon.dashboard.container.containers.delete-force.service',
    'horizon.dashboard.container.containers.delete-stop.service',
    'horizon.dashboard.container.containers.start.service',
    'horizon.dashboard.container.containers.stop.service',
    'horizon.dashboard.container.containers.restart.service',
    'horizon.dashboard.container.containers.rebuild.service',
    'horizon.dashboard.container.containers.pause.service',
    'horizon.dashboard.container.containers.unpause.service',
    'horizon.dashboard.container.containers.execute.service',
    'horizon.dashboard.container.containers.kill.service',
    'horizon.dashboard.container.containers.refresh.service',
    'horizon.dashboard.container.containers.manage-security-groups.service',
    'horizon.dashboard.container.containers.resourceType'
  ];

  function registerContainerActions(
    registry,
    gettext,
    createContainerService,
    updateContainerService,
    deleteContainerService,
    deleteContainerForceService,
    deleteContainerStopService,
    startContainerService,
    stopContainerService,
    restartContainerService,
    rebuildContainerService,
    pauseContainerService,
    unpauseContainerService,
    executeContainerService,
    killContainerService,
    refreshContainerService,
    manageSecurityGroupService,
    resourceType
  ) {
    var containersResourceType = registry.getResourceType(resourceType);

    containersResourceType.globalActions
      .append({
        id: 'createContainerAction',
        service: createContainerService,
        template: {
          type: 'create',
          text: gettext('Create Container')
        }
      });

    containersResourceType.batchActions
      .append({
        id: 'batchDeleteContainerAction',
        service: deleteContainerService,
        template: {
          type: 'delete-selected',
          text: gettext('Delete Containers')
        }
      });

    containersResourceType.itemActions
      .append({
        id: 'refreshContainerAction',
        service: refreshContainerService,
        template: {
          text: gettext('Refresh')
        }
      })
      .append({
        id: 'updateContainerAction',
        service: updateContainerService,
        template: {
          text: gettext('Update Container')
        }
      })
      .append({
        id: 'manageSecurityGroupService',
        service: manageSecurityGroupService,
        template: {
          text: gettext('Manage Security Groups')
        }
      })
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
        id: 'restartContainerAction',
        service: restartContainerService,
        template: {
          text: gettext('Restart Container')
        }
      })
      .append({
        id: 'rebuildContainerAction',
        service: rebuildContainerService,
        template: {
          text: gettext('Rebuild Container')
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
        id: 'executeContainerAction',
        service: executeContainerService,
        template: {
          text: gettext('Execute Command')
        }
      })
      .append({
        id: 'killContainerAction',
        service: killContainerService,
        template: {
          text: gettext('Send Kill Signal')
        }
      })
      .append({
        id: 'deleteContainerAction',
        service: deleteContainerService,
        template: {
          type: 'delete',
          text: gettext('Delete Container')
        }
      })
      .append({
        id: 'deleteContainerStopAction',
        service: deleteContainerStopService,
        template: {
          type: 'delete',
          text: gettext('Stop and Delete Container')
        }
      })
      .append({
        id: 'deleteContainerForceAction',
        service: deleteContainerForceService,
        template: {
          type: 'delete',
          text: gettext('Delete Container Forcely')
        }
      });
  }

})();
