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
   * @ngname horizon.dashboard.container.capsules.details
   *
   * @description
   * Provides details features for capsule.
   */
  angular.module('horizon.dashboard.container.capsules.details',
                 ['horizon.framework.conf', 'horizon.app.core'])
  .run(registerDetails);

  registerDetails.$inject = [
    'horizon.dashboard.container.capsules.basePath',
    'horizon.dashboard.container.capsules.resourceType',
    'horizon.dashboard.container.capsules.service',
    'horizon.framework.conf.resource-type-registry.service'
  ];

  function registerDetails(
    basePath,
    resourceType,
    capsuleService,
    registry
  ) {
    registry.getResourceType(resourceType)
      .setLoadFunction(capsuleService.getCapsulePromise)
      .detailsViews
      .append({
        id: 'capsuleDetailsOverview',
        name: gettext('Overview'),
        template: basePath + 'details/overview.html'
      });
  }
})();
