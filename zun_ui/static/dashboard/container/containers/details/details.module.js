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
   * @ngname horizon.dashboard.container.containers.details
   *
   * @description
   * Provides details features for container.
   */
  angular.module('horizon.dashboard.container.containers.details',
                 ['horizon.framework.conf', 'horizon.app.core'])
  .run(registerDetails);

  registerDetails.$inject = [
    'horizon.app.core.openstack-service-api.zun',
    'horizon.dashboard.container.containers.basePath',
    'horizon.dashboard.container.containers.resourceType',
    'horizon.dashboard.container.containers.service',
    'horizon.framework.conf.resource-type-registry.service'
  ];

  function registerDetails(
    zun,
    basePath,
    resourceType,
    containerService,
    registry
  ) {
    registry.getResourceType(resourceType)
      .setLoadFunction(containerService.getContainerPromise)
      .detailsViews
      .append({
        id: 'containerDetailsOverview',
        name: gettext('Overview'),
        template: basePath + 'details/overview.html'
      });
    if (!zun.isAdmin()) {
      registry.getResourceType(resourceType)
        .detailsViews
        .append({
          id: 'containerDetailsLogs',
          name: gettext('Logs'),
          template: basePath + 'details/logs.html'
        })
        .append({
          id: 'containerDetailsConsole',
          name: gettext('Console'),
          template: basePath + 'details/console.html'
        });
    }
  }

})();
